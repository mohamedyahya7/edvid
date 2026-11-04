import { useCallback, useRef } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { updateVideoProgress } from '@/lib/db/queries/video.queries';
import { useAppStore } from '@/lib/store';

export function useVideoPlayback(db: SQLiteDatabase, videoId?: string) {
  const lastSavedSec = useRef<number>(-1);

  const updateProgress = useCallback(
    (seconds: number) => {
      if (!videoId) return;
      const sec = Math.floor(seconds);

      // Simple throttle: avoid spamming SQLite on every fractional millisecond frame
      if (Math.abs(sec - lastSavedSec.current) < 2) return;
      lastSavedSec.current = sec;

      updateVideoProgress(db, videoId.toString(), sec)
        .then(() => {
          useAppStore.getState().actions.notifySyncCompleted();
        })
        .catch((e) => console.warn('useVideoPlayback updateVideoProgress error:', e));
    },
    [db, videoId]
  );

  return {
    updateProgress,
  };
}
