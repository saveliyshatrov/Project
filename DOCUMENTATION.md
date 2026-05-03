# Project Documentation

## Core Documentation

| File | Description |
|------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture, data flow, request lifecycle, build pipeline |
| [CLIENT.md](./docs/CLIENT.md) | Client package: build config, dev server, entry point, directory structure |
| [SERVER.md](./docs/SERVER.md) | Server package: Express API, endpoints, device detection, CORS |
| [SHARED.md](./docs/SHARED.md) | Shared package: build commands, module exports, adding shared code |
| [WIDGETS.md](./docs/WIDGETS.md) | Widget system: createWidget, WidgetCtx, Slot component, registry |
| [RESOLVERS.md](./docs/RESOLVERS.md) | Resolver system: createResolver, normalize, adding new resolvers |
| [COLLECTIONS.md](./docs/COLLECTIONS.md) | State management: Redux store, collections slice |

## Quick Links

- [Getting Started](./README.md#getting-started)
- [Essential Commands](./README.md#essential-commands)
- [API Endpoints](./docs/SERVER.md#api-endpoints)
- [Adding Shared Code](./docs/SHARED.md#adding-shared-code)
- [Adding a New Widget](./docs/WIDGETS.md#examples)
- [Adding a New Resolver](./docs/RESOLVERS.md#adding-a-new-resolver)
- [Adding a Server Endpoint](./docs/SERVER.md#adding-a-new-server-endpoint)
- [Linting and Formatting](#linting-and-formatting)

## Linting and Formatting

### ESLint (v9 Flat Config)

Root config: `eslint.config.js`

| Plugin | Purpose |
|--------|---------|
| `@eslint/js` | Base recommended rules |
| `typescript-eslint` | TypeScript support |
| `eslint-plugin-react` | React rules |
| `eslint-plugin-react-hooks` | Hooks rules |
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

### Prettier

```json
{
    "trailingComma": "es5",
    "printWidth": 120,
    "singleQuote": true,
    "tabWidth": 4,
    "useTabs": false
}
```

### Pre-commit Hooks

Husky + lint-staged runs on every commit:

| File Type | Actions |
|-----------|---------|
| `*.{js,mjs,cjs,ts,jsx,tsx}` | `eslint --fix` → `prettier --write` |
| `*.{json,css}` | `prettier --write` |

## Scripts Reference

### Root Package

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start all dev servers with prefixed logging (`[CLIENT]`, `[SERVER]`, `[SHARED]`) |
| `pnpm run build` | Build everything (shared → client → server) |
| `pnpm start` | Run production server (port 3001) |
| `pnpm run lint` | Check all files |
| `pnpm run lint:fix` | Auto-fix ESLint issues |
| `pnpm run format` | Format all files with Prettier |
| `pnpm run clear` | Remove all node_modules and dist directories |
| `pnpm run prepare-dev` | Bootstrap from scratch |

See individual package docs for package-specific scripts.

## Debugging

```bash
# Check shared exports for each platform:
cat shared/dist/client/constants/index.js    # ESM output
cat shared/dist/server/constants/index.cjs   # CJS output

# Check type declarations:
cat shared/dist/client/constants/index.d.ts
cat shared/dist/server/constants/index.d.ts

# Check client dist output:
ls -la client/dist/mobile/
ls -la client/dist/desktop/

# Verify server logic is NOT in client bundle:
grep "sensitive data" shared/dist/client/resolver/*.js  # should return nothing

# Check resolver bundle sizes:
wc -c shared/dist/client/resolver/resolveUsers.js   # ~130 bytes (stub only)
wc -c shared/dist/server/resolver/resolveUsers.cjs  # ~770 bytes (real logic)
```
