# Project

Full-stack monorepo with a React frontend, Express backend, and shared type-safe code.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764abc?logo=redux)](https://redux-toolkit.js.org/)
[![React Router](https://img.shields.io/badge/React_Router-v7-f44250?logo=reactrouter)](https://reactrouter.com/)
[![Webpack](https://img.shields.io/badge/Webpack-5-8dd6f9?logo=webpack)](https://webpack.js.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-f69220?logo=pnpm)](https://pnpm.io/)
[![Jest](https://img.shields.io/badge/Jest-30-c21325?logo=jest)](https://jestjs.io/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4b32c3?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.5-F7B93E?logo=prettier)](https://prettier.io/)

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
