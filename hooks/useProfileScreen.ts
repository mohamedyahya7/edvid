import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused } from '@react-navigation/native';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store/authStore';
import { Video } from '@/lib/store/types';
import { getFollowedSubjectsCount } from '@/lib/db/queries/subject.queries';
import { getFollowedTeachersCount } from '@/lib/db/queries/teacher.queries';
import { getUsedCodesCount } from '@/lib/db/queries/usedCodes.queries';
import {
  getContinueWatchingVideo,
  getLibraryVideosCount,
  getNewestVideosFromFollowedTeachers,
} from '@/lib/db/queries/video.queries';
import { ActivationService } from '@/api/ActivationService';
import { SyncService } from '@/services/SyncService';

export function useProfileScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const isFocused = useIsFocused();

  const user = useAuthStore((state) => state.user);
  const lastSyncTimestamp = useAppStore((state) => state.lastSyncTimestamp);
  const lastDownloadCompletedTimestamp = useAppStore(
    (state) => state.lastDownloadCompletedTimestamp
  );

  const [continueWatchingVideo, setContinueWatchingVideo] = useState<Video | null>(null);
  const [followedSubjectsCount, setFollowedSubjectsCount] = useState(0);
  const [followedTeachersCount, setFollowedTeachersCount] = useState(0);
  const [usedCodesCount, setUsedCodesCount] = useState(0);
  const [libraryVideosCount, setLibraryVideosCount] = useState(0);
  const [newestVideos, setNewestVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [
        videoRes,
        subjectsCountRes,
        teachersCountRes,
        codesCountRes,
        videosCountRes,
        newestRes,
      ] = await Promise.allSettled([
        getContinueWatchingVideo(db),
        getFollowedSubjectsCount(db),
        getFollowedTeachersCount(db),
        getUsedCodesCount(db),
        getLibraryVideosCount(db),
        getNewestVideosFromFollowedTeachers(db),
      ]);

      if (videoRes.status === 'fulfilled') setContinueWatchingVideo(videoRes.value);
      if (subjectsCountRes.status === 'fulfilled') setFollowedSubjectsCount(subjectsCountRes.value);
      if (teachersCountRes.status === 'fulfilled') setFollowedTeachersCount(teachersCountRes.value);
      if (codesCountRes.status === 'fulfilled') setUsedCodesCount(codesCountRes.value);
      if (videosCountRes.status === 'fulfilled') setLibraryVideosCount(videosCountRes.value);
      if (newestRes.status === 'fulfilled') setNewestVideos(newestRes.value || []);
    } catch (e) {
      console.warn('ProfileScreen fetchData error:', e);
    }
  }, [db]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData, lastSyncTimestamp, lastDownloadCompletedTimestamp]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('ProfileScreen sync error:', e);
    }
    await fetchData();
    setIsRefreshing(false);
  }, [db, fetchData]);

  const handleContinueWatchingPress = async (video: Video) => {
    if (!video) return;

    if (
      video.access_type !== 'watch' ||
      video.download_status === 'COMPLETED' ||
      video.video_type === 'free'
    ) {
      router.push(`/video/${video.id}`);
      return;
    }

    if (video.access_type === 'watch') {
      if (!video.activation_code) {
        Alert.alert('تنبيه', 'رمز التفعيل الخاص بهذا الدرس غير متوفر.');
        return;
      }
      if ((video.watch_count || 0) <= 0) {
        Alert.alert('انتهت المشاهدات', 'لقد استنفدت عدد مرات المشاهدة المتاحة لهذا الكود.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await ActivationService.requestDownloadLinks(
          video.activation_code,
          '360',
          'watch'
        );

        if ('url' in response) {
          router.push({
            pathname: '/video/[id]',
            params: { id: video.id, streamUrl: response.url },
          });
        } else {
          Alert.alert('خطأ', (response as any).message || 'تعذر الحصول على رابط المشاهدة.');
        }
      } catch (e: any) {
        Alert.alert('خطأ', e.message || 'حدث خطأ أثناء الاتصال بالخادم.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    user,
    userName: user?.name ? user.name : 'طالب بامبو',
    continueWatchingVideo,
    followedSubjectsCount,
    followedTeachersCount,
    usedCodesCount,
    libraryVideosCount,
    newestVideos,
    isLoading,
    isRefreshing,
    onRefresh,
    handleContinueWatchingPress,
  };
}
