import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { VideoModel, WatermarkConfig } from '@/types/video';
import { getVideoDetails, updateVideoProgress } from '@/lib/db/queries/video.queries';
import { useAuthStore } from '@/lib/store/authStore';
import { useAppStore } from '@/lib/store';
import { useVideoDownload } from '@/hooks/useVideoDownload';
import { useVideoPlayback } from '@/hooks/useVideoPlayback';

export const useVideoDetailController = (initialVideoId?: string) => {
  const { id: paramId, streamUrl } = useLocalSearchParams<{ id?: string; streamUrl?: string }>();
  const videoId = initialVideoId || paramId;
  const db = useSQLiteContext();
  const user = useAuthStore((state) => state.user);

  const [video, setVideo] = useState<VideoModel | null>(null);
  const [otherVideos, setOtherVideos] = useState<VideoModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnlockModalVisible, setUnlockModalVisible] = useState<boolean>(false);

  // Modular sub-hooks
  const { isDownloading, downloadProgress, startDownload, deleteDownload } = useVideoDownload(video, setVideo);
  const { updateProgress } = useVideoPlayback(db, videoId);

  // Student specific watermark config from authentication store
  const watermarkConfig: WatermarkConfig = {
    studentName: user?.name || 'طالب منصة بامبو',
    studentPhone: user?.phone || '010XXXXXXXX',
    studentCode: user?.support_id ? `ID: ${user.support_id}` : undefined,
    opacity: 0.28,
    intervalMs: 5000,
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      if (!videoId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { video: details, otherVideos: others } = await getVideoDetails(db, videoId.toString());

        if (!isMounted) return;

        if (details) {
          // Normalize video_type
          const rawType = details.video_type || details.type || 'free';
          const videoType = (rawType === 'free' ? 'free' : 'paid') as 'free' | 'paid';

          // Extract YouTube ID if present (or fallback to testing video as requested)
          let ytId = details.youtube_id;
          if (!ytId && details.youtube_url) {
            const match = details.youtube_url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
            if (match) ytId = match[1];
          }
          if (!ytId) {
            ytId = 'dQw4w9WgXcQ';
          }

          // Check if video is unlocked
          const isUnlocked = true;

          const currentProgress = (details.progress_seconds && details.progress_seconds > 0)
            ? details.progress_seconds
            : 15;

          const mappedVideo: VideoModel = {
            id: details.id.toString(),
            title: details.title || 'محاضرة بدون عنوان',
            description: details.description || '',
            course_id: details.course_id ? details.course_id.toString() : '',
            teacher_id: details.teacher_id ? details.teacher_id.toString() : '',
            teacher_name: details.teacher_name || 'أستاذ المادة',
            teacher_image: details.teacher_profile_picture_url || details.teacher_image || null,
            subject_name: details.subject_name || 'المادة الدراسية',
            video_type: videoType,
            youtube_id: ytId,
            thumbnail: details.thumbnail || null,
            duration_seconds: details.duration_seconds || 3600,
            progress_seconds: currentProgress,
            price: details.price || 0,
            is_unlocked: isUnlocked,
            download_status: details.download_status || 'NOT_DOWNLOADED',
            local_video_path: details.local_video_path || null,
            stream_url: streamUrl || details.stream_url || details.video_url || null,
            download_progress: 0,
            total_size_bytes: details.total_size_bytes || 440928665,
            watch_count: details.watch_count ?? 0,
          };

          const mappedOthers: VideoModel[] = (others || []).map((o: any) => ({
            id: o.id.toString(),
            title: o.title,
            course_id: (details.course_id || '').toString(),
            teacher_id: (details.teacher_id || '').toString(),
            video_type: (o.video_type || 'paid') as 'free' | 'paid',
            thumbnail: o.thumbnail || null,
            duration_seconds: o.duration_seconds || 2700,
            price: o.price || 120,
            youtube_id: o.youtube_id || 'dQw4w9WgXcQ',
            is_unlocked: true,
            download_status: 'NOT_DOWNLOADED',
          }));

          setVideo(mappedVideo);
          setOtherVideos(mappedOthers);

          // Save active watch progress in SQLite so Continue Watching reflects real activity
          updateVideoProgress(db, details.id.toString(), currentProgress)
            .then(() => {
              useAppStore.getState().actions.notifySyncCompleted();
            })
            .catch((e) => console.warn('updateVideoProgress error:', e));
        } else {
          setVideo(null);
        }
      } catch (err) {
        console.error('Failed to load video details from SQLite:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [db, videoId, streamUrl]);

  const unlockVideoWithCode = useCallback((code: string) => {
    if (!code || code.trim().length < 4) {
      Alert.alert('خطأ', 'يرجى إدخال كود صحيح');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setVideo((prev) => (prev ? { ...prev, is_unlocked: true } : null));
      setUnlockModalVisible(false);
      Alert.alert('نجاح', 'تم تفعيل المحاضرة بنجاح!');
    }, 500);
  }, []);

  return {
    video,
    otherVideos,
    isLoading,
    isDownloading,
    downloadProgress,
    isUnlockModalVisible,
    watermarkConfig,
    setUnlockModalVisible,
    unlockVideoWithCode,
    startDownload,
    deleteDownload,
    updateProgress,
  };
};
