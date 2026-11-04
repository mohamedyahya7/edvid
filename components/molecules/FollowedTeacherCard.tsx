import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FollowedTeacher } from '@/hooks/useFollowedTeachersScreen';

export interface FollowedTeacherCardProps {
  teacher: FollowedTeacher;
  onUnfollow: (id: string) => void;
  onPress: (id: string) => void;
}

export const FollowedTeacherCard = React.memo<FollowedTeacherCardProps>(({ teacher, onUnfollow, onPress }) => {
  const { colors } = useTheme();

  const avatarUri =
    teacher.profile_picture_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(teacher.id.toString())}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        {/* Right Info: Avatar + Details */}
        <View style={styles.teacherDetailsGroup}>
          <View style={[styles.avatarWrapper, { borderColor: colors.border }]}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>

          <View style={styles.teacherTextWrap}>
            <View style={styles.nameRow}>
              <Text style={[styles.teacherName, { color: colors.text }]} numberOfLines={1}>
                {teacher.name}
              </Text>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            </View>

            {teacher.subject_title ? (
              <View style={[styles.subjectBadge, { backgroundColor: `${colors.primary}18` }]}>
                <Text style={[styles.subjectBadgeText, { color: colors.primary }]}>
                  {teacher.subject_title}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Left Action: Unfollow button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onUnfollow(teacher.id.toString())}
          style={[styles.followingBtn, { borderColor: colors.primary, backgroundColor: `${colors.primary}12` }]}
        >
          <Ionicons name="heart" size={13} color={colors.primary} />
          <Text style={[styles.followBtnText, { color: colors.primary }]}>
            متابع
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bio Snippet if exists */}
      {teacher.bio ? (
        <Text style={styles.bioText} numberOfLines={2}>
          {teacher.bio}
        </Text>
      ) : null}

      {/* Bottom Action Footer */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerActionText, { color: colors.primary }]}>
          تصفح الدورات والمحاضرات
        </Text>
        <Ionicons name="chevron-back" size={13} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teacherDetailsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#00000010',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  teacherTextWrap: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  teacherName: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  followingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  followBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
    writingDirection: 'rtl',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerActionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
