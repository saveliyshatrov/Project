# Project

Full-stack monorepo with a React frontend, Express backend, and shared type-safe code.

## Quick Start

```bash
# 1. Install and set up
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

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for architecture, build system, widget/resolver guides, API reference, and development workflow.
