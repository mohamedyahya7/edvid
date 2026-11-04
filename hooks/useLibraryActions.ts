import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { clearVideoDownload } from '@/lib/db/queries/video.queries';
import { useAppStore } from '@/lib/store';
import { LibraryVideoItem } from '@/types/library';

export function useLibraryActions(onReload: () => void) {
  const router = useRouter();
  const db = useSQLiteContext();

  const handleRemoveDownload = (video: LibraryVideoItem) => {
    Alert.alert(
      'حذف الفيديو',
      `هل تريد إزالة فيديو "${video.title}" من المكتبة المحلية؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearVideoDownload(db, String(video.id));
              onReload();
              useAppStore.getState().actions.notifySyncCompleted();
            } catch (e) {
              console.error('Error removing download:', e);
            }
          },
        },
      ]
    );
  };

  const handleOpenVideo = (video: LibraryVideoItem) => {
    router.push({
      pathname: '/video/[id]',
      params: { id: String(video.id) },
    });
  };

  const handleOpenTeacher = (teacherId: string | number) => {
    router.push({
      pathname: '/teacher/[id]',
      params: { id: String(teacherId) },
    });
  };

  const handleExplore = () => {
    router.push('/(tabs)');
  };

  return {
    handleRemoveDownload,
    handleOpenVideo,
    handleOpenTeacher,
    handleExplore,
  };
}
