# React + TypeScript + Webpack + Express Monorepo

Full-stack monorepo with shared type-safe code between a React frontend and Express backend.

- **Client**: React 18 + Redux Toolkit + Webpack 5 (port 3000)
- **Server**: Express + ts-node-dev (port 3001)
- **Shared**: Platform-specific builds — `*.client.ts` → `dist/client/` (ESM), `*.server.ts` → `dist/server/` (CJS)

## Quick Start

```bash
# 1. Install and set up
npm run prepare-dev

# 2. Start dev servers
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/users` | Get all users |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users` | Create user `{ name, email }` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all dev servers concurrently |
| `npm run build` | Build all packages |
| `npm run build:client` | Build client only |
| `npm run build:server` | Build server only |
| `npm start` | Run production server |
| `npm run clear` | Remove all `node_modules` and `dist` |

## Debugging

### Client

- Webpack dev server runs on port 3000 with HMR and source maps
- Open browser DevTools → Sources to debug TypeScript directly
- Check console for `CLIENT=true` flag verification

### Server

```bash
# Run with debugger
node --inspect dist/index.js

# Or use ts-node-dev with inspect
npx ts-node-dev --inspect --respawn --transpile-only src/index.ts
```

Attach via Chrome DevTools (`chrome://inspect`) or your IDE.

### Shared Package

```bash
# Rebuild shared only
npm run build --workspace=shared

# Watch mode for live changes
npm run dev --workspace=shared
```

Verify platform outputs:
```bash
cat shared/dist/client/constants/index.js    # ESM (client)
cat shared/dist/server/constants/index.cjs   # CJS (server)
```

## Adding Shared Code

| File naming | Goes to | Description |
|-------------|---------|-------------|
| `*.ts` | Both `client` + `server` | Shared code |
| `*.client.ts` | `dist/client/` only | Browser-only code |
| `*.server.ts` | `dist/server/` only | Node.js-only code |

After creating files, rebuild shared:
```bash
npm run build --workspace=shared
```

Then import in client or server:
```typescript
import { User, formatUser } from 'shared/constants';
import { resolverExample } from 'shared/resolver';
```

## Full Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed architecture, build system, widget system, resolver system, and development workflow.
