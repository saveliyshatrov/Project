# Architecture

## Monorepo Structure

```
┌──────────────────────────────────────────────────────────────┐
│                        Monorepo Root                         │
│  (pnpm workspaces, ESLint flat config, Prettier, Husky)      │
├──────────────────┬──────────────────┬────────────────────────┤
│     Client       │      Shared      │       Server           │
│   (React 18)     │   (Webpack +     │     (Express)          │
│   Webpack 5      │    TypeScript)   │     ts-node-dev        │
│   Redux TK       │                  │     tsc                │
└────────┬─────────┴────────┬─────────┴───────────┬────────────┘
         │                  │                     │
    ┌────┴────┐             │                     │
    │         │             │                     │
  mobile   desktop          │                     │
  dist/    dist/            │                     │
    │         │             │                     │
    ▼         ▼             ▼                     ▼
  ESM ◄── dist/client/*.js  dist/server/*.cjs ─► CJS
```

## Dependency Graph

```
root (project)
├── devDependencies: concurrently, typescript, eslint, prettier, husky, lint-staged
│
├── client (workspace)
│   └── depends on → shared (workspace:*)
│
├── server (workspace)
│   └── depends on → shared (workspace:*)
│
└── shared (workspace)
    └── no internal workspace dependencies
```

Client and server are isolated from each other — they only communicate through the shared package and HTTP.

## Package Responsibilities

| Package | Role | Format |
|---------|------|--------|
| **shared** | Types, resolvers, utilities shared between client and server | Dual: ESM (client) + CJS (server) |
| **client** | React SPA with widget-based UI | Webpack bundles (mobile + desktop) |
| **server** | Express API + static file server | Node.js CommonJS |

## Data Flow

```
Route change
    │
    ▼
import '@widget/UserList'  (side-effect registration)
    │
    ▼
<Slot name="UserListWidget" />
    │
    ▼
registry.getWidget('UserListWidget')  (lazy, cached React.lazy)
    │
    ▼
Suspense triggers dynamic import → UserListWidget chunk loaded
    │
    ▼
widget.tsx → createWidgetShell() renders
    │
    ├── mount → show skeleton
    │
    ▼
controller({ ctx })
    │
    ├── ctx.page.pathname, searchParams, params
    │
    ▼
resolveUsers({ limit: 10 })        ← resolver (client stub)
    │
    ├── GET /resolver?resolver=resolveUsers&params=...
    │
    ▼
Server resolver registry lookup
    │
    ├── execute server-side function
    ├── normalize data into collections
    │
    ▼
JSON response: { users: { '1': {...}, '2': {...} } }
    │
    ▼
Widget receives result
    ├── data → merged into component props
    ├── collections → dispatched to Redux store
    └── showSkeleton = false → renders View
```

## Request Lifecycle

### Initial Page Load

```
Browser → Server (port 3001)
    │
    ├── Device detection (express-useragent)
    ├── SPA fallback: serve client/dist/{mobile|desktop}/index.html
    │
    ▼
Browser loads JS bundle
    │
    ├── React hydrates
    ├── Redux store initializes (empty)
    ├── Router matches current pathname
    ├── <Slot> components look up widgets in registry
    │
    ▼
Dynamic imports fetch widget chunks (webpackChunkName)
    │
    ├── widget.tsx → createWidgetShell mounts
    ├── controller fetches data via resolvers
    │
    ▼
Collections dispatched to Redux → Components re-render with data
```

### Resolver Request

```
Client resolver stub
    │
    ├── Serialize params → URL query string
    ├── GET /resolver?resolver=NAME&params=JSON
    │
    ▼
Server /resolver endpoint
    │
    ├── Look up resolver by name in resolverRegistry
    ├── Execute resolver function (ctx, params)
    ├── Return JSON (normalized collections)
    │
    ▼
Client receives collections
    │
    ├── If returned as collections → dispatch to Redux
    ├── If returned as data → merge into component props
```

## Platform-Specific Code Resolution

Both shared and client use file naming conventions to compile different code for different platforms.

### Shared Package (`*.client.ts` / `*.server.ts`)

| File Pattern | Compiled to | Description |
|-------------|-------------|-------------|
| `*.ts` | Both `dist/client/` and `dist/server/` | Shared code for all platforms |
| `*.client.ts` / `*.client.tsx` | `dist/client/` only | Browser-specific code |
| `*.server.ts` | `dist/server/` only | Node.js-specific code |

**How it works** (`shared/webpack.config.ts`):
```typescript
function getEntries(target: 'client' | 'server') {
    for (const file of allFiles) {
        const isClientFile = /\.client\.(ts|tsx)$/.test(file);
        const isServerFile = /\.server\.(ts|tsx)$/.test(file);

        if (target === 'client' && isServerFile) continue;
        if (target === 'server' && isClientFile) continue;

        let name = file
            .replace(/\.client\.(ts|tsx)$/, '')
            .replace(/\.server\.(ts|tsx)$/, '')
            .replace(/\.tsx?$/, '');

        entries[name] = `./src/${file}`;
    }
}
```

**Example:**
```typescript
// shared/src/resolver/examples.client.ts
export const NAME = 'CLIENT_NAME';

// shared/src/resolver/examples.server.ts
export const NAME = 'SERVER_NAME';
```

Both compile to `resolver/examples` in their respective output directories.

### Client Package (`*.mobile.tsx` / `*.desktop.tsx`)

| File | Used in mobile build | Used in desktop build |
|------|---------------------|----------------------|
| `App.tsx` | Yes (fallback) | Yes (fallback) |
| `App.mobile.tsx` | **Yes** (overrides App.tsx) | No |
| `App.desktop.tsx` | No | **Yes** (overrides App.tsx) |

**How it works** (`webpack.base.config.ts`):
```typescript
new webpack.NormalModuleReplacementPlugin(
    /^(.*\/)?([^/]+?)(\.tsx?|\.jsx?)$/,
    (resource) => {
        const platformFile = `${basename}.${platform}${ext}`;
        if (fs.existsSync(platformFile)) {
            resource.request = platformFile;
        }
    }
)
```

`resolve.extensions` prioritizes platform-specific extensions:
```typescript
extensions: ['.mobile.tsx', '.mobile.ts', '.tsx', '.ts', '.js', '.jsx', '.json']
```

## Module Resolution Strategy

### Shared Package Exports

`shared/package.json` uses conditional exports:

```json
{
  "exports": {
    ".": {
      "types": { "import": "./dist/client/index.d.ts", "require": "./dist/server/index.d.ts" },
      "import": "./dist/client/index.js",
      "require": "./dist/server/index.cjs"
    }
  }
}
```

| Condition | Used by |
|-----------|---------|
| `types.import` | Client TypeScript compiler |
| `types.require` | Server TypeScript compiler |
| `import` | Client webpack bundler (ESM) |
| `require` | Server Node.js runtime (CJS) |

Exports are auto-generated by `scripts/generate-exports.mjs`.

### Path Aliases

**Client** (`client/tsconfig.json`):
```json
{ "@*": ["src/*"] }
```
- `@store/*` → `src/store/*`
- `@widget/*` → `src/widget/*`
- `@config` → `src/config.ts`
- `shared/*` → resolves via package exports to `dist/client/*` (ESM)

**Server** (`server/tsconfig.json`):
```json
{ "shared": ["../shared/dist/server/index.cjs"], "shared/*": ["../shared/dist/server/*"], "@*": ["src/*"] }
```
- `shared` → `dist/server/index.cjs` (CJS)
- `shared/*` → `dist/server/*`

## Build Pipeline

### Shared Package (3 stages)

1. **Export Generation** — `scripts/generate-exports.mjs` scans `src/` for directories with `index.ts` and auto-generates `package.json` exports
2. **Webpack Compilation** — `webpack.config.ts` compiles twice (client ESM + server CJS) with different targets, externals, and output formats
3. **Type Distribution** — `scripts/distribute-types.mjs` runs `tsc --emitDeclarationOnly` → distributes `.d.ts` files to both `dist/client/` and `dist/server/` (stripping `.client.` / `.server.` suffixes)

### Client Package

- **Dev** — Custom Express server (`dev-server.ts`) runs webpack in watch mode for both mobile and desktop, serves correct `index.html` based on User-Agent. Watches `client/src/widget/` and regenerates widget `index.tsx` files on change.
- **Prod** — `webpack.prod.config.ts` builds mobile + desktop bundles to `client/dist/mobile/` and `client/dist/desktop/`. Prebuild step generates widget entries.

### Widget Generation

`client/scripts/generate-widget-entries.ts` scans `client/src/widget/*/widget.tsx`, derives widget name from directory name (`<DirName>Widget`), and generates `index.tsx` with `createWidget()` call including `webpackChunkName` magic comment.

- **Dev**: `fs.watch` in `dev-server.ts` triggers on `widget.tsx`, `controller.ts`, or `skeleton.tsx` changes
- **Build**: `prebuild` script in `client/package.json` runs before webpack

### Server Package

- **Dev** — `ts-node-dev` with auto-reload on port 3001
- **Prod** — `tsc` → `node dist/index.js`

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Webpack 5, Redux Toolkit, react-router v7 |
| **Backend** | Express, TypeScript, ts-node-dev, CORS, Swagger, express-useragent |
| **Shared** | Webpack 5 (dual-target), TypeScript |
| **Monorepo** | pnpm workspaces, concurrently |
| **Tooling** | ESLint v9 (flat config), Prettier, Husky, lint-staged, Jest, @testing-library/react, supertest |

## Testing

| Package | Environment | Framework |
|---------|-------------|-----------|
| **shared** | `node` | Jest + ts-jest |
| **server** | `node` | Jest + ts-jest + supertest |
| **client** | `jsdom` | Jest + ts-jest + @testing-library/react |

Run all tests: `pnpm run test`
