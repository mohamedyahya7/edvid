import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Resolution, VideoDetails } from '@/api/ActivationService';
import { storageUrl } from '@/api/Axios';

interface ActivationResolutionStepProps {
  video: VideoDetails;
  resolutions: Resolution[];
  selectedResolution: string | null;
  onSelectResolution: (res: string) => void;
  onWatchNow: () => void;
  onDownload: () => void;
}

export const ActivationResolutionStep: React.FC<ActivationResolutionStepProps> = ({
  video,
  resolutions,
  selectedResolution,
  onSelectResolution,
  onWatchNow,
  onDownload,
}) => {
  const { colors } = useTheme();

  const thumbnailUri = video.thumbnail
    ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${storageUrl}${video.thumbnail}`)
    : null;

  const teacherName = (video as any).teacher_name;
  const teacherImage = (video as any).teacher_image;
  const teacherImageUri = teacherImage
    ? (teacherImage.startsWith('http') ? teacherImage : `${storageUrl}${teacherImage}`)
    : null;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Success Badge */}
      <View style={[styles.badge, { backgroundColor: `${colors.primary}18` }]}>
        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
        <Text style={[styles.badgeText, { color: colors.primary }]}>تم العثور على الدرس بنجاح!</Text>
      </View>

      {/* Video Preview Card */}
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="play" size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
            {video.title}
          </Text>
          {teacherName && (
            <View style={styles.teacherRow}>
              {teacherImageUri ? (
                <Image source={{ uri: teacherImageUri }} style={styles.teacherAvatar} />
              ) : (
                <View style={[styles.teacherAvatar, styles.placeholderAvatar, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="person" size={12} color={colors.primary} />
                </View>
              )}
              <Text style={styles.teacherName}>{teacherName}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>اختر دقة المشاهدة أو التنزيل:</Text>

      {/* Resolutions Grid */}
      <View style={styles.resGrid}>
        {resolutions.map((res) => {
          const isSelected = selectedResolution === res.quality;
          return (
            <TouchableOpacity
              key={res.quality}
              activeOpacity={0.8}
              style={[
                styles.resPill,
                {
                  backgroundColor: isSelected ? `${colors.primary}20` : colors.background,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onSelectResolution(res.quality)}
            >
              <Text style={[styles.resText, { color: isSelected ? colors.primary : colors.text }]}>
                {res.quality}p
              </Text>
              {res.size_in_mb ? (
                <Text style={styles.resSize}>{res.size_in_mb} MB</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsCol}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }, !selectedResolution && styles.disabledBtn]}
          onPress={onWatchNow}
          disabled={!selectedResolution}
        >
          <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>شاهد الآن مباشرة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.background }, !selectedResolution && styles.disabledBtn]}
          onPress={onDownload}
          disabled={!selectedResolution}
        >
          <Ionicons name="cloud-download-outline" size={19} color={colors.text} />
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>تحميل للمشاهدة بدون إنترنت</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 10,
    gap: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
    gap: 10,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  placeholderThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  placeholderAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherName: {
    fontSize: 11,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  resGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resPill: {
    flex: 1,
    minWidth: '28%',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    gap: 2,
  },
  resText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resSize: {
    fontSize: 10,
    color: '#8E8E93',
  },
  actionsCol: {
    gap: 10,
    marginTop: 6,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
