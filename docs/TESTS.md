# Testing

All packages use Jest with `ts-jest` for TypeScript compilation. Each package has its own `jest.config.ts` with platform-appropriate test environment settings.

## Quick Start

```bash
# Run all tests across workspace
pnpm run test

# Run tests for a specific package
pnpm run test:shared
pnpm run test:server
pnpm run test:client

# Run tests in watch mode
pnpm --filter shared run test -- --watch
pnpm --filter server run test -- --watch
pnpm --filter client run test -- --watch

# Run a single test file
pnpm --filter shared run test -- __tests__/normalize.test.ts

# Run tests matching a pattern
pnpm --filter client run test -- --testNamePattern="WidgetShell"
```

## Coverage

Coverage is collected with Jest's built-in Istanbul integration (no `nyc` required). Thresholds are set at **80%** for statements, branches, functions, and lines across all packages.

```bash
# Run all coverage reports
pnpm run coverage

# Coverage for a specific package
pnpm run coverage:shared
pnpm run coverage:server
pnpm run coverage:client
```

### Coverage Configuration

| Package | `collectCoverageFrom` | Exclusions |
|---------|----------------------|------------|
| **shared** | `src/**/*.ts` | `*.d.ts`, `*.client.ts` (server-only tests) |
| **server** | `src/**/*.ts` | `*.d.ts`, `__tests__/`, `dist/` |
| **client** | `src/**/*.{ts,tsx}` | `*.d.ts`, `*.mobile.tsx`, `*.desktop.tsx`, widget internals, `index.tsx` |

### Thresholds

All packages share the same threshold configuration in `jest.config.ts`:

```typescript
coverageThreshold: {
    global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
    },
},
```

## Package Test Details

### Shared Package

**Environment:** `node`

| Test File | Tests | Coverage Target |
|-----------|-------|-----------------|
| `__tests__/normalize.test.ts` | 5 | `normalize()` — collection creation, empty lists, custom keys, overwrites |
| `__tests__/createResolver.server.test.ts` | 11 | Registry, sync/async modes, schema validation, context passing |
| `__tests__/createResolver.client.test.ts` | 5 | Batching via fetch, response parsing, error handling, params in batch |
| `__tests__/resolverBatch.client.test.ts` | 3 | Batch queue, single call, error rejection |
| `__tests__/resolvers.test.ts` | 9 | `resolveUser` and `resolveUsers` registration, validation, execution |
| `__tests__/constants.test.ts` | 4 | VERSION, AUTHOR, User interface, formatUser |
| `__tests__/getDeviceType.test.ts` | 3 | DeviceType enum, mobile/desktop detection |
| `__tests__/examples.server.test.ts` | 1 | Server example export |
| `__tests__/resolver-index.test.ts` | 3 | Re-export verification |
| `__tests__/utils-index.test.ts` | 1 | Utils re-export verification |

**Jest config highlights:**
- `moduleFileExtensions` prioritizes `.server.ts` over `.client.ts`
- `moduleNameMapper` routes bare `createResolver` imports to `.server` variant
- Client-only files (`.client.ts`) excluded from coverage since tests run in server context

### Server Package

**Environment:** `node`

| Test File | Tests | Coverage Target |
|-----------|-------|-----------------|
| `routes/auth/__tests__/route.test.ts` | 4 | Registration, validation, error cases |
| `routes/device/__tests__/route.test.ts` | 3 | Device detection, user agent parsing |
| `routes/health/__tests__/route.test.ts` | 3 | Health check, mobile user agent detection |
| `routes/resolver/__tests__/route.test.ts` | 7 | Missing/unknown resolver, valid execution, batch validation, batch execution, mixed valid/invalid |
| `routes/users/__tests__/route.test.ts` | 5 | List, by ID, create, 404, field validation |
| `routes/static/__tests__/route.test.ts` | 1 | Catch-all fallback behavior |

**Testing approach:**
- `supertest` wraps the Express `app` export from `src/index.ts`
- Each test file imports the shared app instance (server starts once per suite)
- Tests run against real middleware stack (CORS, useragent, JSON parser)

### Client Package

**Environment:** `jsdom`

| Test File | Tests | Coverage Target |
|-----------|-------|-----------------|
| `__tests__/widget/Slot.test.tsx` | 6 | Sync rendering, lazy loading, fallback, props passing |
| `__tests__/src/App.test.tsx` | 2 | Route matching, 404 fallback, widget rendering |
| `__tests__/src/WidgetShell.test.tsx` | 7 | Skeleton, controller data, collections, errors, rerender |
| `__tests__/src/store.test.ts` | 2 | Store initialization, state shape |
| `__tests__/src/config.test.ts` | 1 | Environment variable export |
| `__tests__/src/components/UserList.test.tsx` | 1 | Component rendering |
| `__tests__/src/components/UserDetail.test.tsx` | 1 | Component rendering |
| `__tests__/src/widget/skeletons.test.tsx` | 2 | Skeleton component rendering |
| `__tests__/src/widget/index.test.tsx` | 2 | Widget registration via side-effect imports |

**Testing approach:**
- `@testing-library/react` for component rendering and queries
- `MemoryRouter` wraps components needing routing context
- `Provider` with real Redux store for state-dependent tests
- `clearWidgetRegistry()` in `beforeEach` for test isolation

**Jest config highlights:**
- `setupFilesAfterEnv` loads `@testing-library/jest-dom` and `TextEncoder`/`TextDecoder` polyfills
- Module aliases (`@store`, `@utils`, `@components`, `@widget`) mapped via `moduleNameMapper`
- Widget internals (controllers, widget.tsx, skeleton.tsx) excluded from coverage — tested indirectly via WidgetShell

## Test Setup

### Shared (`shared/__tests__/`)

No special setup required. Tests run against compiled server code from `dist/server/`.

### Server (`server/src/**/__tests__/`)

Tests import `app` from `src/index.ts`. The server listens on port 3001 during test runs but does not require the dev server to be running.

### Client (`client/__tests__/`)

**`setup.ts`:**
```typescript
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
```

`TextEncoder`/`TextDecoder` polyfills are required for `react-router-dom` v7 in jsdom.

**Common patterns:**

```typescript
// Wrapper for components needing Redux + Router
const renderWithProviders = (ui: React.ReactElement, initialEntries?: string[]) => {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={initialEntries || ['/']}>{ui}</MemoryRouter>
        </Provider>
    );
};

// Clear registry before each test
beforeEach(() => {
    clearWidgetRegistry();
});

// Mock fetch for resolver tests
beforeEach(() => {
    global.fetch = jest.fn();
});
afterEach(() => {
    global.fetch = originalFetch;
});
```

## Adding Tests

### New Shared Module

1. Create test file: `shared/__tests__/myModule.test.ts`
2. Import from source: `import { myModule } from '../src/myModule'`
3. Run: `pnpm --filter shared run test`

### New Server Route

1. Create `__tests__/` directory inside the route folder
2. Import the shared app: `import app from '../../../index'`
3. Use supertest: `await request(app).get('/my-endpoint')`
4. Run: `pnpm --filter server run test`

### New Client Component

1. Create test file: `client/__tests__/src/MyComponent.test.tsx`
2. Use `renderWithProviders` wrapper if the component needs Redux or Router
3. Run: `pnpm --filter client run test`

### New Widget

Widget internals (controller, widget.tsx, skeleton) are excluded from coverage since they are tested indirectly through WidgetShell tests. If a widget has unique logic, add targeted tests:

```typescript
// __tests__/src/widget/MyNewWidget.test.tsx
describe('MyNewWidget', () => {
    beforeEach(() => clearWidgetRegistry());

    it('registers MyNewWidget', async () => {
        await import('../../../src/widget/MyNewWidget');
        expect(hasWidget('MyNewWidget')).toBe(true);
    });
});
```

## Debugging

```bash
# Run with verbose output
pnpm --filter client run test -- --verbose

# Run with coverage and show uncovered lines
pnpm --filter shared run test:coverage

# Run single test file with no cache
pnpm --filter server run test -- --no-cache src/routes/users/__tests__/route.test.ts

# Detect open handles (test leaks)
pnpm --filter server run test -- --detectOpenHandles

# Run with node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```
