import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/atoms/ActionButton';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { VideoModel } from '@/types/video';

interface VideoActionControlsProps {
  video: VideoModel;
  onPlayPress: () => void;
  onDownloadPress: () => void;
  onUnlockPress: () => void;
  onDeleteDownloadPress?: () => void;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export const VideoActionControls: React.FC<VideoActionControlsProps> = ({
  video,
  onPlayPress,
  onDownloadPress,
  onUnlockPress,
  onDeleteDownloadPress,
  isDownloading = false,
  downloadProgress = 0,
}) => {
  const isUnlocked = video.is_unlocked || video.video_type === 'free';
  const isDownloaded = video.download_status === 'COMPLETED';

  return (
    <View style={styles.container}>
      {!isUnlocked ? (
        <ActionButton
          title="ðŸ” ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙƒÙˆØ¯ Ù„ÙØªØ­ Ø§Ù„Ù…Ø­Ø§Ø¶Ø±Ø©"
          onPress={onUnlockPress}
          variant="primary"
          style={styles.fullWidthButton}
        />
      ) : (
        <View style={styles.actionGroup}>
          <ActionButton
            title="â–¶ ØªØ´ØºÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ"
            onPress={onPlayPress}
            variant="primary"
            style={styles.playButton}
          />

          {isDownloading ? (
            <View style={styles.downloadProgressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressText}>Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...</Text>
                <Text style={styles.percentageText}>{Math.round(downloadProgress)}%</Text>
              </View>
              <ProgressBar progress={downloadProgress} height={6} />
            </View>
          ) : isDownloaded ? (
            <View style={styles.downloadedStatusRow}>
              <Text style={styles.downloadedBadge}>âœ… Ø¬Ø§Ù‡Ø² Ù„Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© Ø¨Ø¯ÙˆÙ† Ø¥Ù†ØªØ±Ù†Øª</Text>
              {onDeleteDownloadPress && (
                <ActionButton
                  title="Ø­Ø°Ù"
                  onPress={onDeleteDownloadPress}
                  variant="outline"
                  style={styles.deleteButton}
                  textStyle={styles.deleteButtonText}
                />
              )}
            </View>
          ) : (
            <ActionButton
              title="â¬‡ ØªØ­Ù…ÙŠÙ„ Ù„Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© Ø£ÙˆÙÙ„Ø§ÙŠÙ†"
              onPress={onDownloadPress}
              variant="secondary"
              style={styles.downloadButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  actionGroup: {
    gap: 10,
  },
  fullWidthButton: {
    backgroundColor: '#2E7D32',
  },
  playButton: {
    backgroundColor: '#007AFF',
  },
  downloadButton: {
    backgroundColor: '#F2F2F7',
  },
  downloadProgressContainer: {
    paddingVertical: 8,
    gap: 6,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '700',
  },
  downloadedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  downloadedBadge: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '700',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 12,
  },
});
