# Client Package

React frontend built with Webpack 5, Redux Toolkit, and react-router v7.

## Build Configuration

Uses Webpack 5 with config factory pattern at root level:

| File                            | Purpose                                                                                |
|---------------------------------|----------------------------------------------------------------------------------------|
| `webpack.client.base.config.ts` | Config factory: generates platform-specific configs with NormalModuleReplacementPlugin |
| `webpack.client.dev.config.ts`  | Dev: single config for mobile platform (used by dev-server.ts)                         |
| `webpack.client.prod.config.ts` | Production: array of configs for mobile + desktop                                      |
| `dev-server.ts`                 | Custom Express dev server that watches and serves both platforms                       |

### Key Features

- Entry: `./src/index.tsx`
- TypeScript: `ts-loader` with `transpileOnly: true`
- CSS: `style-loader` + `css-loader`
- Path aliases via `TsconfigPathsPlugin` (`@store`, `@widget`, `@config`)
- `process.env.CLIENT` and `process.env.PLATFORM` set via `DefinePlugin`
- `NormalModuleReplacementPlugin` replaces `App.tsx` with platform-specific files

### Commands

```bash
pnpm --filter client run dev        # Custom dev server on port 3000
pnpm --filter client run build      # Production build (mobile + desktop)
pnpm --filter client run build:mobile  # Mobile only
pnpm --filter client run build:desktop # Desktop only
```

## Development Server

`dev-server.ts` — Custom Express server (located at project root) on port 3000:

- Runs webpack in watch mode for both mobile and desktop
- Serves static files from `dist/mobile` and `dist/desktop`
- Detects device type via User-Agent and serves the correct `index.html`
- Proxies `/resolver` requests to the backend API

```typescript
app.use('/dist/mobile', express.static(path.join(__dirname, 'dist/mobile')));
app.use('/dist/desktop', express.static(path.join(__dirname, 'dist/desktop')));

app.get('*', (req, res) => {
    const device = getDeviceType(req);
    res.sendFile(path.join(__dirname, `dist/${device}/index.html`));
});
```

## Entry Point

`src/index.tsx`:

```typescript
import { store } from '@store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);
```

## App Component

| File | Purpose |
|------|---------|
| `App.tsx` | Base App component (fallback) |
| `App.mobile.tsx` | Mobile-specific App (uses Slot) |
| `App.desktop.tsx` | Desktop-specific App (uses Slot) |

## Configuration

`src/config.ts`:

```typescript
export const CLIENT = process.env.CLIENT;
```

Set via webpack `DefinePlugin` to `true` in the client build.

## Directory Structure

```
Project root/
├── webpack.client.base.config.ts   # Config factory: generates platform-specific configs
├── webpack.client.dev.config.ts    # Dev: single config for mobile platform
├── webpack.client.prod.config.ts   # Production: array of configs for mobile + desktop
├── dev-server.ts                   # Custom Express dev server (port 3000)
│
client/
├── package.json
├── tsconfig.json
├── public/
│   └── index.html
└── src/
    ├── index.tsx             # Application entry point
    ├── App.tsx               # Base App component (fallback)
    ├── App.mobile.tsx        # Mobile-specific App
    ├── App.desktop.tsx       # Desktop-specific App
    ├── config.ts             # Environment flags
    ├── store/
    │   ├── index.ts          # Redux store setup
    │   └── collectionsSlice.ts  # Collections state slice
    ├── utils/
    │   └── global/
    │       ├── index.tsx     # createWidget factory, re-exports
    │       ├── WidgetShell.tsx  # createWidgetShell factory
    │       ├── Slot.tsx      # <Slot> component
    │       └── registry.ts   # Widget registry (sync + lazy)
    └── widget/
        ├── UserList/
        │   ├── index.tsx     # Generated: createWidget() call
        │   ├── widget.tsx    # createWidgetShell() call
        │   ├── controller.ts # Data fetcher
        │   └── skeleton.tsx  # Loading placeholder
        └── UserDetail/
            ├── index.tsx
            ├── widget.tsx
            ├── controller.ts
            └── skeleton.tsx
```

## Adding a Platform-Specific Component

1. Create platform-specific file:
   - `src/Component.mobile.tsx` → mobile only
   - `src/Component.desktop.tsx` → desktop only
   - `src/Component.tsx` → both (fallback)

2. Import normally:
   ```typescript
   import Component from './Component';
   ```

3. The build system automatically resolves to the correct file.
