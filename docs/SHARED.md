# Shared Package

The shared package produces two outputs:
- `dist/client/` — ES modules (`.js`) for browser
- `dist/server/` — CommonJS (`.cjs`) for Node.js

Conditional exports in `shared/package.json` route imports automatically. See [ARCHITECTURE.md](./ARCHITECTURE.md#shared-package-exports) for resolution details.

## Build System

### Stage 1: Export Generation

`scripts/generate-exports.mjs` scans `src/` for directories with `index.ts` files and auto-generates the `exports` field in `package.json`.

### Commands

```bash
pnpm --filter shared run build                          # Full build: clean → gen:exports → webpack → types
pnpm --filter shared run gen:exports                    # Generate package.json exports field
pnpm --filter shared run build:types                    # Type generation and distribution only
pnpm --filter shared run dev                            # gen:exports → types → watch (webpack + tsc + distribute)
pnpm --filter shared run clean                          # rimraf dist
```

See [ARCHITECTURE.md](./ARCHITECTURE.md#platform-specific-code-resolution) for platform-specific file naming conventions and [ARCHITECTURE.md](./ARCHITECTURE.md#build-pipeline) for the full build pipeline.

## Shared Modules

### Constants (`shared/src/constants/index.ts`)

| Export | Type | Value/Description |
|--------|------|-------------------|
| `AUTHOR` | `string` | `"SAV"` |
| `VERSION` | `string` | `"1.0.0"` |
| `User` | `interface` | `{ id: string, name: string, email: string }` |
| `ApiResponse<T>` | `interface` | `{ success: boolean, data?: T, error?: string }` |
| `formatUser(user)` | `function` | Returns `"Name <email> (ID: id)"` |

### Auth (`shared/src/auth/index.ts`)

| Export | Type | Description |
|--------|------|-------------|
| `RegisterRequest` | `interface` | `{ name: string, email: string, password: string }` |
| `AuthResponse` | `interface` | `{ success: boolean, user?: User, error?: string, token?: string }` |

### Utils (`shared/src/utils/index.ts`)

| Export | Type | Description |
|--------|------|-------------|
| `DeviceType` | `enum` | `{ mobile: 'mobile', desktop: 'desktop' }` |

### Index (`shared/src/index.ts`)

Re-exports for convenience:

```typescript
export interface User { ... }
export interface ApiResponse<T> { ... }
export function formatUser(user: User): string { ... }
export const VERSION = '1.0.0';
```

This allows `import { User, formatUser, VERSION } from 'shared'`.

## Adding Shared Code

1. Create file in `shared/src/`:
   - `shared/src/myModule.ts` → available on both platforms
   - `shared/src/myModule.client.ts` → client only
   - `shared/src/myModule.server.ts` → server only

2. If it's a new top-level directory, create `shared/src/myModule/index.ts` with exports

3. For resolvers, create a folder `shared/src/resolver/myResolver/` with three files:
   - `index.client.ts` → client stub
   - `index.server.ts` → server implementation
   - `index.d.ts` → TypeScript types

4. Rebuild shared: `pnpm --filter shared run build`

5. Import in client or server:
   ```typescript
   import { something } from 'shared';
   import { myModule } from 'shared/myModule';
   import { myResolver } from 'shared/resolver/myResolver';
   ```
