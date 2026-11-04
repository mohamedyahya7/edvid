import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { fetchLibraryVideos } from '@/lib/db/queries/video.queries';
import { useAppStore } from '@/lib/store';
import { LibraryVideoItem } from '@/types/library';

export function useLibraryVideos() {
  const db = useSQLiteContext();
  const [videos, setVideos] = useState<LibraryVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLibrary = useCallback(async () => {
    try {
      const data = await fetchLibraryVideos(db);
      setVideos((data as LibraryVideoItem[]) || []);
    } catch (e) {
      console.warn('loadLibrary error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Sync listener from global app store
  const syncTimestamp = useAppStore((state) => state.lastSyncTimestamp);
  useEffect(() => {
    loadLibrary();
  }, [syncTimestamp, loadLibrary]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadLibrary();
  }, [loadLibrary]);

  // Storage calculation: sum of file_size for completed offline videos
  const storageStats = useMemo(() => {
    const downloadedVideos = videos.filter(
      (v) =>
        v.effective_download_status === 'COMPLETED' ||
        v.download_status === 'COMPLETED'
    );
    const usedBytes = downloadedVideos.reduce(
      (acc, v) => acc + (Number(v.file_size) || 120 * 1024 * 1024), // fallback ~120MB per video if null
      0
    );
    return {
      usedBytes,
      downloadedCount: downloadedVideos.length,
    };
  }, [videos]);

  return {
    videos,
    loading,
    isRefreshing,
    storageStats,
    onRefresh,
    reload: loadLibrary,
  };
}
