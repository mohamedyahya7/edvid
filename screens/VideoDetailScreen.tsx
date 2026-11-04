import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoDetailController } from '@/hooks/useVideoDetailController';
import { useScreenProtection } from '@/hooks/useScreenProtection';
import { ModernVideoPlayer } from '@/features/video-player/ModernVideoPlayer';
import { TeacherProfileCard } from '@/components/molecules/TeacherProfileCard';
import { OtherVideosSection } from '@/components/organisms/OtherVideosSection';
import { UnlockCodeModal } from '@/components/organisms/UnlockCodeModal';
import { BackButton } from '@/components/atoms/BackButton';
import { VideoLandscapeView } from '@/components/organisms/VideoLandscapeView';

export default function VideoDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isLandscape } = useScreenProtection();

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

  const videoSourceUri =
    video.download_status === 'COMPLETED' && video.local_video_path
      ? video.local_video_path
      : video.stream_url || null;

  const isUnlocked = video.is_unlocked || video.video_type === 'free';
  const isDownloaded = video.download_status === 'COMPLETED';

  if (isLandscape) {
    return (
      <VideoLandscapeView
        sourceUri={videoSourceUri}
        videoType={video.video_type}
        youtubeId={video.youtube_id}
        thumbnailUrl={video.thumbnail}
        watermarkConfig={watermarkConfig}
        isLocked={!isUnlocked}
        initialPositionSeconds={video.progress_seconds || 0}
        onProgressChange={updateProgress}
        onUnlockPress={() => setUnlockModalVisible(true)}
        onDownloadPress={startDownload}
        isDownloading={isDownloading}
        isUnlockModalVisible={isUnlockModalVisible}
        onCloseUnlockModal={() => setUnlockModalVisible(false)}
        onSubmitUnlockCode={unlockVideoWithCode}
        isLoading={isLoading}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <View
        pointerEvents="box-none"
        style={[styles.floatingHeader, { top: Math.max(insets.top + 8, 14) }]}
      >
        <BackButton variant="glass" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
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

        <TeacherProfileCard
          video={video}
          onDeleteDownload={isDownloaded ? deleteDownload : undefined}
        />

        {otherVideos.length > 0 && (
          <OtherVideosSection videos={otherVideos} currentVideoId={video.id} />
        )}
      </ScrollView>

      <UnlockCodeModal
        visible={isUnlockModalVisible}
        onClose={() => setUnlockModalVisible(false)}
        onSubmitCode={unlockVideoWithCode}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

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
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
