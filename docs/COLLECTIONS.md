# State Management

## Store

Located at `client/src/store/index.ts`.

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { reducer as CollectionsReducer } from './collectionsSlice';

export const store = configureStore({
    reducer: { collections: CollectionsReducer },
});
```

## Collections Slice

Located at `client/src/store/collectionsSlice.ts`.

### State Shape

```typescript
{
    [key: string]: Record<string, unknown>  // Dictionary of named collections
}
```

### API

| Property | Type | Description |
|----------|------|-------------|
| Initial state | `{}` | Empty object |
| `updateCollection` | `PayloadAction<CollectionState>` | Merges new collections into state |

### How Collections Work

When a widget's `controller` returns a `collections` object, it is automatically dispatched to the store:

```typescript
// Inside createWidget
if (collections) {
    dispatch(updateCollection(collections));
}
```

The `updateCollection` reducer merges incoming collections with existing state:

```typescript
updateCollection: (state, action) => {
    Object.keys(action.payload).forEach((collectionName) => {
        state[collectionName] = state[collectionName]
            ? { ...state[collectionName], ...action.payload[collectionName] }
            : action.payload[collectionName];
    });
}
```

### Usage in Components

```typescript
import { useSelector, useDispatch } from 'react-redux';

// Read collections
const collections = useSelector((state: RootState) => state.collections);
const users = collections.users; // { '1': User, '2': User, ... }

// Update collections manually
const dispatch = useDispatch();
dispatch(updateCollection({ myCollection: { ... } }));
```

### Type Definitions

```typescript
type CollectionState = Record<string, Record<string, unknown>>;

interface CollectionsSlice {
    collections: CollectionState;
}
```
