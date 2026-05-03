# Widget System

Widgets are data-driven components built with the `createWidget` factory. Each widget has a `view` (React component), a `controller` (async data fetcher), and an optional `skeleton` (loading placeholder).

## createWidget

Located at `client/src/widget/index.tsx`.

```typescript
export const createWidget = <ComponentProps, DataProps, collectionsProps = CollectionState>({
    view: View,         // React component to render
    controller: Fn,     // Async function that fetches data (receives ctx)
    skeleton: Skeleton, // Optional loading placeholder component
    name: string,       // Optional: register in widget registry for Slot
}) => WidgetComponent
```

### Type Parameters

| Parameter | Description |
|-----------|-------------|
| `ComponentProps` | Props expected by the View component |
| `DataProps` | Props passed from parent to the widget (defaults to `Record<string, unknown>`) |
| `collectionsProps` | Type of collections returned (defaults to `CollectionState`) |

## WidgetCtx

Every controller receives a `ctx` object with full page context:

```typescript
export type WidgetCtx = {
    page: {
        pathname: string;              // Current URL pathname
        search: string;                // Query string (including ?)
        searchParams: URLSearchParams; // Parsed query params
        params: Record<string, string | undefined>; // Route params
    };
};
```

**Usage in controller:**
```typescript
controller: async ({ ctx }) => {
    const userId = ctx.page.params.userId;
    const query = ctx.page.searchParams.get('q');
    const currentPath = ctx.page.pathname;
    // ...
}
```

## Widget Lifecycle

1. **Mount** → `showSkeleton = true`, `showNothing = false`
2. **Fetch** → `controller({ ...props, ctx })` is called (once, via `useEffect`)
3. **Success** → `data` merged into component props, `collections` dispatched to Redux, `showSkeleton = false` → renders View
4. **Empty result** → controller returns `null` → `showNothing = true` → renders `null`
5. **Error** → `showSkeleton = false`, `showNothing = true` → renders `null`
6. **Route change** → re-fetches when `location.pathname` changes

## Examples

### UserList Widget

```typescript
// client/src/widget/UserList.tsx
export const UserListWidget = createWidget<Props, object>({
    view: UserList,
    name: 'UserList',
    controller: async () => {
        const userCollection = await resolveUsers({ limit: 10 });
        return {
            data: { users: Object.values(userCollection.users) },
        };
    },
    skeleton: () => <div>UserList</div>,
});
```

### UserDetail Widget

```typescript
// client/src/widget/UserDetail.tsx
export const UserDetailWidget = createWidget({
    view: UserDetail,
    name: 'UserDetail',
    controller: async ({ ctx }) => {
        const id = ctx.page.params.userId as string;
        if (!id) return {};
        const userCollection = await resolveUser({ id });
        return { data: { user: userCollection.users[id] } };
    },
    skeleton: () => <div>UserDetail</div>,
});
```

### Widget with Props

```typescript
type ViewProps = { name: string; example: number; };

export const ViewExample = createWidget<ViewProps, { example: number }>({
    view: ({ name, example }) => <div>name:{name} | example:{example}</div>,
    controller: async ({ example, ctx }) => {
        const name = await new Promise(res => setTimeout(() => res('Test name'), 5000));
        return { data: { example, name } };
    },
    skeleton: () => <div>Loading...</div>,
});
```

## Widget Registry

Located at `client/src/widget/registry.ts`.

Allows widgets to be registered and retrieved by name. Widgets are auto-registered when `createWidget` is called with a `name` option.

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `registerWidget` | `(name: string, entry: { component, displayName }) => void` | Register a widget by name |
| `getWidget` | `(name: string) => ComponentType \| null` | Get a registered widget component |
| `hasWidget` | `(name: string) => boolean` | Check if a widget is registered |

## Slot Component

Located at `client/src/widget/Slot.tsx`.

Renders a widget by name from the registry.

### Usage

```tsx
import { Slot } from '@widget/Slot';

// Basic usage
<Slot name="UserList" />

// With fallback
<Slot name="MyWidget" fallback={<div>Widget not found</div>} />

// With props (passed to widget's DataProps)
<Slot name="UserDetail" props={{ id: '123' }} />
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | Name of the registered widget |
| `props` | `Record<string, unknown>` | No | Props to pass to the widget |
| `fallback` | `ReactNode` | No | Rendered when widget is not found |

### Usage in Routes

```tsx
// client/src/App.mobile.tsx / App.desktop.tsx
import { Slot } from '@widget/Slot';

export default function App() {
    return (
        <div style={{ padding: '20px' }}>
            <Routes>
                <Route path="/" element={<Slot name="UserList" />} />
                <Route path="/users/:userId" element={<Slot name="UserDetail" />} />
                <Route path="*" element={<div>Wow, you found 404</div>} />
            </Routes>
        </div>
    );
}
```
