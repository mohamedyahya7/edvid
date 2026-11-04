import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { addUsedCode } from '@/lib/db/queries/usedCodes.queries';
import {
  activateVideoForWatching,
  getVideoById,
  upsertVideo,
} from '@/lib/db/queries/video.queries';
import {
  ActivationService,
  Resolution,
  VideoDetails,
} from '@/api/ActivationService';
import { downloadManager } from '@/services/DownloadManager';

export function useActivationController(onClose: () => void) {
  const router = useRouter();
  const db = useSQLiteContext();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);
  const [isScannerVisible, setScannerVisible] = useState(false);

  const handleClose = () => {
    setCode('');
    setError(null);
    setResolutions([]);
    setSelectedResolution(null);
    setVideo(null);
    setScannerVisible(false);
    setIsLoading(false);
    onClose();
  };

  const handleCheckCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('الرجاء إدخال رمز التفعيل أولاً.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResolutions([]);
    setSelectedResolution(null);

    try {
      const response = await ActivationService.checkActivationCode(trimmed);
      if ('resolutions' in response) {
        const existingVideo = await getVideoById(db, `${response.video.id}`);
        const videoDataForDb = {
          id: response.video.id,
          title: response.video.title,
          teacher_name: (response.video as any).teacher_name,
          teacher_image: (response.video as any).teacher_image,
          description: response.video.description,
          video_type: (response.video as any).type,
          youtube_id: (response.video as any).youtube_url
            ? (response.video as any).youtube_url.split('v=')[1]
            : null,
          thumbnail: (response.video as any).thumbnail_path,
          duration_seconds: (response.video as any).duration,
          price: (response.video as any).default_price_tier_id,
          likes_count: (response.video as any).likes_count || 0,
          views: (response.video as any).views || 0,
          updated_at: (response.video as any).updated_at,
        };

        if (
          existingVideo &&
          (existingVideo.download_status === 'COMPLETED' ||
            existingVideo.access_type === 'watch')
        ) {
          setError('هذا الدرس موجود بالفعل ومفعّل في مكتبتك.');
          setIsLoading(false);
          return;
        }

        setResolutions(response.resolutions);
        if (response.resolutions.length > 0) {
          setSelectedResolution(response.resolutions[0].quality);
        }
        setVideo(videoDataForDb as any);
      } else {
        setError(response.message || 'رمز التفعيل غير صحيح أو مستخدم من قبل.');
      }
    } catch (e: any) {
      setError(e.message || 'تعذر الاتصال بالخادم للتحقق من الكود.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedResolution) {
      setError('الرجاء اختيار دقة الفيديو للتحميل.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const trimmed = code.trim();
      const response = await ActivationService.requestDownloadLinks(
        trimmed,
        selectedResolution,
        'download'
      );

      if (!('url' in response)) {
        setError(response.message || 'تعذر الحصول على رابط التنزيل.');
        setIsLoading(false);
        return;
      }

      if (response.video && response.video_id) {
        const videoDataForDb = {
          id: (response.video as any).id,
          title: (response.video as any).title,
          course_id: (response.video as any).course_id,
          teacher_id: (response.video as any).course?.teacher_id,
          description: (response.video as any).description,
          video_type: (response.video as any).type,
          youtube_id: (response.video as any).youtube_url
            ? (response.video as any).youtube_url.split('v=')[1]
            : null,
          thumbnail: (response.video as any).thumbnail_path,
          duration_seconds: (response.video as any).duration,
          price: (response.video as any).price,
          likes_count: (response.video as any).likes_count,
          views: (response.video as any).views,
          watch_count: (response.video as any).watch_count,
          updated_at: (response.video as any).updated_at,
        };

        await upsertVideo(db, videoDataForDb as any);
        await addUsedCode(
          db,
          trimmed,
          `${response.video_id}`,
          'download',
          response.expires_at?.toString() || null
        );

        downloadManager.enqueueDownload(
          `${response.video_id}`,
          response.video_title,
          trimmed,
          {
            videoUrl: response.url,
            audioUrl: response.audio_url,
            subtitleUrl: response.subtitle_url,
          },
          'download',
          response.expires_at || 0
        );

        Alert.alert(
          'بدء التحميل',
          `جاري تنزيل: ${response.video_title} وسيظهر في مكتبتك فور الاكتمال.`
        );
        handleClose();
      } else {
        setError('لم يتم العثور على تفاصيل الفيديو لبدء التحميل.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'فشل بدء التحميل. الرجاء المحاولة مرة أخرى.');
      setIsLoading(false);
    }
  };

  const handleWatchNow = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const trimmed = code.trim();
      const chosenRes = selectedResolution || (resolutions[0] ? resolutions[0].quality : '360');
      const response = await ActivationService.requestDownloadLinks(
        trimmed,
        chosenRes,
        'watch'
      );

      if ('url' in response && response.video && db) {
        const videoDataForDb = {
          id: (response.video as any).id,
          title: (response.video as any).title,
          course_id: (response.video as any).course_id,
          teacher_id: (response.video as any).course?.teacher_id,
          description: (response.video as any).description,
          video_type:
            (response.video as any).type || (video as any)?.video_type,
          youtube_id: (response.video as any).youtube_url
            ? (response.video as any).youtube_url.split('v=')[1]
            : null,
          thumbnail: (response.video as any).thumbnail_path,
          duration_seconds: (response.video as any).duration,
          price: (response.video as any).price,
          likes_count: (response.video as any).likes_count,
          views: (response.video as any).views,
          watch_count: (response.video as any).watch_count,
          updated_at: (response.video as any).updated_at,
        };

        await upsertVideo(db, videoDataForDb as any);
        await addUsedCode(
          db,
          trimmed,
          `${response.video_id}`,
          'watch',
          response.expires_at?.toString() || null
        );
        await activateVideoForWatching(db, `${response.video_id}`, trimmed);

        router.push({
          pathname: '/video/[id]',
          params: { id: `${response.video_id}`, streamUrl: response.url },
        });
        handleClose();
      } else {
        setError(
          (response as any).message || 'تعذر الحصول على رابط بث الفيديو.'
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء محاولة المشاهدة.');
      setIsLoading(false);
    }
  };

  const handleCodeScanned = (scannedCode: string) => {
    setCode(scannedCode);
    setScannerVisible(false);
  };

  return {
    code,
    setCode,
    isLoading,
    error,
    setError,
    resolutions,
    video,
    selectedResolution,
    setSelectedResolution,
    isScannerVisible,
    setScannerVisible,
    handleClose,
    handleCheckCode,
    handleDownload,
    handleWatchNow,
    handleCodeScanned,
  };
}
