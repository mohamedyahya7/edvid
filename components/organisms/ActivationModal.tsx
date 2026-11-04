import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
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
import { storageUrl } from '@/api/Axios';
import { downloadManager } from '@/services/DownloadManager';
import QRCodeScanner from '@/components/molecules/QRCodeScanner';

type ActivationModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ActivationModal({
  visible,
  onClose,
}: ActivationModalProps) {
  const router = useRouter();
  const db = useSQLiteContext();
  const { colors } = useTheme();

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
        // Check if the video already exists locally and is activated
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingSubtext, { color: colors.text }]}>
            جاري معالجة الكود...
          </Text>
        </View>
      );
    }

    // Step 2: Video Verified - Choose Quality & Action
    if (resolutions.length > 0 && video) {
      const thumbnailUri = video.thumbnail
        ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${storageUrl}${video.thumbnail}`)
        : null;

      const teacherImageUri = (video as any).teacher_image
        ? ((video as any).teacher_image.startsWith('http')
            ? (video as any).teacher_image
            : `${storageUrl}${(video as any).teacher_image}`)
        : null;

      return (
        <ScrollView contentContainerStyle={styles.verifiedScrollContent} showsVerticalScrollIndicator={false}>
          {/* Verified Header Badge */}
          <View style={[styles.successBadge, { backgroundColor: `${colors.primary}18` }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.successBadgeText, { color: colors.primary }]}>
              تم العثور على الدرس بنجاح!
            </Text>
          </View>

          {/* Video Preview Card */}
          <View style={[styles.videoPreviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {thumbnailUri ? (
              <Image source={{ uri: thumbnailUri }} style={styles.previewThumbnail} resizeMode="cover" />
            ) : (
              <View style={[styles.previewThumbnail, styles.placeholderThumbnail, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="play" size={28} color={colors.primary} />
              </View>
            )}
            <View style={styles.previewInfo}>
              <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={2}>
                {video.title}
              </Text>
              {(video as any).teacher_name && (
                <View style={styles.previewTeacherRow}>
                  {teacherImageUri ? (
                    <Image source={{ uri: teacherImageUri }} style={styles.previewTeacherAvatar} />
                  ) : (
                    <View style={[styles.previewTeacherAvatar, styles.placeholderAvatar, { backgroundColor: `${colors.primary}20` }]}>
                      <Ionicons name="person" size={14} color={colors.primary} />
                    </View>
                  )}
                  <Text style={styles.previewTeacherName}>
                    {(video as any).teacher_name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Resolutions Header */}
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            اختر دقة المشاهدة أو التنزيل:
          </Text>
          <View style={styles.resolutionsGrid}>
            {resolutions.map((res) => {
              const isSelected = selectedResolution === res.quality;
              return (
                <TouchableOpacity
                  key={res.quality}
                  activeOpacity={0.8}
                  style={[
                    styles.resolutionPill,
                    {
                      backgroundColor: isSelected ? `${colors.primary}20` : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedResolution(res.quality)}
                >
                  <Text style={[styles.resolutionQuality, { color: isSelected ? colors.primary : colors.text }]}>
                    {res.quality}p
                  </Text>
                  {res.size_in_mb ? (
                    <Text style={styles.resolutionSize}>
                      {res.size_in_mb} MB
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actionButtonsCol}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.primaryActionBtn,
                { backgroundColor: colors.primary },
                !selectedResolution && styles.disabledBtn,
              ]}
              onPress={handleWatchNow}
              disabled={!selectedResolution}
            >
              <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>شاهد الآن مباشرة</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.secondaryActionBtn,
                { borderColor: colors.border, backgroundColor: colors.background },
                !selectedResolution && styles.disabledBtn,
              ]}
              onPress={handleDownload}
              disabled={!selectedResolution}
            >
              <Ionicons name="cloud-download-outline" size={19} color={colors.text} />
              <Text style={[styles.secondaryActionBtnText, { color: colors.text }]}>
                تحميل للمشاهدة بدون إنترنت
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    // Step 1: Input Code or QR
    return (
      <View style={styles.inputStepContainer}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.helperText}>
          أدخل كود الحصة المطبوع على الكارت أو امسح رمز الـ QR مباشرة عبر الكاميرا:
        </Text>

        <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="مثال: BAMBOO-XXXX"
            placeholderTextColor="#8E8E93"
            value={code}
            onChangeText={(txt) => {
              setCode(txt);
              if (error) setError(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.qrScanInlineBtn, { backgroundColor: `${colors.primary}18` }]}
            onPress={() => setScannerVisible(true)}
          >
            <Ionicons name="camera-outline" size={21} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputActionRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            onPress={handleCheckCode}
          >
            <Ionicons name="checkmark-done-outline" size={19} color="#FFFFFF" />
            <Text style={styles.primaryActionBtnText}>تفعيل الدرس</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isScannerVisible}
        onRequestClose={() => setScannerVisible(false)}
      >
        <QRCodeScanner
          onCodeScanned={(data) => {
            setCode(data);
            setScannerVisible(false);
          }}
          onClose={() => setScannerVisible(false)}
        />
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={visible && !isScannerVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.backdrop}>
          <View style={[styles.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.headerTitleWrap}>
                <View style={[styles.headerIconPill, { backgroundColor: `${colors.primary}18` }]}>
                  <Ionicons name="key-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>تفعيل كود الحصة</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClose}
                style={[styles.closeIconBtn, { backgroundColor: colors.background }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.sheetBody}>
              {renderContent()}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBody: {
    padding: 18,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingSubtext: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  inputStepContainer: {
    gap: 14,
  },
  helperText: {
    fontSize: 12.5,
    color: '#8E8E93',
    lineHeight: 19,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  qrScanInlineBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputActionRow: {
    marginTop: 6,
    width: '100%',
  },
  primaryActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  secondaryActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B3015',
    borderColor: '#FF3B3040',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    writingDirection: 'rtl',
  },
  verifiedScrollContent: {
    gap: 14,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  successBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  videoPreviewCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    gap: 12,
    alignItems: 'center',
  },
  previewThumbnail: {
    width: 80,
    height: 54,
    borderRadius: 8,
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: 4,
  },
  previewTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
    writingDirection: 'rtl',
  },
  previewTeacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTeacherAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTeacherName: {
    fontSize: 11,
    color: '#8E8E93',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    writingDirection: 'rtl',
  },
  resolutionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resolutionPill: {
    flex: 1,
    minWidth: 85,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  resolutionQuality: {
    fontSize: 13,
    fontWeight: '800',
  },
  resolutionSize: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  actionButtonsCol: {
    marginTop: 8,
    gap: 10,
  },
});
