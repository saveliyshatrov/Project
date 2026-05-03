# Project

Full-stack monorepo with a React frontend, Express backend, and shared type-safe code.

- **Client**: React 18 + Redux Toolkit + Webpack 5 — separate mobile/desktop bundles
- **Server**: Express + Swagger + device detection (routes to correct bundle by User-Agent)
- **Shared**: Dual-format builds — ESM for client, CJS for server

## Quick Start

```bash
# 1. Install and set up (installs deps + builds shared)
pnpm run prepare-dev

# 2. Build everything (shared → client → server)
pnpm run build

# 3. Start dev servers
pnpm run dev
```

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Auto-serves mobile or desktop bundle by User-Agent |
| Backend API | http://localhost:3001 | Includes Swagger at `/api-docs` |
| Device Info | http://localhost:3001/device | Returns detected device type |

## Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all dev servers (client, server, shared watch) with prefixed logging |
| `pnpm run build` | Build everything (shared → client → server) |
| `pnpm start` | Run production server (port 3001, serves both platforms) |
| `pnpm run lint` | Check code with ESLint |
| `pnpm run format` | Format code with Prettier |
| `pnpm run clear` | Remove all node_modules and dist directories |
| `pnpm run prepare-dev` | Install deps + build shared (bootstrap from scratch) |

## Project Structure

```
client/          # React frontend
  src/
    App.mobile.tsx     # Mobile-specific component (uses Slot)
    App.desktop.tsx    # Desktop-specific component (uses Slot)
    App.tsx            # Fallback (used if no platform-specific file)
    widget/            # Widget system
      index.tsx            # createWidget factory with WidgetCtx
      registry.ts          # Widget registry (registerWidget, getWidget, hasWidget)
      Slot.tsx             # Renders widget by name
      UserList.tsx         # User list widget
      UserDetail.tsx       # User detail widget
    store/             # Redux state management

server/          # Express backend
  src/
    index.ts           # API routes + resolver endpoint + static file serving
    swagger.ts         # OpenAPI documentation

shared/          # Shared code (client + server)
  src/
    constants/         # Types, constants, helpers
    resolver/          # Server-executed resolver system
      createResolver.client.ts  # Client stub (fetches from /resolver endpoint)
      createResolver.server.ts  # Server registry + execution engine
      createResolver.d.ts       # TypeScript types only
      examples.client.ts        # Client-only export
      examples.server.ts        # Server-only export
      normalize.ts      # Data normalization utility
      resolveUsers/     # Resolvers are folders with index files
        index.client.ts     # Client stub (fetches from /resolver)
        index.server.ts     # Server implementation (real logic)
        index.d.ts          # TypeScript types
      resolveUser/
        index.client.ts     # Client stub
        index.server.ts     # Server implementation
        index.d.ts          # TypeScript types
    utils/             # Utilities (DeviceType, etc.)
    auth/              # Auth interfaces
```

## Platform-Specific Files

**Client** uses `*.mobile.tsx` / `*.desktop.tsx` — both bundles build from the same source:

```
App.tsx           → used in both builds (fallback)
App.mobile.tsx    → used only in mobile build
App.desktop.tsx   → used only in desktop build
```

**Shared** uses `*.client.ts` / `*.server.ts` — strict client/server code isolation:

```
createResolver.client.ts  → dist/client/resolver/createResolver.js (fetch proxy, no server logic)
createResolver.server.ts  → dist/server/resolver/createResolver.cjs (registry + execution)
resolveUsers/index.client.ts  → dist/client/resolver/resolveUsers/index.js (stub only)
resolveUsers/index.server.ts  → dist/server/resolver/resolveUsers/index.cjs (real data + logic)
```

The webpack extension resolution ensures `.client.ts` files compile only to the client bundle and `.server.ts` files only to the server bundle. Server-side data **never** leaks into client bundles.

## Adding Shared Code

1. Create file in `shared/src/` (or a new subdirectory with `index.ts`)
2. Use platform suffixes when code differs: `.client.ts` for browser-only, `.server.ts` for Node-only
3. For resolvers, use a folder with `index.client.ts` / `index.server.ts` / `index.d.ts`
4. Rebuild: `pnpm --filter shared run build`
5. Import anywhere:

```typescript
import { User } from 'shared';
import { NAME } from 'shared/resolver/examples';
import { DeviceType } from 'shared/utils/getDeviceType';
import { resolveUsers } from 'shared/resolver/resolveUsers';
import { resolveUser } from 'shared/resolver/resolveUser';
```

## Widget System

Widgets are data-driven components built with the `createWidget` factory. Each widget has a `view` (React component), a `controller` (async data fetcher), and an optional `skeleton` (loading placeholder).

```typescript
// client/src/widget/UserList.tsx
export const UserListWidget = createWidget<Props, object>({
    view: UserList,
    name: 'UserList',
    controller: async () => {
        const users = await resolveUsers({ limit: 10 });
        return { data: { users: Object.values(users.users) } };
    },
    skeleton: () => <div>Loading...</div>,
});
```

### WidgetCtx

Controllers receive a `ctx` object with full page context:

```typescript
type WidgetCtx = {
    page: {
        pathname: string;
        search: string;
        searchParams: URLSearchParams;
        params: Record<string, string | undefined>;
    };
};

// Usage in controller:
controller: async ({ ctx }) => {
    const userId = ctx.page.params.userId;
    const query = ctx.page.searchParams.get('q');
    // ...
}
```

### Slot Component

Render widgets by name anywhere in the app:

```tsx
import { Slot } from '@widget/Slot';

// In routes:
<Route path="/users/:userId" element={<Slot name="UserDetail" />} />

// With fallback:
<Slot name="MyWidget" fallback={<div>Not found</div>} />
```

### Widget Lifecycle

1. Mount → show skeleton
2. `controller(props)` called with `ctx` (page info included)
3. Success → render view with fetched data, dispatch collections to Redux
4. Error → render null
5. Re-fetches on route change (`location.pathname`)

## Resolver System

Resolvers execute **only on the server**. The client receives a stub that makes a fetch to `/resolver`.

```typescript
// Client calls this — it fetches from the server
const result = await resolveUsers({ limit: 10 });

// Server executes the real resolver logic registered via createResolver
// Result is returned as JSON to the client
```

**Adding a new resolver:**

1. Create folder `shared/src/resolver/myResolver/` with three files:

   **`index.client.ts`** — client stub:
   ```typescript
   import { Collections } from '../normalize.js';
   import { createResolver } from '../createResolver';

   type MyParams = { filter?: string };

   export const myResolver = createResolver<MyParams, Collections<unknown>>(() => ({}), {
       name: 'myResolver',
   });
   ```

   **`index.server.ts`** — server implementation:
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

   **`index.d.ts`** — type declaration:
   ```typescript
   import { Collections } from '../normalize.js';
   type MyParams = { filter?: string };
   export declare const myResolver: (params: MyParams) => Promise<Collections<{ id: string }>>;
   ```

2. Re-export from `shared/src/resolver/index.ts`:
   ```typescript
   export * from './myResolver';
   ```

3. Rebuild: `pnpm --filter shared run build`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check + device info |
| `GET` | `/device` | Detailed device detection |
| `GET` | `/resolver?resolver=NAME&params=...` | Execute a registered resolver |
| `GET` | `/users` | List all users |
| `POST` | `/auth/register` | Register new user |
| `GET` | `/api-docs` | Swagger documentation |

## Full Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for architecture details, build system, widget system, resolver system internals, linting setup, and development workflow.
