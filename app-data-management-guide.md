# Application Data Management Guide

This document outlines the offline-first data management architecture used in this application. It ensures a fast, reliable user experience that works even with intermittent network connectivity.

## Core Concepts

The architecture is built on three main principles:

1.  **Single Source of Truth**: The local SQLite database is the single source of truth for the entire UI. UI components **never** fetch data directly from the API. They only read from the local database.
2.  **Background Synchronization**: A dedicated `SyncService` is responsible for fetching the latest data from the remote API and updating the local database. This process runs in the background without interrupting the user.
3.  **Reactive UI**: The UI is built to be "reactive" to changes in the local database. When the sync process updates the data, the UI updates itself automatically without requiring a manual refresh or app reload.

---

## The Data Flow: Step-by-Step

Here is the complete data lifecycle, from app launch to UI update.

### 1. App Startup: Database Initialization (`app/_layout.tsx` & `lib/db/index.ts`)

Database initialization is handled centrally and reactively by the `SQLiteProvider` component in the root layout file.

- **Provider-based Management**: The entire application is wrapped in `<SQLiteProvider>`. This component from `expo-sqlite` is responsible for opening the database and making the connection available to all child components via a React context.
- **Initialization and Migration**: The provider's `onInit` prop is used to run our setup logic. It calls the `runMigrations` function from `lib/db/index.ts`.
- **`runMigrations` Logic**:
  - **New User (DB Version 0)**: The function creates the database schema from scratch using `lib/db/schema.ts` and sets the database version to the latest.
  - **Existing User (DB Version < Latest)**: It detects an outdated database and applies all necessary migrations sequentially from `lib/db/migrations.ts` to bring the schema up-to-date.
- **Outcome**: The `SQLiteProvider` ensures that a single, stable, and fully migrated database connection is available throughout the app. Components can access it using the `useSQLiteContext()` hook.

### 2. Data Synchronization (`app/services/SyncService.ts` & `lib/db/sync.ts`)

This process runs after a successful login and periodically in the background.

- **Trigger**: `SyncService.run(db)` is called from the root layout, passing in the database connection.
- **Fetch**: It fetches the complete data catalog from the remote API.
- **Write (Upsert Logic)**: The fetched data is passed to `syncCatalogData`. This function uses an `INSERT ... ON CONFLICT DO UPDATE` (UPSERT) command for every record. This efficiently inserts new data and updates existing data in one operation.
- **Data Integrity (Transactions)**: The entire sync process is wrapped in a `db.withTransactionAsync()`. If any single database operation fails, the entire transaction is rolled back, preventing corrupted or partially-synced data.

### 3. UI Reactivity (`lib/store.ts`, Hooks & Components)

This is the final piece that connects the background data changes to the user-facing components.

- **Notification**: After a successful sync, `SyncService` calls `useAppStore.getState().actions.notifySyncCompleted()`.
- **State Change**: This action updates the `lastSyncTimestamp` state variable in the Zustand store.
- **Reacting to Change**:
  - Custom hooks like `useExploreScreen` listen for changes to `lastSyncTimestamp` using `useEffect`.
  - When `lastSyncTimestamp` changes, the `useEffect` hook re-runs.
  - **Re-fetch from Local DB**: The hook, which already has access to the database connection via `useSQLiteContext()`, calls the relevant data-fetching action from the store and **passes the database object to it** (e.g., `fetchExploreData(db)`).
  - **UI Update**: The action queries the local SQLite database, places the new data into the Zustand store, and UI components automatically re-render to display the latest information.

---

## How to Apply This Logic to New Screens

If you need to create a new screen (e.g., a "My Favorite Videos" screen) and have it automatically update when data changes, follow these four steps.

### Step 1: Create the Query

In the `lib/db/queries/` directory (e.g., `video.queries.ts`), create a new async function to get the data you need from the database.

```typescript
// in lib/db/queries/video.queries.ts
export const getFavoriteVideos = async (
  db: SQLiteDatabase
): Promise<Video[]> => {
  const query = "SELECT * FROM videos WHERE is_favorite = 1 ORDER BY title;";
  return await db.getAllAsync<Video>(query);
};
```

### Step 2: Add State and an Action to the Store

In `lib/store.ts` and `lib/store/types.ts`, add a new state variable and an action to fetch it. The action **must accept a `db` parameter**.

```typescript
// in lib/store/types.ts
// 1. Add to AppState interface
//    favoriteVideos: Video[];
// 2. Add to StoreActions interface
//    fetchFavoriteVideos: (db: SQLiteDatabase) => Promise<void>;

// in lib/store.ts
import { getFavoriteVideos } from "./db/queries/video.queries"; // Import the new query

export const useAppStore = create<AppState>((set, get) => ({
  // 3. Add initial state
  favoriteVideos: [],
  // ... other state

  // 4. Add the new action
  actions: {
    // ... other actions
    fetchFavoriteVideos: async (db: SQLiteDatabase) => {
      set({ isLoading: true });
      const videos = await getFavoriteVideos(db); // Use the query directly
      set({ favoriteVideos: videos, isLoading: false });
    },
  } as StoreActions,
}));
```

### Step 3: Create a Custom Hook for the Screen

In the `hooks/` directory, create a new hook that gets the database connection, calls the action, and listens for the sync notification.

```typescript
// in hooks/useFavoritesScreen.ts
import { useAppActions, useAppStore } from "@/lib/store";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";

export const useFavoritesScreen = () => {
  const db = useSQLiteContext(); // Get the DB connection
  const { fetchFavoriteVideos } = useAppActions();
  const favoriteVideos = useAppStore((state) => state.favoriteVideos);
  const isLoading = useAppStore((state) => state.isLoading);
  const lastSyncTimestamp = useAppStore((state) => state.lastSyncTimestamp);

  useEffect(() => {
    fetchFavoriteVideos(db); // Pass the DB connection to the action
  }, [lastSyncTimestamp, fetchFavoriteVideos, db]); // This makes it reactive!

  return { favoriteVideos, isLoading };
};
```

### Step 4: Use the Hook in Your Screen Component

Finally, in your new screen component, call your custom hook to get the data and render it.

```typescript
// in app/screens/FavoritesScreen.tsx
import { useFavoritesScreen } from "@/hooks/useFavoritesScreen";
import { FlatList, Text } from "react-native";

export default function FavoritesScreen() {
  const { favoriteVideos, isLoading } = useFavoritesScreen();

  if (isLoading) {
    // Show a loading indicator
  }

  return (
    <FlatList
      data={favoriteVideos}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
}
```
