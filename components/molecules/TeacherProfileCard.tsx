import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { VideoModel } from '@/types/video';
import { TeacherMetaRow } from '@/components/molecules/TeacherMetaRow';
import { ThemedText } from '@/components/atoms/ThemedText';

interface TeacherProfileCardProps {
  video: VideoModel;
  onDeleteDownload?: () => void;
}

export const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({
  video,
  onDeleteDownload,
}) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handleTeacherPress = () => {
    if (video.teacher_id) {
      router.push(`/teacher/${video.teacher_id}` as any);
    }
  };

  const isYouTube = Boolean(video.youtube_id);
  const isDownloaded = video.download_status === 'COMPLETED' && Boolean(video.local_video_path);

  // Compute downloaded size in MB if available
  let downloadedSizeMB: string | null = null;
  if (isDownloaded && video.downloaded_size_bytes) {
    downloadedSizeMB = (video.downloaded_size_bytes / (1024 * 1024)).toFixed(0);
  } else if (isDownloaded && video.total_size_bytes) {
    downloadedSizeMB = (video.total_size_bytes / (1024 * 1024)).toFixed(0);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {/* 1. Full-Width Video Title (Anchored to Right) */}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.videoTitle}>
          {video.title}
        </ThemedText>
      </View>

      {/* 2. Sub-row: Right = Teacher Info, Left = Dynamic Stats & Trash */}
      <View style={[styles.subRow, { borderTopColor: colors.border }]}>
        {/* Right side: Composed TeacherMetaRow (First child in RTL row = Right edge) */}
        <TeacherMetaRow
          teacherName={video.teacher_name || 'مدرس المادة'}
          teacherImage={video.teacher_image}
          subjectName={video.subject_name || 'ثانوية عامة'}
          avatarSize={38}
          onPress={video.teacher_id ? handleTeacherPress : undefined}
          style={styles.teacherMetaRowStyle}
        />

        {/* Left side: Dynamic Stats (Second child in space-between = Left edge) */}
        <View style={styles.statsRow}>
          {/* YouTube Video Badge */}
          {isYouTube ? (
            <View style={[styles.statBadge, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Ionicons name="logo-youtube" size={13} color="#EF4444" />
              <Text style={[styles.statBadgeText, { color: '#EF4444' }]}>يوتيوب</Text>
            </View>
          ) : null}

          {/* Watch Count / Limit (Only if provided in database) */}
          {video.watch_count !== undefined && video.watch_count > 0 ? (
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {video.watch_count}
              </Text>
            </View>
          ) : null}

          {/* Downloaded Storage Size (ONLY if video is actually downloaded locally) */}
          {isDownloaded && downloadedSizeMB ? (
            <View style={styles.statItem}>
              <Ionicons name="folder-outline" size={14} color="#8E8E93" />
              <Text style={[styles.statText, { color: colors.text }]}>
                {downloadedSizeMB} MB
              </Text>
            </View>
          ) : null}

          {/* Delete Action (ONLY if video is downloaded locally) */}
          {isDownloaded && onDeleteDownload && (
            <TouchableOpacity
              onPress={onDeleteDownload}
              style={styles.trashBtn}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. Description directly below */}
      {video.description ? (
        <View style={[styles.descriptionBox, { backgroundColor: colors.background }]}>
          <ThemedText style={styles.descriptionText}>{video.description}</ThemedText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
  },
  titleContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 23,
    width: '100%',
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  teacherMetaRowStyle: {
    flexShrink: 1,
    maxWidth: '65%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trashBtn: {
    padding: 4,
  },
  descriptionBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 18,
    width: '100%',
  },
});
