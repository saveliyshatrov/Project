# Resolver System

All resolver logic executes **only on the server**. The client receives a lightweight stub that delegates to the batch endpoint, ensuring zero server-side code or data in client bundles.

## Architecture

All resolver calls from the client go through a **batch queue** that groups multiple calls within the same tick into a single HTTP request. The server also exposes an individual endpoint for direct calls.

### Client → Server (always batched)

Whether one or multiple resolvers are called, they are always enqueued and sent together:

```
Controller                          Server
────────                          ──────
resolveUsers({ limit: 10 })       resolveUsers()
resolveUser({ id: '5' })          resolveUser()
    │                                  │
    ├── both enqueued in batchQueue    │
    ├── setTimeout(flush, 0)           │
    │                                  │
    ▼  (next tick)                     │
POST /resolver/batch                  │
{ batch: [                            │
  { resolver: 'resolveUsers',         │
    params: { limit: 10 } },          │
  { resolver: 'resolveUser',          │
    params: { id: '5' } }             │
]}                                    │
    │                                  │
    │                                  ├──► resolveUsers (Promise.all)
    │                                  ├──► resolveUser
    │                                  └──► return array of results
    │◄─────────────────────────────────┤
    └── each promise resolved ────────┘
```

A single resolver call produces a batch of one element — the endpoint is always `/resolver/batch`.

### Server Direct Endpoint (for debugging / external use)

The server also exposes an individual endpoint, which is NOT used by the client but can be called directly:

```
curl -X POST 'http://localhost:3001/resolver?resolver=resolveUsers' \
  -H 'Content-Type: application/json' \
  -d '{"params":{"limit":10}}'
```

### Detailed Batching Flow

```
Controller calls:
  resolveUsers({ limit: 10 })
  resolveUser({ id: '5' })

         │
         ▼
  enqueueResolverCall('resolveUsers', { limit: 10 })
  enqueueResolverCall('resolveUser', { id: '5' })
         │
         ├── both pushed to batchQueue
         ├── setTimeout(flush, 0) scheduled once
         │
         ▼  (next tick)
  flush():
    ├── copy + clear batchQueue
    ├── fetch POST /resolver/batch
    │     { batch: [
    │       { resolver: 'resolveUsers', params: { limit: 10 } },
    │       { resolver: 'resolveUser', params: { id: '5' } }
    │     ]}
    │
    ▼
  response.json() → [usersResult, userResult]
    ├── resolve(usersResult)  → first  Promise
    └── resolve(userResult)   → second Promise
```

## createResolver

### Client Stub (`shared/src/resolver/createResolver.client.ts`)

```typescript
export function createResolver<Params, CollectionType>(
    func: Func<Params, CollectionType>,
    options: ResolverOptions
): Runner<Params, CollectionType>
```

The client version returns a runner that:
1. Enqueues the call via `enqueueResolverCall(name, params)` into the batch queue
2. All calls in the queue are flushed together via `setTimeout(fn, 0)` as a single `POST /resolver/batch` request
3. Returns a `Promise` that resolves with the deserialized result from the batch response array

The `func` argument is a stub (typically `() => ({})`) — it is never executed on the client.

**`resolverBatch.client.ts` (internal):**
```typescript
let batchQueue: BatchEntry[] = [];
let scheduled = false;

function flush(): void {
    // copy queue, send POST /resolver/batch, resolve/reject each promise
}

function scheduleFlush(): void {
    if (scheduled) return;
    scheduled = true;
    setTimeout(flush, 0);
}

export function enqueueResolverCall<Params, Result>(
    resolver: string,
    params: Params
): Promise<Result>;
```

### Server Implementation (`shared/src/resolver/createResolver.server.ts`)

```typescript
export const resolverRegistry = new Map<string, Resolver<any, any>>();

export function createResolver<Params, CollectionType>(
    func: Func<Params, CollectionType>,
    options: ResolverOptions
): Runner<Params, CollectionType>
```

The server version:
1. Wraps the provided `func` in a runner
2. Registers it in `resolverRegistry` by `options.name`
3. The `/resolver` endpoint looks up and executes resolvers from this registry

**Context (`ctx`):**
```typescript
{
    isServer: boolean;  // always true on server
    [key: string]: any; // extensible
}
```

## normalize

`shared/src/resolver/normalize.ts`

Converts an array of items into a keyed object (collection) for normalized state storage.

```typescript
export const normalize = <ArgumentType>(func: FuncNormalize<ArgumentType>) => {
    return (list: Array<ArgumentType>, collectionName: string) => {
        return {
            [collectionName]: list.reduce((acc, value) => {
                const key = func(value);
                acc[key] = value;
                return acc;
            }, {} as CollectionState<ArgumentType>),
        };
    };
};
```

**Usage:**
```typescript
const normalizeUser = normalize((user: User) => user.id);
const result = normalizeUser(usersArray, 'users');
// { users: { '1': { id: '1', name: '...', email: '...' }, '2': {...} } }
```

**Type Definitions:**
```typescript
type CollectionState<ElementType> = Record<string, ElementType>;
type Collections<Collection> = Record<string, CollectionState<Collection>>;
```

## Example Resolvers

### resolveUsers

**Structure:**
```
shared/src/resolver/resolveUsers/
├── index.client.ts     # Client stub (delegates to batch)
├── index.server.ts     # Server implementation (real logic)
└── index.d.ts          # TypeScript types
```

**Client** (`resolveUsers/index.client.ts`):
```typescript
import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { Collections } from '../normalize';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export const resolveUsers = createResolver<ResolveUsersParams, Collections<User, 'users'>>(() => ({}), {
    name: 'resolveUsers',
});
```

**Server** (`resolveUsers/index.server.ts`):
```typescript
import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { normalize } from '../normalize';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export const resolveUsers = createResolver<ResolveUsersParams, User>(
    async (ctx, params) => {
        const users = await fetch('http://localhost:3001/users').then((response) => response.json());

        const offset = params.offset ?? 0;
        const limit = params.limit ?? users.length;
        const sliced = users.slice(offset, offset + limit);

        return normalize<User>((user) => user.id)(sliced, 'users');
    },
    { name: 'resolveUsers' }
);
```

**Types** (`resolveUsers/index.d.ts`):
```typescript
import { Collections } from '../normalize.js';
import { User } from '../../constants';

type ResolveUsersParams = { limit?: number; offset?: number; };
export declare const resolveUsers: (params: ResolveUsersParams) => Promise<Collections<User>>;
```

### resolveUser

**Structure:**
```
shared/src/resolver/resolveUser/
├── index.client.ts
├── index.server.ts
└── index.d.ts
```

**Client** (`resolveUser/index.client.ts`):
```typescript
import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { Collections } from '../normalize';

export type ResolveUserParams = {
    id: string;
};

export const resolveUser = createResolver<ResolveUserParams, Collections<User, 'users'>>(() => ({}), {
    name: 'resolveUser',
});
```

**Server** (`resolveUser/index.server.ts`):
```typescript
import { z } from 'zod';

import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { normalize } from '../normalize';

export const UserIdParamSchema = z.object({
    id: z.string().min(1),
});

export type ResolveUserParams = {
    id: string;
};

export const resolveUser = createResolver<ResolveUserParams, User>(
    async (ctx, params) => {
        const { user } = await fetch(`http://localhost:3001/users/${params.id}`).then((response) => response.json());

        if (!user) {
            return {
                users: {},
            };
        }

        return normalize<User>((user) => user.id)([user], 'users');
    },
    { name: 'resolveUser' },
    UserIdParamSchema
);
```

## Adding a New Resolver

Create a folder `shared/src/resolver/myResolver/` with three files:

1. **`index.client.ts`** — Client stub (creates a resolver that will use batch endpoint):
   ```typescript
   import { createResolver } from '../createResolver';

   type MyParams = { filter?: string };

   export const myResolver = createResolver<MyParams, unknown>(() => ({}), {
       name: 'myResolver',
   });
   ```

   > The client stub is identical for all resolvers. The `func` argument is a no-op — real logic runs on the server. Multiple calls to `myResolver()` in the same tick are automatically batched into a single HTTP request.

2. **`index.server.ts`** — Server implementation:
   ```typescript
   import { createResolver } from '../createResolver';
   import { normalize } from '../normalize';

   type MyParams = { filter?: string };

   export const myResolver = createResolver<MyParams, { id: string }>(
       async (ctx, params) => {
           const data = /* fetch from DB or API */;
           return normalize((item) => item.id)(data, 'myCollection');
       },
       { name: 'myResolver' }
   );
   ```

3. **`index.d.ts`** — Type declaration:
   ```typescript
   type MyParams = { filter?: string };
   export declare const myResolver: (params: MyParams) => Promise<unknown>;
   ```

4. Re-export from `shared/src/resolver/index.ts`:
   ```typescript
   export * from './myResolver';
   ```

5. Rebuild: `pnpm --filter shared run build`

### Batching Behavior

Batching is **automatic and transparent** — no special setup is needed. When a controller or component calls multiple resolvers:

```typescript
// These two calls are automatically batched into one HTTP request
const [users, user] = await Promise.all([
    resolveUsers({ limit: 10 }),
    resolveUser({ id: '5' }),
]);
```

The batch is flushed on the next tick via `setTimeout(fn, 0)`. If only one resolver is called, a single-element batch request is sent.

## Resolver Batching (Client)

Multiple resolver calls within the same tick are **automatically batched** into a single HTTP request on the client side. This eliminates redundant network round-trips when several resolvers are called together.

### How It Works

```
Controller                          Server
────────                          ──────
resolveUsers({ limit: 10 })       resolveUsers()
resolveUser({ id: '5' })          resolveUser()
    │                                  │
    ├── batched together ────────────► │
    │   POST /resolver/batch           │
    │   { batch: [...] }               │
    │                                  ├──► execute all resolvers
    │                                  │    (in parallel via Promise.all)
    │                                  └──► return array of results
    │◄─────────────────────────────────┤
    └── each promise resolved ────────┘
```

### Implementation Details

- Resolver calls are queued via `setTimeout(fn, 0)` and flushed in the next tick
- All queued resolvers are sent as a single `POST /resolver/batch` request
- The server executes them in parallel (`Promise.all`) and returns an ordered array
- Each client-side promise resolves with its corresponding result from the array

### Batch Endpoint

`POST /resolver/batch`

**Request body (JSON):**
```json
{
    "batch": [
        { "resolver": "resolveUsers", "params": { "limit": 10 } },
        { "resolver": "resolveUser", "params": { "id": "5" } }
    ]
}
```

**Response:**
```json
[
    { "users": { "1": { ... }, "2": { ... } } },
    { "users": { "5": { ... } } }
]
```

Responses are returned in the same order as the batch entries.

### Error Handling

If one resolver in the batch fails, its entry in the response array contains an `error` field. Other resolvers still execute normally. If the entire HTTP request fails, all batched promises reject.

## Resolver Endpoint

`POST /resolver?resolver=resolveUsers`

**Query parameters:**

| Param | Description |
|-------|-------------|
| `resolver` | Name of the resolver to execute (must be registered) |

**Request body (JSON):**
```json
{
    "params": { "limit": 10, "offset": 0 }
}
```

| Field | Description |
|-------|-------------|
| `params` | Optional params object for the resolver |

**Response:**
```json
{
    "collectionName": {
        "id1": { "id": "id1", ... },
        "id2": { "id": "id2", ... }
    }
}
```


