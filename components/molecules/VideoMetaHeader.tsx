import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/atoms/Badge';
import { VideoModel } from '@/types/video';

interface VideoMetaHeaderProps {
  video: VideoModel;
  isUnlocked: boolean;
}

export const VideoMetaHeader: React.FC<VideoMetaHeaderProps> = ({ video, isUnlocked }) => {
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
        </View>
        <Badge
          label={video.video_type === 'free' ? 'Ù…Ø¬Ø§Ù†ÙŠ' : isUnlocked ? 'Ù…ÙØ¹Ù„' : 'Ù…Ø¯ÙÙˆØ¹'}
          variant={video.video_type === 'free' ? 'info' : isUnlocked ? 'success' : 'warning'}
        />
      </View>

      <View style={styles.teacherRow}>
        {video.teacher_image ? (
          <Image source={{ uri: video.teacher_image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {video.teacher_name ? video.teacher_name.charAt(0) : 'Ù…'}
            </Text>
          </View>
        )}
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{video.teacher_name || 'Ù…Ø¯Ø±Ø³ Ø§Ù„Ù…Ø§Ø¯Ø©'}</Text>
          <Text style={styles.durationText}>â± Ø§Ù„Ù…Ø¯Ø©: {formatDuration(video.duration_seconds)}</Text>
        </View>
      </View>

      {video.description ? (
        <Text style={styles.description}>{video.description}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    lineHeight: 24,
    textAlign: 'right',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  teacherInfo: {
    alignItems: 'flex-start',
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2C2E',
  },
  durationText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: '#48484A',
    lineHeight: 20,
    textAlign: 'right',
  },
});
