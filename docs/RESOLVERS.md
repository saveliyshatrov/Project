# Resolver System

All resolver logic executes **only on the server**. The client receives a lightweight stub that fetches from the `/resolver` endpoint, ensuring zero server-side code or data in client bundles.

## Architecture

```
Client                          Server
──────                          ──────
resolveUsers()                  resolveUsers()
    │   (stub: fetch)                │
    ├──────────────────────────────► │
    │   POST /resolver?resolver=...  │
    │   { params }                   │
    │                                ├──► execute registered resolver
    │                                ├──► normalize data
    │                                └──► return JSON
    │◄───────────────────────────────┤
    └─── Promise<Collections> ──────┘
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
1. Appends resolver name as a query parameter: `POST /resolver?resolver=NAME`
2. Serializes params into a JSON body
3. Returns the JSON response as `Promise<Collections<CollectionType>>`

The `func` argument is a stub (typically `() => ({})`) — it is never executed.

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
├── index.client.ts     # Client stub (fetches from /resolver)
├── index.server.ts     # Server implementation (real logic)
└── index.d.ts          # TypeScript types
```

**Client** (`resolveUsers/index.client.ts`):
```typescript
import { Collections } from '../normalize.js';
import { createResolver } from '../createResolver';

type ResolveUsersParams = { limit?: number; offset?: number; };

export const resolveUsers = createResolver<ResolveUsersParams, Collections<User>>(() => ({}), {
    name: 'resolveUsers',
});
```

**Server** (`resolveUsers/index.server.ts`):
```typescript
import { Collections, normalize } from '../normalize.js';
import { createResolver } from '../createResolver';

type ResolveUsersParams = { limit?: number; offset?: number; };

export const resolveUsers = createResolver<ResolveUsersParams, User>(
    async (ctx, params) => {
        const users = await fetch('http://localhost:3001/users').then((r) => r.json());
        const sliced = users.slice(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? users.length));
        return normalize((user) => user.id)(sliced, 'users');
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
import { Collections } from '../normalize.js';
import { createResolver } from '../createResolver';

export type ResolveUserParams = { id: string };

export const resolveUser = createResolver<ResolveUserParams, Collections<unknown>>(() => ({}), {
    name: 'resolveUser',
});
```

**Server** (`resolveUser/index.server.ts`):
```typescript
import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { normalize } from '../normalize';

export type ResolveUserParams = { id: string };

export const resolveUser = createResolver<ResolveUserParams, User>(
    async (ctx, params) => {
        const { user } = await fetch(`http://localhost:3001/users/${params.id}`).then((r) => r.json());
        return normalize((u) => u.id)([user], 'users');
    },
    { name: 'resolveUser' }
);
```

## Adding a New Resolver

Create a folder `shared/src/resolver/myResolver/` with three files:

1. **`index.client.ts`** — Client stub:
   ```typescript
   import { Collections } from '../normalize.js';
   import { createResolver } from '../createResolver';

   type MyParams = { filter?: string };

   export const myResolver = createResolver<MyParams, Collections<unknown>>(() => ({}), {
       name: 'myResolver',
   });
   ```

2. **`index.server.ts`** — Server implementation:
   ```typescript
   import { Collections, normalize } from '../normalize.js';
   import { createResolver } from '../createResolver';

   type MyParams = { filter?: string };

   export const myResolver = createResolver<MyParams, Collections<{ id: string }>>(
       async (ctx, params) => {
           const data = /* fetch from DB or API */;
           return normalize((item) => item.id)(data, 'myCollection');
       },
       { name: 'myResolver' }
   );
   ```

3. **`index.d.ts`** — Type declaration:
   ```typescript
   import { Collections } from '../normalize.js';
   type MyParams = { filter?: string };
   export declare const myResolver: (params: MyParams) => Promise<Collections<{ id: string }>>;
   ```

4. Re-export from `shared/src/resolver/index.ts`:
   ```typescript
   export * from './myResolver';
   ```

5. Rebuild: `pnpm --filter shared run build`

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


