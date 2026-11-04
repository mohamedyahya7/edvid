import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/ThemedText';

interface TeacherCatalogCardProps {
  teacher: any;
  onToggleFollow: (id: string, isFollowed: boolean) => void;
  onPress: (id: string) => void;
}

export const TeacherCatalogCard = React.memo<TeacherCatalogCardProps>(({
  teacher,
  onToggleFollow,
  onPress,
}) => {
  const { colors } = useTheme();

  const avatarUri =
    teacher.profile_picture_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(teacher.id.toString())}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.detailsGroup}>
          <View style={[styles.avatarWrapper, { borderColor: colors.border }]}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>

          <View style={styles.textWrap}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.teacherName} numberOfLines={1}>
                {teacher.name}
              </ThemedText>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            </View>

            {teacher.subject_title ? (
              <View style={[styles.subjectBadge, { backgroundColor: `${colors.primary}18` }]}>
                <ThemedText style={[styles.subjectBadgeText, { color: colors.primary }]}>
                  {teacher.subject_title}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onToggleFollow(teacher.id.toString(), teacher.is_followed)}
          style={[
            styles.followBtn,
            teacher.is_followed
              ? [styles.followingBtn, { borderColor: colors.primary, backgroundColor: `${colors.primary}12` }]
              : [styles.notFollowingBtn, { backgroundColor: colors.primary }],
          ]}
        >
          <Ionicons
            name={teacher.is_followed ? 'checkmark' : 'add'}
            size={13}
            color={teacher.is_followed ? colors.primary : '#FFFFFF'}
          />
          <ThemedText
            style={[
              styles.followBtnText,
              { color: teacher.is_followed ? colors.primary : '#FFFFFF' },
            ]}
          >
            {teacher.is_followed ? 'متابع' : 'متابعة'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {teacher.bio ? (
        <ThemedText style={styles.bioText} numberOfLines={2}>
          {teacher.bio}
        </ThemedText>
      ) : null}

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.footerActionText, { color: colors.primary }]}>
          تصفح الدورات والمحاضرات
        </ThemedText>
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
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  textWrap: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: '800',
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  followingBtn: {
    borderWidth: 1,
  },
  notFollowingBtn: {},
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
