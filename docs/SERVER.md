# Server Package

Express backend with TypeScript, compiled directly with `tsc`.

## Build Configuration

| Setting | Value |
|---------|-------|
| `module` | `commonjs` |
| `moduleResolution` | `node` |
| `outDir` | `./dist` |
| `rootDir` | `./src` |

### Commands

```bash
pnpm --filter server run dev     # ts-node-dev with auto-reload on port 3001
pnpm --filter server run build   # Compile with tsc
pnpm --filter server run start   # Run production server (node dist/index.js)
```

See server `tsconfig.json` for module resolution details.

## API Endpoints

**Base URL:** `http://localhost:3001`

| Method | Path | Description | Request Body / Query | Response |
|--------|------|-------------|---------------------|----------|
| `GET` | `/health` | Health check | — | `{ status, version, device, platform, browser }` |
| `GET` | `/device` | Device detection | — | `{ type, platform, browser, isMobile, isTablet, isDesktop, source }` |
| `GET` | `/users` | Get all users | — | `User[]` |
| `GET` | `/users/:id` | Get user by ID | — | `{ success, data }` or `{ success: false, error }` |
| `POST` | `/auth/register` | Register user | `{ name, email, password }` | `{ success, user }` or error |
| `POST` | `/users` | Create user | `{ name, email }` | `{ success, data }` |
| `POST` | `/resolver?resolver=NAME` | Execute a single resolver | Query: `resolver` (string). Body: `{ params?: object }` | Normalized collections or `{ error }` |
| `POST` | `/resolver/batch` | Execute multiple resolvers in batch | `{ batch: [{ resolver, params? }] }` | Array of results in same order |
| `GET` | `/api-docs` | Swagger UI | — | Swagger documentation |

## Static File Serving

| Route | Serves from |
|-------|-------------|
| `/dist/mobile/*` | `client/dist/mobile/` |
| `/dist/desktop/*` | `client/dist/desktop/` |

### SPA Fallback

```typescript
app.get('*', (req, res) => {
    const device = getDeviceType(req);
    res.sendFile(path.join(__dirname, `../../client/dist/${device}/index.html`));
});
```

## Device Detection

Uses `express-useragent` middleware:

```typescript
app.use(expressUseragent.express());

function getDeviceType(req): 'mobile' | 'desktop' {
    if (req.useragent?.isMobile) return 'mobile';
    return 'desktop';
}
```

### Device Detection Endpoint

`GET /device` returns:

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

## CORS Configuration

| Setting | Value |
|---------|-------|
| Origin | `http://localhost:3000` |
| Methods | `GET`, `POST` |
| Headers | `Content-Type`, `Authorization` |

## Directory Structure

```
server/
├── package.json
├── tsconfig.json
├── eslint.config.mts
└── src/
    ├── index.ts              # Express app + API endpoints
    └── swagger.ts            # Swagger/OpenAPI spec
```

## Adding a New Server Endpoint

1. Create a route directory: `server/src/routes/myRoute/`
2. Create `index.ts` with the router and handlers
3. Create Zod schemas in `schemas/index.ts` for request validation
4. Use `validate()` middleware from `src/middleware/validate.ts`
5. Register the router in `src/routes/index.ts`
6. Add tests in `src/routes/myRoute/__tests__/route.test.ts` using supertest
7. Rebuild server: `pnpm --filter server run build`
