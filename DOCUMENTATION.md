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
- [Platform-Specific Code Resolution](#platform-specific-code-resolution)
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
- [Scripts Reference](#scripts-reference)
- [Dependency Graph](#dependency-graph)
- [Development Workflow](#development-workflow)

---

## Project Overview

A full-stack monorepo application demonstrating shared type-safe code between a React frontend and an Express backend. The project uses npm workspaces to manage three packages: `client`, `server`, and `shared`. The key feature is a platform-specific build system that compiles shared code into separate client (ES modules) and server (CommonJS) outputs, with automatic type declaration distribution.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Monorepo Root                     │
│  (npm workspaces, shared configs, concurrent dev)   │
├──────────────┬──────────────────┬───────────────────┤
│   Client     │      Shared      │      Server       │
│  (React 18)  │   (Webpack +     │    (Express)      │
│  Webpack 5   │    TypeScript)   │    ts-node-dev    │
│  Redux TK    │                  │    tsc            │
└──────────────┴──────────────────┴───────────────────┘
       │                  │                  │
       │    ┌─────────────┼─────────────┐     │
       ▼    ▼             ▼             ▼     ▼
   ESM imports ◄── dist/client/*.js  dist/server/*.cjs ─► CJS require
```

The `shared` package is the core of the architecture. It contains code that both client and server need: types, constants, data resolvers, and normalization utilities. During build, shared produces two separate outputs:

- `dist/client/` — ES modules (`.js`), for browser consumption
- `dist/server/` — CommonJS modules (`.cjs`), for Node.js consumption

Package exports in `shared/package.json` use conditional exports (`import` vs `require`) so each consumer automatically receives the correct format.

## Directory Structure

```
Project/
├── package.json                  # Root workspace config
├── tsconfig.json                 # Base TypeScript configuration
├── .prettierrc.json              # Code formatting rules
├── .gitignore
│
├── client/                       # React frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.base.config.ts    # Base webpack config
│   ├── webpack.dev.config.ts     # Dev server config
│   ├── webpack.prod.config.ts    # Production build config
│   ├── public/
│   │   └── index.html            # HTML template
│   └── src/
│       ├── index.tsx             # Application entry point
│       ├── App.tsx               # Main React component
│       ├── config.ts             # Environment flags (CLIENT)
│       ├── store/
│       │   ├── index.ts          # Redux store setup
│       │   └── collectionsSlice.ts  # Collections state slice
│       └── widget/
│           ├── index.tsx         # createWidget factory
│           └── example.tsx       # Example widget implementation
│
├── server/                       # Express backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts              # Express app + API endpoints
│
└── shared/                       # Shared code (client + server)
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts         # Platform-specific webpack build
    ├── scripts/
    │   └── distribute-types.mjs  # Type declaration distribution
    └── src/
        ├── index.ts              # Shared re-exports
        ├── constants/
        │   └── index.ts          # Constants, types, helpers
        └── resolver/
            ├── index.ts          # Resolver re-exports
            ├── createResolver.ts # Resolver factory
            ├── example.ts        # Example resolver
            ├── normalize.ts      # Data normalization utility
            ├── examples.client.ts # Client-only export
            └── examples.server.ts # Server-only export
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Webpack 5, Redux Toolkit, CSS |
| **Backend** | Express, TypeScript, ts-node-dev, CORS |
| **Shared** | Webpack 5 (dual-target), TypeScript |
| **Monorepo** | npm workspaces, concurrently |
| **Tooling** | ESLint, Prettier, ts-loader, html-webpack-plugin |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Initial Setup

```bash
# Install all dependencies across workspaces
npm run prepare-dev

# Or manually:
npm install
cd shared && npm run build && cd ..
```

### Development

```bash
# Start all dev servers concurrently (client on :3000, server on :3001, shared watch)
npm run dev

# Start individual packages:
npm run dev:client    # Webpack dev server on port 3000
npm run dev:server    # Express with ts-node-dev on port 3001
npm run dev:shared    # Webpack watch mode for shared
```

### Production Build

```bash
# Build everything
npm run build

# Or individually:
npm run build:shared   # Build shared (webpack + types)
npm run build:client   # Build client (webpack production)
npm run build:server   # Build server (tsc)

# Start production server
npm start              # Runs server on port 3001
```

### Cleanup

```bash
npm run clear           # Remove all node_modules and dist directories
npm run clear:node_modules  # Remove node_modules only
npm run clear:dist          # Remove dist directories only
```

## Build System

### Shared Package

The shared package has a two-stage build process:

#### Stage 1: Webpack Compilation

`webpack.config.ts` scans `src/` for all `.ts`/`.tsx` files and compiles them twice — once for client, once for server:

| Setting | Client | Server |
|---------|--------|--------|
| `target` | `web` | `node` |
| `output.library.type` | `module` | `commonjs2` |
| `output.filename` | `[name].js` | `[name].cjs` |
| `experiments.outputModule` | `true` | `false` |
| `externals` | none | all node_modules (commonjs) |
| `externalsPresets.node` | `false` | `true` |

#### Stage 2: Type Declaration Distribution

`scripts/distribute-types.mjs` performs:

1. Runs `tsc --emitDeclarationOnly` to generate `.d.ts` files into `dist/_types/`
2. Walks the `_types` directory and distributes declarations:
   - Files without suffix → copied to both `dist/client/` and `dist/server/`
   - `*.client.d.ts` → copied to `dist/client/` (suffix stripped)
   - `*.server.d.ts` → copied to `dist/server/` (suffix stripped)
3. Cleans up `dist/_types/` temporary directory

**Commands:**

```bash
npm run build          # Full build: clean → webpack → types
npm run build:client   # Client only: clean → webpack --env target=client → types
npm run build:server   # Server only: clean → webpack --env target=server → types
npm run build:types    # Type generation and distribution only
npm run dev            # webpack --watch
npm run clean          # rimraf dist
```

### Client Package

Uses Webpack 5 with three config files:

| File | Purpose |
|------|---------|
| `webpack.base.config.ts` | Base config: entry, loaders, plugins |
| `webpack.dev.config.ts` | Dev server: port 3000, HMR, live reload, CORS, TsconfigPathsPlugin |
| `webpack.prod.config.ts` | Production: code splitting, runtime chunk, content hash, DefinePlugin (CLIENT=true) |

**Key features:**
- Entry: `./src/index.tsx`
- TypeScript: `ts-loader` with `transpileOnly: true` in dev, `false` in prod
- CSS: `style-loader` + `css-loader`
- Path aliases via `TsconfigPathsPlugin` (resolves `@store`, `@widget`, `@config`)
- `process.env.CLIENT` set to `true` via `DefinePlugin`

### Server Package

Uses TypeScript compiler directly (no webpack):

| Setting | Value |
|---------|-------|
| `module` | `nodenext` |
| `moduleResolution` | `NodeNext` |
| `outDir` | `./dist` |
| `rootDir` | `./src` |

**Dev:** `ts-node-dev --respawn --transpile-only src/index.ts`
**Prod:** `tsc` then `node dist/index.js`

## Platform-Specific Code Resolution

Files in `shared/src/` follow a naming convention that determines which platforms they compile to:

| File Pattern | Compiled to | Description |
|-------------|-------------|-------------|
| `*.ts` | Both `dist/client/` and `dist/server/` | Shared code for all platforms |
| `*.client.ts` | `dist/client/` only | Browser-specific code |
| `*.client.tsx` | `dist/client/` only | Browser-specific React code |
| `*.server.ts` | `dist/server/` only | Node.js-specific code |
| `*.server.tsx` | `dist/server/` only | Node.js-specific React code |

**How it works** (`shared/webpack.config.ts`):

```typescript
function getEntries(target: 'client' | 'server') {
    const allFiles = glob.sync('**/*.{ts,tsx}', { cwd: srcDir });

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
export const NAME = 'FAKE_NAME';

// shared/src/resolver/examples.server.ts
export const NAME = 'NAME_1';
```

Both files compile to `resolver/examples` in their respective output directories. When either client or server imports `shared/resolver/examples`, they receive their platform's version.

## Type Distribution System

The type distribution script (`shared/scripts/distribute-types.mjs`) ensures TypeScript declarations match the platform-specific JS output:

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
      "types": "./dist/server/index.d.ts",
      "import": "./dist/client/index.js",
      "require": "./dist/server/index.cjs",
      "default": "./dist/client/index.js"
    },
    "./constants": {
      "types": "./dist/server/constants/index.d.ts",
      "import": "./dist/client/constants/index.js",
      "require": "./dist/server/constants/index.cjs",
      "default": "./dist/client/constants/index.js"
    },
    "./resolver": {
      "types": "./dist/server/resolver/index.d.ts",
      "import": "./dist/client/resolver/index.js",
      "require": "./dist/server/resolver/index.cjs",
      "default": "./dist/client/resolver/index.js"
    },
    "./resolver/*": {
      "types": "./dist/server/resolver/*.d.ts",
      "import": "./dist/client/resolver/*.js",
      "require": "./dist/server/resolver/*.cjs",
      "default": "./dist/server/resolver/*.cjs"
    }
  }
}
```

| Condition | Used by | Example |
|-----------|---------|---------|
| `types` | TypeScript compiler | IDE autocomplete, type checking |
| `import` | ES module imports | Client webpack bundler |
| `require` | CommonJS requires | Server Node.js runtime |
| `default` | Fallback | When no condition matches |

### Client Module Resolution

`client/tsconfig.json` path aliases:

```json
{
  "paths": {
    "shared/*": ["node_modules/shared/*"],
    "@*": ["*"]
  }
}
```

- `shared/*` → resolves via package exports to `dist/client/*` (ESM)
- `@store/*` → `src/store/*`
- `@widget/*` → `src/widget/*`
- `@config` → `src/config.ts`

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
| `GET` | `/health` | Health check | — | `{ status: "OK", version: "1.0.0" }` |
| `GET` | `/users` | Get all users | — | `User[]` |
| `GET` | `/users/:id` | Get user by ID | — | `{ success: true, data: "..." }` or `{ success: false, error: "..." }` |
| `POST` | `/users` | Create user | `{ name, email }` | `{ success: true, data: "..." }` |
| `GET` | `/dist/*` | Serve production chunks | — | Static file |
| `GET` | `*` | SPA fallback | — | `index.html` |

### Data Types

```typescript
interface User {
    id: string;
    name: string;
    email: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
```

### CORS Configuration

| Setting | Value |
|---------|-------|
| Origin | `http://localhost:3000` |
| Methods | `GET`, `POST` |
| Headers | `Content-Type`, `Authorization` |

### Static File Serving

The server serves the client production build from `../../client/dist`:
- `express.static` serves files from `client/dist/`
- Fallback route (`*`) serves `index.html` for React Router support
- `/dist/*` route serves webpack production chunks

## Client Application

### Components

#### Entry Point (`src/index.tsx`)

```typescript
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@store';
import App from './App';

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <App />
    </Provider>
);
```

#### App Component (`src/App.tsx`)

The main component that renders:
- Header with app version and platform info
- `ViewExample` widget
- User list with formatted user data

```typescript
import { User, formatUser, VERSION } from 'shared/constants';
import { NAME } from 'shared/resolver/examples';
import { CLIENT } from '@config';
import { ViewExample } from '@widget/example';
```

#### Configuration (`src/config.ts`)

```typescript
export const CLIENT = process.env.CLIENT;
```

Set via webpack `DefinePlugin` to `true` in the client build. This is also used in `shared/src/resolver/createResolver.ts` to determine the `isServer` context flag.

### State Management

**Store** (`src/store/index.ts`):

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { reducer as CollectionsReducer } from './collectionsSlice';

export const store = configureStore({
    reducer: {
        collections: CollectionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Collections Slice** (`src/store/collectionsSlice.ts`):

| Property | Type | Description |
|----------|------|-------------|
| State shape | `{ [key: string]: Record<string, unknown> }` | Dictionary of named collections |
| Initial state | `{}` | Empty object |
| `updateCollection` | `PayloadAction<CollectionState>` | Merges new collections into state, creating or extending each by name |

The collections slice is the primary Redux state in this application. It stores data fetched by widgets in a normalized format (keyed objects).

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

**Return Value:**

A React component with `displayName = 'widget-{View.displayName}'` that accepts `DataProps`.

#### Example Widget (`src/widget/example.tsx`)

```typescript
export const ViewExample = createWidget({
    view: ({ name, example }) => <div>name:{name} | example:{example}</div>,
    controller: async ({ example }) => {
        const name = await new Promise(res => setTimeout(() => res('Test name'), 5000));
        const userCollection = await resolverExample({ collectionName: 'users' });
        return {
            data: { example, name },
            collections: {
                userCollection,
                someCollection: { name: 'NAME', age: 999 },
            },
        };
    },
    skeleton: () => <div>--[{AUTHOR}]--</div>,
});
```

This widget:
- Shows `--[{AUTHOR}]--` skeleton for 5 seconds
- Fetches data via `resolverExample` (which calls the server API)
- Dispatches `userCollection` to Redux
- Renders the View with resolved `name` and `example` props

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
| `func` | `(ctx, params) => Collections<CollectionType> \| Promise<...>` | The data-fetching function |
| `options.name` | `string` | Resolver identifier |
| `options.sync` | `boolean` (optional) | If `true`, the runner is synchronous |

**Context (`ctx`):**

```typescript
{
    isServer: boolean;  // true on server, false on client
    [key: string]: any; // extensible
}
```

The `isServer` flag is determined by `!process.env.CLIENT`. Since webpack `DefinePlugin` sets `CLIENT=true` only in the client build, the shared code automatically knows which platform it's running on.

**Return Type:**

| `sync` | Return |
|--------|--------|
| `false` (default) | `async (params) => Collections<CollectionType>` |
| `true` | `(params) => Collections<CollectionType>` |

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

On the client, this resolver fetches users from the server API and normalizes them into a collection. On the server, the same resolver could use direct database access instead of HTTP.

### Platform-Specific Exports

```typescript
// examples.client.ts → dist/client/resolver/examples.js
export const NAME = 'FAKE_NAME';

// examples.server.ts → dist/server/resolver/examples.cjs
export const NAME = 'NAME_1';
```

Both compile to the same entry point name (`resolver/examples`). Each platform gets its own version automatically via the build system and package exports.

## Shared Modules

### Constants (`shared/src/constants/index.ts`)

| Export | Type | Value/Description |
|--------|------|-------------------|
| `AUTHOR` | `string` | `"SAV"` |
| `VERSION` | `string` | `"1.0.0"` |
| `User` | `interface` | `{ id: string, name: string, email: string }` |
| `ApiResponse<T>` | `interface` | `{ success: boolean, data?: T, error?: string }` |
| `formatUser(user)` | `function` | Returns `"Name <email> (ID: id)"` |

### Index (`shared/src/index.ts`)

Re-exports from `constants/` for convenience:

```typescript
export * from './constants';
```

This allows `import { User, formatUser, VERSION } from 'shared'` as a shorthand.

### Resolver Index (`shared/src/resolver/index.ts`)

```typescript
export * from './createResolver';
export * from './example';
export * from './normalize';
```

Enables `import { createResolver, normalize, resolverExample } from 'shared/resolver'`.

## Scripts Reference

### Root Package

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `concurrently "dev:client" "dev:server" "dev:shared"` | Start all dev servers |
| `dev:client` | `npm run dev --workspace=client` | Webpack dev server (port 3000) |
| `dev:server` | `npm run dev --workspace=server` | Express with ts-node-dev (port 3001) |
| `dev:shared` | `npm run dev --workspace=shared` | Webpack watch mode |
| `build` | `npm run build --workspaces` | Build all packages |
| `build:client` | `npm run build --workspace=client` | Client production build |
| `build:server` | `npm run build --workspace=server` | Server compilation |
| `start` | `npm run start --workspace=server` | Run production server |
| `prepare-dev` | Complex multi-step | Full environment setup |
| `clear` | Remove node_modules + dist | Clean everything |
| `clear:node_modules` | Remove all node_modules | Clean dependencies |
| `clear:dist` | Remove all dist | Clean build artifacts |

### Client Package

| Script | Command |
|--------|---------|
| `dev` | `webpack serve --mode development --config webpack.dev.config.ts` |
| `build` | `webpack --mode production --config webpack.prod.config.ts` |
| `serve` | `npx http-server dist -p 3000 --cors` |

### Server Package

| Script | Command |
|--------|---------|
| `dev` | `ts-node-dev --respawn --transpile-only src/index.ts` |
| `build` | `tsc` |
| `start` | `node dist/index.js` |

### Shared Package

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `clean && webpack && build:types` | Full build |
| `build:client` | `clean && webpack --env target=client && build:types` | Client only |
| `build:server` | `clean && webpack --env target=server && build:types` | Server only |
| `build:types` | `node scripts/distribute-types.mjs` | Generate + distribute types |
| `dev` | `webpack --watch` | Watch mode |
| `clean` | `rimraf dist` | Remove output |

## Dependency Graph

```
root (project)
├── devDependencies: concurrently, typescript, @reduxjs/toolkit, react-redux
│
├── client (workspace)
│   ├── dependencies: react, react-dom, typescript, @types/*, eslint, prettier
│   ├── devDependencies: webpack, babel, ts-loader, css-loader, html-webpack-plugin
│   └── depends on → shared (file:../shared)
│
├── server (workspace)
│   ├── dependencies: express, cors, dotenv
│   ├── devDependencies: ts-node-dev, typescript, @types/express, @types/cors
│   └── depends on → shared (file:../shared)
│
└── shared (workspace)
    ├── devDependencies: webpack, ts-loader, typescript, glob, rimraf
    └── no internal workspace dependencies
```

**Data Flow:**

```
Client App
    │
    ├── imports shared/constants  ──► dist/client/constants/index.js (ESM)
    ├── imports shared/resolver   ──► dist/client/resolver/index.js (ESM)
    └── imports shared            ──► dist/client/index.js (ESM)
                                          │
                                          │ fetches
                                          ▼
                                     Server API (port 3001)
                                          │
                                          ├── imports shared/constants  ──► dist/server/constants/index.cjs (CJS)
                                          ├── imports shared/resolver   ──► dist/server/resolver/index.cjs (CJS)
                                          └── imports shared            ──► dist/server/index.cjs (CJS)
```

## Development Workflow

### Adding a New Shared Module

1. Create file in `shared/src/`:
   - `shared/src/myModule.ts` → available on both platforms
   - `shared/src/myModule.client.ts` → client only
   - `shared/src/myModule.server.ts` → server only

2. Export from the appropriate index file (`shared/src/index.ts` or `shared/src/resolver/index.ts`)

3. Rebuild shared: `npm run build --workspace=shared`

4. Import in client or server:
   ```typescript
   import { something } from 'shared';
   import { myModule } from 'shared/myModule';
   ```

### Adding a New Server Endpoint

1. Add route handler in `server/src/index.ts`
2. Use shared types: `import { User, ApiResponse } from 'shared'`
3. Rebuild server: `npm run build --workspace=server`

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
```
