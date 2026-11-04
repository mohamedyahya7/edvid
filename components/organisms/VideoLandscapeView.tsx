import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { ModernVideoPlayer } from '@/features/video-player/ModernVideoPlayer';
import { BackButton } from '@/components/atoms/BackButton';
import { UnlockCodeModal } from '@/components/organisms/UnlockCodeModal';

interface VideoLandscapeViewProps {
  sourceUri: string | null;
  videoType?: any;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  watermarkConfig: any;
  isLocked: boolean;
  initialPositionSeconds: number;
  onProgressChange: (pos: number) => void;
  onUnlockPress: () => void;
  onDownloadPress: () => void;
  isDownloading: boolean;
  isUnlockModalVisible: boolean;
  onCloseUnlockModal: () => void;
  onSubmitUnlockCode: (code: string) => void;
  isLoading: boolean;
}

export const VideoLandscapeView: React.FC<VideoLandscapeViewProps> = ({
  sourceUri,
  videoType,
  youtubeId,
  thumbnailUrl,
  watermarkConfig,
  isLocked,
  initialPositionSeconds,
  onProgressChange,
  onUnlockPress,
  onDownloadPress,
  isDownloading,
  isUnlockModalVisible,
  onCloseUnlockModal,
  onSubmitUnlockCode,
  isLoading,
}) => {
  return (
    <View style={styles.fullscreenContainer}>
      <StatusBar hidden />
      <View style={styles.floatingHeader} pointerEvents="box-none">
        <BackButton variant="glass" />
      </View>
      <ModernVideoPlayer
        sourceUri={sourceUri}
        videoType={videoType}
        youtubeId={youtubeId}
        thumbnailUrl={thumbnailUrl}
        watermarkConfig={watermarkConfig}
        autoPlay={true}
        isLocked={isLocked}
        initialPositionSeconds={initialPositionSeconds}
        onProgressChange={onProgressChange}
        onUnlockPress={onUnlockPress}
        onDownloadPress={onDownloadPress}
        isDownloading={isDownloading}
        isLandscape={true}
      />
      <UnlockCodeModal
        visible={isUnlockModalVisible}
        onClose={onCloseUnlockModal}
        onSubmitCode={onSubmitUnlockCode}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  floatingHeader: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    zIndex: 999,
  },
});
