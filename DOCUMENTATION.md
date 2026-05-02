# Project Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Build System](#build-system)
  - [Shared Package](#shared-package)
  - [Client Package](#client-package)
  - [Server Package](#server-package)
- [Platform-Specific Builds (Client)](#platform-specific-builds-client)
- [Device Detection](#device-detection)
- [Platform-Specific Code Resolution (Shared)](#platform-specific-code-resolution-shared)
- [Type Distribution System](#type-distribution-system)
- [Package Exports and Module Resolution](#package-exports-and-module-resolution)
- [Server API](#server-api)
- [Client Application](#client-application)
  - [Components](#components)
  - [State Management](#state-management)
  - [Widget System](#widget-system)
- [Resolver System](#resolver-system)
  - [createResolver](#createresolver)
  - [normalize](#normalize)
  - [Example Resolver](#example-resolver)
- [Shared Modules](#shared-modules)
- [Linting and Formatting](#linting-and-formatting)
- [Scripts Reference](#scripts-reference)
- [Dependency Graph](#dependency-graph)
- [Development Workflow](#development-workflow)

---

## Project Overview

A full-stack monorepo application with shared type-safe code between a React frontend and an Express backend. The project uses npm workspaces to manage three packages: `client`, `server`, and `shared`.

Key features:
- **Platform-specific client builds** — separate mobile and desktop bundles built from the same source
- **Automatic device detection** — server routes users to the correct bundle based on User-Agent
- **Dual-format shared package** — ES modules for client, CommonJS for server
- **Automatic type distribution** — platform-specific TypeScript declarations

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Monorepo Root                          │
│  (npm workspaces, ESLint flat config, Prettier, Husky)       │
├──────────────────┬──────────────────┬────────────────────────┤
│     Client       │      Shared      │       Server           │
│   (React 18)     │   (Webpack +     │     (Express)          │
│   Webpack 5      │    TypeScript)   │     ts-node-dev        │
│   Redux TK       │                  │     tsc                │
└────────┬─────────┴────────┬─────────┴──────────┬─────────────┘
         │                  │                     │
    ┌────┴────┐             │                     │
    │         │             │                     │
  mobile   desktop          │                     │
  dist/    dist/            │                     │
    │         │             │                     │
    ▼         ▼             ▼                     ▼
  ESM ◄── dist/client/*.js  dist/server/*.cjs ─► CJS
```

The `shared` package produces two outputs:
- `dist/client/` — ES modules (`.js`) for browser
- `dist/server/` — CommonJS (`.cjs`) for Node.js

Conditional exports in `shared/package.json` route imports automatically.

## Directory Structure

```
Project/
├── package.json                  # Root workspace config
├── tsconfig.json                 # Base TypeScript configuration
├── .prettierrc.json              # Code formatting rules (4 spaces, single quotes)
├── .editorconfig                 # Editor-agnostic formatting
├── eslint.config.js              # ESLint v9 flat config (root-level)
├── .husky/
│   └── pre-commit                # Runs lint-staged on commit
│
├── client/                       # React frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.base.config.ts    # Platform-aware config factory
│   ├── webpack.dev.config.ts     # Dev config (mobile only)
│   ├── webpack.prod.config.ts    # Production (mobile + desktop)
│   ├── dev-server.mjs            # Custom Express dev server
│   ├── public/
│   │   └── index.html            # HTML template
│   └── src/
│       ├── index.tsx             # Application entry point
│       ├── App.tsx               # Base App component (fallback)
│       ├── App.mobile.tsx        # Mobile-specific App
│       ├── App.desktop.tsx       # Desktop-specific App
│       ├── config.ts             # Environment flags (CLIENT)
│       ├── store/
│       │   ├── index.ts          # Redux store setup
│       │   └── collectionsSlice.ts  # Collections state slice
│       └── widget/
│           ├── index.tsx         # createWidget factory
│           ├── RegisterForm.tsx  # User registration form
│           └── example.tsx       # Example widget implementation
│
├── server/                       # Express backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.mts         # Server-specific ESLint config
│   └── src/
│       ├── index.ts              # Express app + API endpoints
│       └── swagger.ts            # Swagger/OpenAPI spec
│
└── shared/                       # Shared code (client + server)
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.types.json       # Declaration-only compilation
    ├── webpack.config.ts         # Dual-target webpack build
    ├── scripts/
    │   ├── generate-exports.mjs  # Auto-generates package.json exports
    │   ├── distribute-types.mjs  # Type declaration distribution
    │   └── watch-types.mjs       # Watch mode for type distribution
    └── src/
        ├── index.ts              # Shared re-exports
        ├── auth/
        │   └── index.ts          # Auth interfaces (RegisterRequest, AuthResponse)
        ├── constants/
        │   └── index.ts          # Constants, types, helpers
        ├── resolver/
        │   ├── index.ts          # Resolver re-exports
        │   ├── createResolver.ts # Resolver factory
        │   ├── example.ts        # Example resolver
        │   ├── normalize.ts      # Data normalization utility
        │   ├── examples.client.ts # Client-only export
        │   └── examples.server.ts # Server-only export
        └── utils/
            ├── index.ts          # Utils re-exports
            └── getDeviceType.ts  # DeviceType enum
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Webpack 5, Redux Toolkit, react-router-dom v7 |
| **Backend** | Express, TypeScript, ts-node-dev, CORS, Swagger, express-useragent |
| **Shared** | Webpack 5 (dual-target), TypeScript |
| **Monorepo** | npm workspaces, concurrently |
| **Tooling** | ESLint v9 (flat config), Prettier, Husky, lint-staged |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Initial Setup

```bash
# Install all dependencies across workspaces
npm install

# Build shared package (required before client/server can import it)
npm run build --workspace=shared
```

### Development

```bash
# Start all dev servers concurrently
npm run dev
#   client:  http://localhost:3000 (custom Express dev server, mobile + desktop)
#   server:  http://localhost:3001 (Express API)
#   shared:  watch mode (webpack + types)

# Start individual packages:
npm run dev:client    # Custom dev server on port 3000 (both platforms)
npm run dev:server    # Express with ts-node-dev on port 3001
npm run dev:shared    # Webpack watch mode for shared
```

### Production Build

```bash
# Build everything (shared → client → server)
npm run build

# Or individually:
npm run build:shared   # Build shared (webpack + types)
npm run build:client   # Build client (webpack: mobile + desktop)
npm run build:server   # Build server (tsc)

# Start production server (serves both platforms on port 3001)
npm start
```

### Linting and Formatting

```bash
npm run lint              # Check all files
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Format all files with Prettier
npm run format:check      # Check formatting without modifying
```

### Cleanup

```bash
npm run clear             # Remove all node_modules and dist directories
```

## Build System

### Shared Package

The shared package has a multi-stage build process:

#### Stage 1: Export Generation

`scripts/generate-exports.mjs` scans `src/` for directories with `index.ts` files and auto-generates the `exports` field in `package.json`.

#### Stage 2: Webpack Compilation

`webpack.config.ts` compiles all source files twice — once for client, once for server:

| Setting | Client | Server |
|---------|--------|--------|
| `target` | `web` | `node` |
| `output.library.type` | `module` | `commonjs2` |
| `output.filename` | `[name].js` | `[name].cjs` |
| `experiments.outputModule` | `true` | `false` |
| `externals` | none | all node_modules (commonjs) |
| `externalsPresets.node` | `false` | `true` |

#### Stage 3: Type Declaration Distribution

`scripts/distribute-types.mjs` performs:

1. Runs `tsc --emitDeclarationOnly` to generate `.d.ts` files into `dist/_types/`
2. Walks the `_types` directory and distributes declarations:
   - Files without suffix → copied to both `dist/client/` and `dist/server/`
   - `*.client.d.ts` → copied to `dist/client/` (suffix stripped)
   - `*.server.d.ts` → copied to `dist/server/` (suffix stripped)
3. Cleans up `dist/_types/` temporary directory

**Commands:**

```bash
npm run build          # Full build: clean → gen:exports → webpack → types
npm run gen:exports    # Generate package.json exports field
npm run build:types    # Type generation and distribution only
npm run dev            # gen:exports → types → watch (webpack + tsc + distribute)
npm run clean          # rimraf dist
```

### Client Package

Uses Webpack 5 with a config factory pattern:

| File | Purpose |
|------|---------|
| `webpack.base.config.ts` | Config factory: generates platform-specific configs with NormalModuleReplacementPlugin for `.mobile.tsx` / `.desktop.tsx` resolution |
| `webpack.dev.config.ts` | Dev: single config for mobile platform |
| `webpack.prod.config.ts` | Production: array of configs for mobile + desktop |
| `dev-server.mjs` | Custom Express dev server that watches and serves both platforms |

**Key features:**
- Entry: `./src/index.tsx`
- TypeScript: `ts-loader` with `transpileOnly: true`
- CSS: `style-loader` + `css-loader`
- Path aliases via `TsconfigPathsPlugin` (resolves `@store`, `@widget`, `@config`)
- `process.env.CLIENT` and `process.env.PLATFORM` set via `DefinePlugin`
- `NormalModuleReplacementPlugin` replaces `App.tsx` with `App.mobile.tsx` or `App.desktop.tsx`

**Development server** (`dev-server.mjs`):
- Single Express server on port 3000
- Runs webpack in watch mode for both mobile and desktop
- Serves static files from `dist/mobile` and `dist/desktop`
- Detects device type via User-Agent and serves the correct `index.html`

### Server Package

Uses TypeScript compiler directly (no webpack):

| Setting | Value |
|---------|-------|
| `module` | `commonjs` |
| `moduleResolution` | `node` |
| `outDir` | `./dist` |
| `rootDir` | `./src` |

**Dev:** `ts-node-dev --respawn --transpile-only src/index.ts`
**Prod:** `tsc` then `node dist/index.js`

## Platform-Specific Builds (Client)

The client builds separate bundles for mobile and desktop platforms from the same source code.

### File Naming Convention

| File | Used in mobile build | Used in desktop build |
|------|---------------------|----------------------|
| `App.tsx` | Yes (fallback) | Yes (fallback) |
| `App.mobile.tsx` | **Yes** (overrides App.tsx) | No |
| `App.desktop.tsx` | No | **Yes** (overrides App.tsx) |

When both `App.tsx` and `App.mobile.tsx` exist, the mobile build uses `App.mobile.tsx` and the desktop build uses `App.tsx` (unless `App.desktop.tsx` also exists).

### How It Works

`webpack.base.config.ts` uses `webpack.NormalModuleReplacementPlugin` to intercept module resolution:

```typescript
new webpack.NormalModuleReplacementPlugin(
    /^(.*\/)?([^/]+?)(\.tsx?|\.jsx?)$/,
    (resource) => {
        // Check if a platform-specific file exists
        const platformFile = `${basename}.${platform}${ext}`;
        if (fs.existsSync(platformFile)) {
            resource.request = platformFile;
        }
    }
)
```

Additionally, the `resolve.extensions` array prioritizes platform-specific extensions:
```typescript
extensions: ['.mobile.tsx', '.mobile.ts', '.tsx', '.ts', '.js', '.jsx', '.json']
```

### Output Structure

```
client/dist/
├── mobile/
│   ├── index.html
│   ├── runtime.[hash].js
│   ├── [vendor].[hash].js
│   └── main.[hash].js          # Built with App.mobile.tsx
└── desktop/
    ├── index.html
    ├── runtime.[hash].js
    ├── [vendor].[hash].js
    └── main.[hash].js          # Built with App.desktop.tsx (or App.tsx)
```

## Device Detection

Both the dev server and production server automatically detect the client's device type and serve the appropriate bundle.

### Server-Side Detection

The server uses `express-useragent` middleware to parse the User-Agent header:

```typescript
app.use(expressUseragent.express());

function getDeviceType(req): 'mobile' | 'tablet' | 'desktop' {
    if (req.useragent?.isMobile) return 'mobile';
    if (req.useragent?.isTablet) return 'tablet';
    return 'desktop';
}
```

### Static File Serving

```typescript
app.use('/dist/mobile', express.static(path.join(__dirname, '../../client/dist/mobile')));
app.use('/dist/desktop', express.static(path.join(__dirname, '../../client/dist/desktop')));
```

### Fallback Route

```typescript
app.get('*', (req, res) => {
    const device = getDeviceType(req);
    res.sendFile(path.join(__dirname, `../../client/dist/${device}/index.html`));
});
```

### Device Detection Endpoint

`GET /device` returns detailed device information:

```json
{
    "type": "mobile",
    "platform": "iPhone",
    "browser": "Safari",
    "isMobile": true,
    "isTablet": false,
    "isDesktop": false,
    "source": "Mozilla/5.0 (iPhone...)"
}
```

### Shared DeviceType Enum

```typescript
// shared/src/utils/getDeviceType.ts
export const enum DeviceType {
    mobile = 'mobile',
    desktop = 'desktop',
}
```

Import: `import { DeviceType } from 'shared/utils/getDeviceType'`

## Platform-Specific Code Resolution (Shared)

Files in `shared/src/` follow a naming convention that determines which platforms they compile to:

| File Pattern | Compiled to | Description |
|-------------|-------------|-------------|
| `*.ts` | Both `dist/client/` and `dist/server/` | Shared code for all platforms |
| `*.client.ts` | `dist/client/` only | Browser-specific code |
| `*.client.tsx` | `dist/client/` only | Browser-specific React code |
| `*.server.ts` | `dist/server/` only | Node.js-specific code |

**How it works** (`shared/webpack.config.ts`):

```typescript
function getEntries(target: 'client' | 'server') {
    for (const file of allFiles) {
        const isClientFile = /\.client\.(ts|tsx)$/.test(file);
        const isServerFile = /\.server\.(ts|tsx)$/.test(file);

        // Filter by platform
        if (target === 'client' && isServerFile) continue;
        if (target === 'server' && isClientFile) continue;

        // Strip platform suffix for output name
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

Both files compile to `resolver/examples` in their respective output directories. When either client or server imports `shared/resolver/examples`, they receive their platform's version.

## Type Distribution System

The type distribution script ensures TypeScript declarations match the platform-specific JS output:

**Input** (from `tsc --emitDeclarationOnly`):
```
dist/_types/resolver/examples.client.d.ts
dist/_types/resolver/examples.server.d.ts
dist/_types/resolver/index.d.ts
dist/_types/constants/index.d.ts
```

**Output** (after distribution):
```
dist/client/resolver/examples.d.ts     # from examples.client.d.ts
dist/server/resolver/examples.d.ts     # from examples.server.d.ts
dist/client/resolver/index.d.ts        # from index.d.ts (shared)
dist/server/resolver/index.d.ts        # from index.d.ts (shared)
dist/client/constants/index.d.ts       # from index.d.ts (shared)
dist/server/constants/index.d.ts       # from index.d.ts (shared)
```

## Package Exports and Module Resolution

### Shared Package Exports

`shared/package.json` uses conditional exports to route imports to the correct platform:

```json
{
  "exports": {
    ".": {
      "types": { "import": "./dist/client/index.d.ts", "require": "./dist/server/index.d.ts" },
      "import": "./dist/client/index.js",
      "require": "./dist/server/index.cjs",
      "default": "./dist/client/index.js"
    },
    "./auth": { ... },
    "./constants": { ... },
    "./resolver": { ... },
    "./resolver/*": { ... },
    "./utils": { ... },
    "./utils/*": { ... }
  }
}
```

| Condition | Used by | Example |
|-----------|---------|---------|
| `types` | TypeScript compiler | IDE autocomplete, type checking |
| `import` | ES module imports | Client webpack bundler |
| `require` | CommonJS requires | Server Node.js runtime |
| `default` | Fallback | When no condition matches |

Exports are auto-generated by `scripts/generate-exports.mjs` based on directory structure.

### Client Module Resolution

`client/tsconfig.json` path aliases:

```json
{
  "paths": {
    "@*": ["src/*"]
  }
}
```

- `@store/*` → `src/store/*`
- `@widget/*` → `src/widget/*`
- `@config` → `src/config.ts`
- `shared/*` → resolves via package exports to `dist/client/*` (ESM)

### Server Module Resolution

`server/tsconfig.json` path aliases:

```json
{
  "paths": {
    "shared": ["../shared/dist/server/index.cjs"],
    "shared/*": ["../shared/dist/server/*"],
    "@*": ["src/*"]
  }
}
```

- `shared` → direct path to `dist/server/index.cjs` (CJS)
- `shared/*` → `dist/server/*`

## Server API

**Base URL:** `http://localhost:3001`

### Endpoints

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| `GET` | `/health` | Health check | — | `{ status, version, device, platform, browser }` |
| `GET` | `/device` | Device detection | — | `{ type, platform, browser, isMobile, isTablet, isDesktop, source }` |
| `GET` | `/users` | Get all users | — | `User[]` |
| `GET` | `/users/:id` | Get user by ID | — | `{ success, data }` or `{ success: false, error }` |
| `POST` | `/auth/register` | Register user | `{ name, email, password }` | `{ success, user }` or error |
| `POST` | `/users` | Create user | `{ name, email }` | `{ success, data }` |
| `GET` | `/api-docs` | Swagger UI | — | Swagger documentation |
| `GET` | `*` | SPA fallback | — | Platform-specific `index.html` |

### Static File Serving

| Route | Serves from |
|-------|-------------|
| `/dist/mobile/*` | `client/dist/mobile/` |
| `/dist/desktop/*` | `client/dist/desktop/` |

### CORS Configuration

| Setting | Value |
|---------|-------|
| Origin | `http://localhost:3000` |
| Methods | `GET`, `POST` |
| Headers | `Content-Type`, `Authorization` |

## Client Application

### Components

#### Entry Point (`src/index.tsx`)

```typescript
import { store } from '@store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);
```

#### App Component

| File | Purpose |
|------|---------|
| `App.tsx` | Base App component (used as fallback when no platform-specific file exists) |
| `App.mobile.tsx` | Mobile-specific App component |
| `App.desktop.tsx` | Desktop-specific App component |

The main component renders:
- Header with app version and platform info
- `ViewExample` widget
- `RegisterForm` widget
- User list with formatted user data

#### Configuration (`src/config.ts`)

```typescript
export const CLIENT = process.env.CLIENT;
```

Set via webpack `DefinePlugin` to `true` in the client build.

### State Management

**Store** (`src/store/index.ts`):

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { reducer as CollectionsReducer } from './collectionsSlice';

export const store = configureStore({
    reducer: { collections: CollectionsReducer },
});
```

**Collections Slice** (`src/store/collectionsSlice.ts`):

| Property | Type | Description |
|----------|------|-------------|
| State shape | `{ [key: string]: Record<string, unknown> }` | Dictionary of named collections |
| Initial state | `{}` | Empty object |
| `updateCollection` | `PayloadAction<CollectionState>` | Merges new collections into state |

### Widget System

The widget system provides a pattern for data-driven components with loading states.

#### createWidget Factory (`src/widget/index.tsx`)

```typescript
export const createWidget = <ComponentProps, DataProps, collectionsProps = CollectionState>({
    view: View,        // React component to render
    controller: Fn,    // Async function that fetches data
    skeleton: Skeleton // Optional loading placeholder component
}) => WidgetComponent
```

**Widget Lifecycle:**

1. Component mounts → `showSkeleton = true`, `showNothing = false`
2. `controller(props)` is called (once, via `useEffect([])`)
3. If controller returns `null` → `showNothing = true` → renders `null`
4. If controller succeeds:
   - `data` is merged into component props
   - `collections` are dispatched to Redux store via `updateCollection()`
   - `showSkeleton = false`
5. If controller throws → `showSkeleton = false`, `showNothing = true`

**Type Parameters:**

| Parameter | Description |
|-----------|-------------|
| `ComponentProps` | Props expected by the View component |
| `DataProps` | Props passed from parent to the widget |
| `collectionsProps` | Type of collections returned (defaults to `CollectionState`) |

#### Example Widget (`src/widget/example.tsx`)

```typescript
export const ViewExample = createWidget({
    view: ({ name, example }) => <div>name:{name} | example:{example}</div>,
    controller: async ({ example }) => {
        const name = await new Promise(res => setTimeout(() => res('Test name'), 5000));
        const userCollection = await resolverExample({ collectionName: 'users' });
        return {
            data: { example, name },
            collections: { userCollection, someCollection: { name: 'NAME', age: 999 } },
        };
    },
    skeleton: () => <div>--[{AUTHOR}]--</div>,
});
```

## Resolver System

The resolver system provides a unified pattern for data fetching that works on both client and server.

### createResolver

`shared/src/resolver/createResolver.ts`

A factory function that wraps data-fetching functions with platform context.

```typescript
export function createResolver<Params, CollectionType>(
    func: Func<Params, CollectionType>,
    options: ResolverOptions
): Runner<Params, CollectionType>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `func` | `(ctx, params) => Collections<CollectionType> | Promise<...>` | The data-fetching function |
| `options.name` | `string` | Resolver identifier |
| `options.sync` | `boolean` (optional) | If `true`, the runner is synchronous |

**Context (`ctx`):**

```typescript
{
    isServer: boolean;  // true on server, false on client
    [key: string]: any; // extensible
}
```

The `isServer` flag is determined by `!process.env.CLIENT`.

### normalize

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

### Example Resolver

`shared/src/resolver/example.ts`

```typescript
export const resolverExample = createResolver(
    async (ctx, params: ExampleParams) => {
        const users = await fetch('http://localhost:3001/users', { method: 'GET' })
            .then(response => response.json()) as User[];

        return normalize<User>((user) => user.id)(users, params.collectionName);
    },
    { name: 'resolverExample' }
);
```

On the client, this resolver fetches users from the server API and normalizes them into a collection.

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

## Linting and Formatting

### ESLint (v9 Flat Config)

Root config: `eslint.config.js`

| Plugin | Purpose |
|--------|---------|
| `@eslint/js` | Base recommended rules |
| `typescript-eslint` | TypeScript support |
| `eslint-plugin-react` | React rules |
| `eslint-plugin-react-hooks` | Hooks rules (rules-of-hooks, exhaustive-deps) |
| `eslint-plugin-import` | Import ordering and validation |

**Key Rules:**

| Rule | Setting |
|------|---------|
| `@typescript-eslint/no-unused-vars` | `error` (ignores `_` prefix) |
| `@typescript-eslint/no-explicit-any` | `warn` |
| `prefer-const` | `error` |
| `react/react-in-jsx-scope` | `off` |
| `react/prop-types` | `off` |
| `react-hooks/rules-of-hooks` | `error` |
| `react-hooks/exhaustive-deps` | `warn` |
| `import/order` | `error` (alphabetical, newlines between groups) |
| `import/no-duplicates` | `error` |

**Ignored:** `**/dist/**`, `**/node_modules/**`, `**/*.d.ts`, `shared/scripts/**`, `**/package-lock.json`

### Prettier

Config: `.prettierrc.json`

```json
{
    "trailingComma": "es5",
    "printWidth": 120,
    "singleQuote": true,
    "tabWidth": 4,
    "useTabs": false
}
```

### EditorConfig

Config: `.editorconfig`

| Setting | Value |
|---------|-------|
| `indent_style` | `space` |
| `indent_size` | `4` (2 for JSON/YAML) |
| `end_of_line` | `lf` |
| `charset` | `utf-8` |
| `trim_trailing_whitespace` | `true` (except Markdown) |
| `insert_final_newline` | `true` |

### Pre-commit Hooks

Husky + lint-staged runs on every commit:

| File Type | Actions |
|-----------|---------|
| `*.{js,mjs,cjs,ts,jsx,tsx}` | `eslint --fix` → `prettier --write` |
| `*.{json,css}` | `prettier --write` |

## Scripts Reference

### Root Package

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `concurrently "dev:client" "dev:server" "dev:shared"` | Start all dev servers |
| `dev:client` | `npm run dev --workspace=client` | Custom dev server (port 3000) |
| `dev:server` | `npm run dev --workspace=server` | Express with ts-node-dev (port 3001) |
| `dev:shared` | `npm run dev --workspace=shared` | Webpack watch mode |
| `build` | Build all workspaces in order | Shared → Client → Server |
| `build:client` | `npm run build --workspace=client` | Client production (mobile + desktop) |
| `build:server` | `npm run build --workspace=server` | Server compilation |
| `start` | `npm run start --workspace=server` | Run production server (port 3001) |
| `prepare` | `husky` | Install git hooks |
| `lint` | `eslint .` | Check all files |
| `lint:fix` | `eslint . --fix` | Auto-fix ESLint issues |
| `format` | `prettier --write` | Format all files |
| `format:check` | `prettier --check` | Check formatting |
| `clear` | `rm -rf` all node_modules and dist | Clean everything |

### Client Package

| Script | Command |
|--------|---------|
| `dev` | `node dev-server.mjs` |
| `build` | `webpack --mode production --config webpack.prod.config.ts` |
| `build:mobile` | `webpack --mode production --config webpack.prod.config.ts --config-name mobile` |
| `build:desktop` | `webpack --mode production --config webpack.prod.config.ts --config-name desktop` |

### Server Package

| Script | Command |
|--------|---------|
| `dev` | `ts-node-dev --respawn --transpile-only src/index.ts` |
| `build` | `tsc` |
| `start` | `node dist/index.js` |

### Shared Package

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `clean && gen:exports && webpack && build:types` | Full build |
| `gen:exports` | `node scripts/generate-exports.mjs` | Auto-generate package.json exports |
| `build:types` | `node scripts/distribute-types.mjs` | Generate + distribute types |
| `watch:types` | `tsc --project tsconfig.types.json --watch` | Watch type declarations |
| `dev` | `gen:exports && build:types && watch (tsc + distribute + webpack)` | Watch mode |
| `clean` | `rimraf dist` | Remove output |

## Dependency Graph

```
root (project)
├── devDependencies: concurrently, typescript, eslint, prettier, husky, lint-staged
│
├── client (workspace)
│   ├── dependencies: react, react-dom, react-router-dom, redux-toolkit, react-redux
│   ├── devDependencies: webpack, ts-loader, css-loader, html-webpack-plugin
│   └── depends on → shared (file:../shared)
│
├── server (workspace)
│   ├── dependencies: express, cors, swagger-ui-express, swagger-jsdoc, express-useragent
│   ├── devDependencies: ts-node-dev, typescript, @types/*
│   └── depends on → shared (file:../shared/dist/server)
│
└── shared (workspace)
    ├── devDependencies: webpack, ts-loader, typescript, glob, rimraf
    └── no internal workspace dependencies
```

**Data Flow:**

```
Client App (port 3000)
    │
    ├── imports shared/constants  ──► dist/client/constants/index.js (ESM)
    ├── imports shared/resolver   ──► dist/client/resolver/index.js (ESM)
    ├── imports shared/utils      ──► dist/client/utils/index.js (ESM)
    └── imports shared/auth       ──► dist/client/auth/index.js (ESM)
                                          │
                                          │ fetches
                                          ▼
                                      Server API (port 3001)
                                          │
                                          ├── imports shared  ──► dist/server/index.cjs (CJS)
                                          ├── imports shared/auth  ──► dist/server/auth/index.cjs (CJS)
                                          └── imports shared/resolver/examples  ──► dist/server/resolver/examples.cjs
```

## Development Workflow

### Adding a New Shared Module

1. Create file in `shared/src/`:
   - `shared/src/myModule.ts` → available on both platforms
   - `shared/src/myModule.client.ts` → client only
   - `shared/src/myModule.server.ts` → server only

2. If it's a new top-level directory, create `shared/src/myModule/index.ts` with exports

3. Rebuild shared: `npm run build --workspace=shared`

4. Import in client or server:
   ```typescript
   import { something } from 'shared';
   import { myModule } from 'shared/myModule';
   ```

### Adding a New Server Endpoint

1. Add route handler in `server/src/index.ts`
2. Use shared types: `import { User, ApiResponse } from 'shared'`
3. Add JSDoc `@openapi` block for Swagger documentation
4. Rebuild server: `npm run build --workspace=server`

### Adding a Platform-Specific Client Component

1. Create platform-specific file:
   - `src/Component.mobile.tsx` → mobile only
   - `src/Component.desktop.tsx` → desktop only
   - `src/Component.tsx` → both (fallback)

2. Import normally in other files:
   ```typescript
   import Component from './Component';
   ```

3. The build system automatically resolves to the correct file based on the platform being built.

### Adding a New Widget

1. Create widget file in `client/src/widget/`
2. Use `createWidget` factory with `view`, `controller`, and optional `skeleton`
3. Controller returns `{ data, collections }`
4. Collections are automatically dispatched to Redux
5. Import and use in `App.tsx` or other components

### Adding a New Redux Slice

1. Create slice file in `client/src/store/`
2. Add reducer to store in `client/src/store/index.ts`
3. Use `useSelector` and `useDispatch` in components

### Debugging Platform-Specific Issues

```bash
# Check what shared exports for each platform:
cat shared/dist/client/constants/index.js    # ESM output
cat shared/dist/server/constants/index.cjs   # CJS output

# Check type declarations:
cat shared/dist/client/constants/index.d.ts
cat shared/dist/server/constants/index.d.ts

# Verify package exports resolution:
node -e "console.log(require.resolve('shared', {paths: ['server/']}))"

# Check client dist output:
ls -la client/dist/mobile/
ls -la client/dist/desktop/
```
