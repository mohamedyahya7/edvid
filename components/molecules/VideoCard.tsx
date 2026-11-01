import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { storageUrl } from '@/api/Axios';
import { TeacherMetaRow } from '@/components/molecules/TeacherMetaRow';
import { ThemedText } from '@/components/ui/ThemedText';

export interface VideoCardProps {
  id: string | number;
  title: string;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  videoType?: 'free' | 'paid' | string;
  isLocked?: boolean;
  isCurrent?: boolean;
  progressPercent?: number; // 0-100 for watched progress
  lessonOrder?: string | null; // e.g. "المحاضرة 02"
  statusBadgeLabel?: string | null; // e.g. "كود شحن" / "متاح للجميع" / "محمل"
  statusBadgeColor?: string | null;

  // Teacher info
  teacherId?: string | number | null;
  teacherName?: string | null;
  teacherImage?: string | null;
  subjectName?: string | null;

  // Actions & Slots
  onPressVideo: () => void;
  onPressTeacher?: () => void;
  renderAction?: () => React.ReactNode;
  variant?: 'grid' | 'list';
  style?: StyleProp<ViewStyle>;
}

export const VideoCard = React.memo<VideoCardProps>(({
  title,
  youtubeId,
  thumbnailUrl,
  durationSeconds,
  videoType = 'free',
  isCurrent = false,
  progressPercent,
  lessonOrder,
  statusBadgeLabel,
  statusBadgeColor,
  teacherName,
  teacherImage,
  subjectName,
  onPressVideo,
  onPressTeacher,
  renderAction,
  variant = 'grid',
  style,
}) => {
  const { colors } = useTheme();

  // Resolve thumbnail
  let finalThumbnail = thumbnailUrl;
  if (!finalThumbnail && youtubeId) {
    finalThumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  } else if (finalThumbnail && !finalThumbnail.startsWith('http')) {
    finalThumbnail = storageUrl + finalThumbnail;
  }

  // Duration text
  const durationText = durationSeconds
    ? `${Math.floor(durationSeconds / 60)}:00`
    : '45:00';

  const isPaid = videoType === 'paid';

  if (variant === 'list') {
    return (
      <View
        style={[
          styles.listCard,
          {
            backgroundColor: colors.card,
            borderColor: isCurrent ? colors.primary : colors.border,
            borderWidth: isCurrent ? 1.5 : 1,
          },
          style,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressVideo}
          style={styles.listThumbnailTouch}
        >
          <View style={styles.listThumbnailWrapper}>
            {finalThumbnail ? (
              <Image source={{ uri: finalThumbnail }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnailPlaceholder, { backgroundColor: '#1C1C1E' }]}>
                <Ionicons name="videocam-outline" size={24} color="#636366" />
              </View>
            )}
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={11} color="#FFFFFF" style={{ marginLeft: 1 }} />
            </View>
            {durationSeconds ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{durationText}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={styles.listContent}>
          <TouchableOpacity activeOpacity={0.8} onPress={onPressVideo} style={styles.flexOne}>
            {lessonOrder ? (
              <View style={styles.lessonOrderRow}>
                <Ionicons name="bookmark-outline" size={11} color={colors.primary} />
                <ThemedText style={[styles.lessonOrder, { color: colors.primary }]}>
                  {lessonOrder}
                </ThemedText>
              </View>
            ) : null}
            <ThemedText style={styles.listTitle} numberOfLines={2}>
              {title}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.listFooter}>
            <TeacherMetaRow
              teacherName={teacherName}
              teacherImage={teacherImage}
              subjectName={subjectName}
              avatarSize={22}
              onPress={onPressTeacher}
            />
            {renderAction ? renderAction() : null}
          </View>
        </View>
      </View>
    );
  }

  // DEFAULT: 'grid' (2-column card)
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isCurrent ? colors.primary : colors.border,
          borderWidth: isCurrent ? 1.5 : 1,
        },
        style,
      ]}
    >
      {/* Upper Touch Zone: Video Player */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPressVideo}
        style={styles.videoTouchArea}
      >
        <View style={styles.thumbnailWrapper}>
          {finalThumbnail ? (
            <Image source={{ uri: finalThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnailPlaceholder, { backgroundColor: '#1C1C1E' }]}>
              <Ionicons name="videocam-outline" size={32} color="#636366" />
            </View>
          )}

          {/* Type Badge: Free vs Paid (on Right corner via start: 6 in RTL) */}
          <View style={styles.badgeWrapper}>
            <View
              style={[
                styles.typeBadge,
                isPaid
                  ? { backgroundColor: 'rgba(245, 158, 11, 0.95)' }
                  : { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons
                name={isPaid ? 'lock-closed' : 'gift-outline'}
                size={9.5}
                color={isPaid ? '#000000' : '#FFFFFF'}
                style={styles.badgeIcon}
              />
              <Text
                style={[
                  styles.typeBadgeText,
                  isPaid ? { color: '#000000' } : { color: '#FFFFFF' },
                ]}
              >
                {isPaid ? 'مدفوع' : 'مجاني'}
              </Text>
            </View>
          </View>

          {/* Duration Badge (on Left corner via end: 6 in RTL) */}
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={9.5} color="#FFFFFF" style={styles.badgeIcon} />
            <Text style={styles.durationText}>{durationText}</Text>
          </View>

          {/* Play Icon Overlay (on Right corner via start: 6 in RTL) */}
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={12} color="#FFFFFF" style={{ marginLeft: 1 }} />
          </View>

          {/* Optional Progress Bar */}
          {progressPercent !== undefined && progressPercent > 0 ? (
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, Math.max(0, progressPercent))}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          ) : null}
        </View>

        {/* Video Title */}
        <View style={styles.titleWrapper}>
          {lessonOrder ? (
            <View style={styles.lessonOrderRow}>
              <Ionicons name="bookmark-outline" size={11} color={colors.primary} />
              <ThemedText style={[styles.lessonOrder, { color: colors.primary }]}>
                {lessonOrder}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
        </View>
      </TouchableOpacity>

      {/* Status Bar / Price row if specified */}
      {statusBadgeLabel ? (
        <View style={[styles.statusRow, { borderTopColor: colors.border }]}>
          <Text style={styles.statusLabel}>الحالة:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: statusBadgeColor || (isPaid ? '#F59E0B' : '#34C759') },
            ]}
          >
            {statusBadgeLabel}
          </Text>
        </View>
      ) : null}

      {/* Lower Touch Zone: Composed Teacher Meta Molecule */}
      {teacherName ? (
        <View style={[styles.teacherRowWrapper, { borderTopColor: colors.border }]}>
          <TeacherMetaRow
            teacherName={teacherName}
            teacherImage={teacherImage}
            subjectName={subjectName}
            avatarSize={26}
            onPress={onPressTeacher}
          />
          {renderAction ? renderAction() : null}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3.5,
    marginBottom: 12,
  },
  videoTouchArea: {
    width: '100%',
  },
  thumbnailWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#000000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 6,
    start: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  badgeIcon: {
    marginHorizontal: 2,
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    end: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 6,
    start: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  progressBarFill: {
    height: '100%',
  },
  titleWrapper: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    width: '100%',
  },
  lessonOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  lessonOrder: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
    minHeight: 36,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
  },
  statusLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  statusValue: {
    fontSize: 10,
    fontWeight: '700',
  },
  teacherRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
  },

  // LIST VARIANT STYLES
  listCard: {
    flexDirection: 'row',
    borderRadius: 13,
    overflow: 'hidden',
    padding: 8,
    marginBottom: 10,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  listThumbnailTouch: {
    width: 110,
  },
  listThumbnailWrapper: {
    width: 110,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  flexOne: {
    flex: 1,
    width: '100%',
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
});
