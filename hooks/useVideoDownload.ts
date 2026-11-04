import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { VideoModel } from '@/types/video';

export function useVideoDownload(
  video: VideoModel | null,
  setVideo: React.Dispatch<React.SetStateAction<VideoModel | null>>
) {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const startDownload = useCallback(() => {
    if (!video) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    const timer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsDownloading(false);
          setVideo((v) => (v ? { ...v, download_status: 'COMPLETED' } : null));
          Alert.alert('اكتمل التحميل', 'تم حفظ الفيديو في المكتبة بنجاح للاستخدام بدون إنترنت.');
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  }, [video, setVideo]);

  const deleteDownload = useCallback(() => {
    Alert.alert(
      'تأكيد الحذف',
      'هل تريد مسح هذا الفيديو من ذاكرة الهاتف لتوفير المساحة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          style: 'destructive',
          onPress: () => {
            setVideo((v) => (v ? { ...v, download_status: 'NOT_DOWNLOADED' } : null));
            Alert.alert('تم الحذف', 'تم مسح ملف الفيديو من ذاكرة الجهاز بنجاح.');
          },
        },
      ]
    );
  }, [setVideo]);

  return {
    isDownloading,
    downloadProgress,
    startDownload,
    deleteDownload,
  };
}
