import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { SyncService } from '@/services/SyncService';

export function useSyncRefresh(
  refetchFn: () => Promise<void> | void,
  options?: { syncWithServer?: boolean; debugTag?: string }
) {
  const db = useSQLiteContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const syncWithServer = options?.syncWithServer ?? true;
  const debugTag = options?.debugTag ?? 'useSyncRefresh';

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (syncWithServer) {
        await SyncService.run(db, true);
      }
    } catch (e) {
      console.warn(`SyncService refresh error in ${debugTag}:`, e);
    }

    try {
      await refetchFn();
    } catch (e) {
      console.warn(`Refetch error in ${debugTag}:`, e);
    } finally {
      setIsRefreshing(false);
    }
  }, [db, refetchFn, syncWithServer, debugTag]);

  return {
    isRefreshing,
    onRefresh,
  };
}
