import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoDetailController } from '@/hooks/useVideoDetailController';
import { ModernVideoPlayer } from '@/features/video-player/ModernVideoPlayer';
import { TeacherProfileCard } from '@/components/molecules/TeacherProfileCard';
import { OtherVideosSection } from '@/components/organisms/OtherVideosSection';
import { UnlockCodeModal } from '@/components/organisms/UnlockCodeModal';
import { BackButton } from '@/components/atoms/BackButton';

const VideoDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Prevent OS-level screen capture and screenshots safely on native platforms
  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('expo-screen-capture').then((sc) => {
        sc.preventScreenCaptureAsync().catch(() => {});
      });
      return () => {
        import('expo-screen-capture').then((sc) => {
          sc.allowScreenCaptureAsync().catch(() => {});
        });
      };
    }
  }, []);

  // Auto unlock orientation when on Video Screen, restore to portrait when leaving
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') {
        ScreenOrientation.unlockAsync().catch(() => {});
      }
      return () => {
        if (Platform.OS !== 'web') {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
        }
      };
    }, [])
  );

  const {
    video,
    otherVideos,
    isLoading,
    isDownloading,
    isUnlockModalVisible,
    watermarkConfig,
    setUnlockModalVisible,
    startDownload,
    deleteDownload,
    unlockVideoWithCode,
    updateProgress,
  } = useVideoDetailController();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>لم يتم العثور على المحاضرة المطلوبة.</Text>
      </View>
    );
  }

  // Active video source: downloaded local file if available, otherwise streaming URL
  const videoSourceUri =
    video.download_status === 'COMPLETED' && video.local_video_path
      ? video.local_video_path
      : video.stream_url || null;

  const isUnlocked = video.is_unlocked || video.video_type === 'free';
  const isDownloaded = video.download_status === 'COMPLETED';

  // LANDSCAPE FULLSCREEN VIEW: Immersion mode without title or bottom lists
  if (isLandscape) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <View style={styles.floatingLandscapeHeader} pointerEvents="box-none">
          <BackButton variant="glass" />
        </View>
        <ModernVideoPlayer
          sourceUri={videoSourceUri}
          videoType={video.video_type}
          youtubeId={video.youtube_id}
          thumbnailUrl={video.thumbnail}
          watermarkConfig={watermarkConfig}
          autoPlay={true}
          isLocked={!isUnlocked}
          initialPositionSeconds={video.progress_seconds || 0}
          onProgressChange={updateProgress}
          onUnlockPress={() => setUnlockModalVisible(true)}
          onDownloadPress={startDownload}
          isDownloading={isDownloading}
          isLandscape={true}
        />
        <UnlockCodeModal
          visible={isUnlockModalVisible}
          onClose={() => setUnlockModalVisible(false)}
          onSubmitCode={unlockVideoWithCode}
          isLoading={isLoading}
        />
      </View>
    );
  }

  // PORTRAIT DEFAULT VIEW: Scrollable with Video Player Hero, Teacher Info, and Course Index
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Floating Glass Back Button (Right corner over video hero) */}
      <View
        pointerEvents="box-none"
        style={[styles.floatingHeader, { top: Math.max(insets.top + 8, 14) }]}
      >
        <BackButton variant="glass" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Modern Video Player (Hero Lock / Offline CTA / Live Playback) */}
        <ModernVideoPlayer
          sourceUri={videoSourceUri}
          videoType={video.video_type}
          youtubeId={video.youtube_id}
          thumbnailUrl={video.thumbnail}
          watermarkConfig={watermarkConfig}
          autoPlay={true}
          isLocked={!isUnlocked}
          initialPositionSeconds={video.progress_seconds || 0}
          onProgressChange={updateProgress}
          onUnlockPress={() => setUnlockModalVisible(true)}
          onDownloadPress={startDownload}
          isDownloading={isDownloading}
          isLandscape={false}
        />

        {/* Dynamic Teacher Info Card (Real stats, no mock 420MB, correct RTL layout) */}
        <TeacherProfileCard
          video={video}
          onDeleteDownload={isDownloaded ? deleteDownload : undefined}
        />

        {/* Course Lectures Index ("فهرس محاضرات الكورس" with Real Database Lectures) */}
        {otherVideos.length > 0 && (
          <OtherVideosSection videos={otherVideos} currentVideoId={video.id} />
        )}
      </ScrollView>

      {/* Unlock with Code Modal */}
      <UnlockCodeModal
        visible={isUnlockModalVisible}
        onClose={() => setUnlockModalVisible(false)}
        onSubmitCode={unlockVideoWithCode}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

export default VideoDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  floatingHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    zIndex: 999,
  },
  floatingLandscapeHeader: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    zIndex: 9999,
  },
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
