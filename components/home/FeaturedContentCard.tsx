import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Video } from '@/lib/store/types';
import { storageUrl } from '@/api/Axios';
import { SectionHeader } from '@/components/molecules/SectionHeader';

type FeaturedContentCardProps = {
  video?: Video | null;
  onPress?: (video: Video) => void;
};

export const FeaturedContentCard = ({ video = null, onPress }: FeaturedContentCardProps) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (!video) return;
    if (onPress) {
      onPress(video);
    } else {
      router.push(`/video/${video.id}`);
    }
  };

  if (!video) {
    return (
      <View style={styles.container}>
        <SectionHeader
          title="واصل المشاهدة"
          subtitle="استكمل من حيث توقفت"
          iconName="play-circle-outline"
        />
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIconPill, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="film-outline" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            لم تبدأ بمشاهدة أي حصص بعد
          </Text>
          <Text style={styles.emptySubtitle}>
            استكشف الدروس المجانية وحصص معلميك المفضلين وابدأ التعلّم الآن.
          </Text>
        </View>
      </View>
    );
  }

  const durationSec = video.duration_seconds || 1800;
  const progressSec = video.progress_seconds || 0;
  const progressPercentage = durationSec > 0
    ? Math.min(Math.round((progressSec / durationSec) * 100), 100)
    : 0;

  let thumbnailUri = video.thumbnail
    ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${storageUrl}${video.thumbnail}`)
    : null;

  if (!thumbnailUri && video.youtube_id) {
    thumbnailUri = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
  }

  const teacherImageUri = video.teacher_image
    ? (video.teacher_image.startsWith('http') ? video.teacher_image : `${storageUrl}${video.teacher_image}`)
    : null;

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} دقيقة`;
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="واصل المشاهدة"
        subtitle="استكمل من حيث توقفت في حصتك السابقة"
        iconName="play-circle-outline"
      />

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Thumbnail Column (Right in RTL) */}
        <View style={styles.thumbnailWrap}>
          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="play" size={28} color={colors.primary} />
            </View>
          )}

          {/* Floating Play Overlay */}
          <View style={styles.playIconOverlay}>
            <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>

          {/* Duration Badge */}
          {durationSec > 0 && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatMinutes(durationSec)}</Text>
            </View>
          )}
        </View>

        {/* Video Info Column (Left in RTL) */}
        <View style={styles.infoCol}>
          <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
            {video.title}
          </Text>

          {/* Teacher and Subject Row */}
          {(video.teacher_name || video.subject_name) && (
            <View style={styles.teacherMetaRow}>
              {teacherImageUri ? (
                <Image source={{ uri: teacherImageUri }} style={styles.teacherAvatar} />
              ) : (
                <View style={[styles.teacherAvatar, styles.placeholderAvatar, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="person" size={10} color={colors.primary} />
                </View>
              )}
              <View style={styles.teacherMetaText}>
                {video.teacher_name && (
                  <Text style={[styles.teacherName, { color: colors.text }]} numberOfLines={1}>
                    {video.teacher_name}
                  </Text>
                )}
                {video.subject_name && (
                  <Text style={styles.subjectName} numberOfLines={1}>
                    {video.subject_name}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Progress Bar & Status */}
          <View style={styles.progressSection}>
            <View style={[styles.progressBarBg, { backgroundColor: `${colors.primary}18` }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.max(progressPercentage, 4)}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabelsRow}>
              <Text style={styles.progressPercentText}>
                {progressPercentage}% مكتمل
              </Text>
              <Text style={styles.remainingText}>
                متبقي {formatMinutes(Math.max(durationSec - progressSec, 0))}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    alignItems: 'center',
  },
  thumbnailWrap: {
    width: 124,
    aspectRatio: 16 / 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#00000010',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  videoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 19,
    writingDirection: 'rtl',
  },
  teacherMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teacherAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherMetaText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherName: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  subjectName: {
    fontSize: 10.5,
    color: '#8E8E93',
  },
  progressSection: {
    marginTop: 2,
    gap: 4,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 9.5,
    color: '#8E8E93',
  },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIconPill: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 17,
  },
});

export default FeaturedContentCard;
