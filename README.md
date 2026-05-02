# Project

Full-stack monorepo with a React frontend, Express backend, and shared type-safe code.

- **Client**: React 18 + Redux Toolkit + Webpack 5 — separate mobile/desktop bundles
- **Server**: Express + Swagger + device detection (routes to correct bundle by User-Agent)
- **Shared**: Dual-format builds — ESM for client, CJS for server

## Quick Start

```bash
# 1. Install and set up
npm run prepare-dev

# 2. Build shared package (required first step)
npm run build --workspace=shared

# 3. Start dev servers
npm run dev
```

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Auto-serves mobile or desktop bundle |
| Backend API | http://localhost:3001 | Includes Swagger at `/api-docs` |
| Device Info | http://localhost:3001/device | Returns detected device type |

## Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all dev servers (client, server, shared watch) |
| `npm run build` | Build everything (shared → client → server) |
| `npm start` | Run production server (port 3001, serves both platforms) |
| `npm run lint` | Check code with ESLint |
| `npm run format` | Format code with Prettier |

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
    index.ts           # API routes + static file serving
    swagger.ts         # OpenAPI documentation

shared/          # Shared code (client + server)
  src/
    constants/         # Types, constants, helpers
    resolver/          # Data fetching pattern
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

**Shared** uses `*.client.ts` / `*.server.ts` — different outputs per platform:

```
examples.client.ts  → dist/client/resolver/examples.js (ESM)
examples.server.ts  → dist/server/resolver/examples.cjs (CJS)
```

## Adding Shared Code

1. Create file in `shared/src/` (or a new subdirectory with `index.ts`)
2. Rebuild: `npm run build --workspace=shared`
3. Import anywhere:

```typescript
import { User } from 'shared';
import { NAME } from 'shared/resolver/examples';
import { DeviceType } from 'shared/utils/getDeviceType';
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check + device info |
| `GET` | `/device` | Detailed device detection |
| `GET` | `/users` | List all users |
| `POST` | `/auth/register` | Register new user |
| `GET` | `/api-docs` | Swagger documentation |

## Full Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for architecture details, build system, widget system, resolver system, linting setup, and development workflow.
