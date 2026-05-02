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
| Frontend | http://localhost:3000 | Auto-serves mobile or desktop bundle |
| Backend API | http://localhost:3001 | Includes Swagger at `/api-docs` |
| Device Info | http://localhost:3001/device | Returns detected device type |

## Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all dev servers (client, server, shared watch) |
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
    App.mobile.tsx     # Mobile-specific component
    App.desktop.tsx    # Desktop-specific component
    App.tsx            # Fallback (used if no platform-specific file)
    widget/            # Reusable widget components
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
      resolveUsers.client.ts    # Client stub for resolveUsers
      resolveUsers.server.ts    # Server implementation of resolveUsers
      resolveUsers.d.ts         # TypeScript types for resolveUsers
      example.ts        # Example resolver (shared)
      normalize.ts      # Data normalization utility
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
resolveUsers.client.ts    → dist/client/resolver/resolveUsers.js (stub only, ~130 bytes)
resolveUsers.server.ts    → dist/server/resolver/resolveUsers.cjs (real data + logic)
```

The webpack extension resolution ensures `.client.ts` files compile only to the client bundle and `.server.ts` files only to the server bundle. Server-side data **never** leaks into client bundles.

## Adding Shared Code

1. Create file in `shared/src/` (or a new subdirectory with `index.ts`)
2. Use platform suffixes when code differs: `.client.ts` for browser-only, `.server.ts` for Node-only
3. Add `.d.ts` type declaration if the resolver is platform-split
4. Rebuild: `pnpm --filter shared run build`
5. Import anywhere:

```typescript
import { User } from 'shared';
import { NAME } from 'shared/resolver/example';
import { DeviceType } from 'shared/utils/getDeviceType';
import { resolveUsers } from 'shared/resolver/resolveUsers';
```

## Resolver System

Resolvers execute **only on the server**. The client receives a stub that makes a fetch to `/resolver`.

```typescript
// Client calls this — it fetches from the server
const result = await resolveUsers({ limit: 10 });

// Server executes the real resolver logic registered via createResolver
// Result is returned as JSON to the client
```

**Adding a new resolver:**

1. Create `shared/src/resolver/myResolver.client.ts` — client stub:
   ```typescript
   import { Collections } from './normalize.js';
   import { createResolver } from './createResolver';

   type MyResolverParams = { filter?: string };

   export const myResolver = createResolver<MyResolverParams, Collections<unknown>>(
       () => ({}),
       { name: 'myResolver' }
   );
   ```

2. Create `shared/src/resolver/myResolver.server.ts` — server implementation:
   ```typescript
   import { Collections, normalize } from './normalize.js';
   import { createResolver, resolverRegistry } from './createResolver';

   type MyResolverParams = { filter?: string };

   export const myResolver = createResolver<MyResolverParams, Collections<{ id: string }>>(
       async (ctx, params) => {
           const data = /* fetch from DB or API */;
           return normalize((item) => item.id)(data, 'myCollection');
       },
       { name: 'myResolver' }
   );

   resolverRegistry.set('myResolver', myResolver);
   ```

3. Create `shared/src/resolver/myResolver.d.ts` — type declaration:
   ```typescript
   import { Collections } from './normalize.js';
   type MyResolverParams = { filter?: string };
   export declare const myResolver: (params: MyResolverParams) => Promise<Collections<{ id: string }>>;
   ```

4. Re-export from `shared/src/resolver/index.ts`:
   ```typescript
   export { myResolver } from './myResolver';
   ```

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
