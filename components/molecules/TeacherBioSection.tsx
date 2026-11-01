import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface TeacherBioSectionProps {
  bio?: string | null;
  isFollowed: boolean;
  totalLessonsCount: number;
  freeLessonsCount: number;
  hasWhatsApp?: boolean;
  onToggleFollow: () => void;
  onWhatsApp?: () => void;
}

export const TeacherBioSection = React.memo<TeacherBioSectionProps>(({
  bio,
  isFollowed,
  totalLessonsCount,
  freeLessonsCount,
  hasWhatsApp = false,
  onToggleFollow,
  onWhatsApp,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* 1. Primary Action Row: Follow & WhatsApp */}
      <View style={styles.actionRow}>
        {/* Follow / Unfollow Primary Button (First child in row-reverse = Right) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleFollow}
          style={[
            styles.followBtn,
            isFollowed
              ? { backgroundColor: colors.card, borderColor: colors.border }
              : { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          <Ionicons
            name={isFollowed ? "checkmark-done-outline" : "person-add-outline"}
            size={16}
            color={isFollowed ? colors.text : "#FFFFFF"}
          />
          <Text
            style={[
              styles.followBtnText,
              { color: isFollowed ? colors.text : "#FFFFFF" },
            ]}
          >
            {isFollowed ? 'متابع بالفعل' : 'متابعة المدرس'}
          </Text>
        </TouchableOpacity>

        {/* WhatsApp Direct Chat Button (Second child in row-reverse = Left) */}
        {hasWhatsApp && onWhatsApp ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onWhatsApp}
            style={styles.chatBtn}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={17} color="#25D366" />
            <Text style={styles.chatBtnText}>تواصل واتساب</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 2. Numerical Summary Bar (Lectures, Free) */}
      <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalLessonsCount}
          </Text>
          <Text style={styles.statLabel}>إجمالي المحاضرات</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {freeLessonsCount}
          </Text>
          <Text style={styles.statLabel}>محاضرات مجانية</Text>
        </View>
      </View>

      {/* 3. Teacher Description / Bio */}
      {bio ? (
        <View style={[styles.bioBox, { backgroundColor: colors.background }]}>
          <Text style={[styles.bioTitle, { color: colors.primary }]}>نبذة تعريفية:</Text>
          <Text style={[styles.bioText, { color: colors.text }]}>{bio}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: -22,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    zIndex: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
  },
  chatBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#25D366',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  bioBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  bioTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'right',
    alignItems: 'flex-start',
  },
  bioText: {
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: 'right',
    alignItems: 'flex-start',
    opacity: 0.9,
  },
});
