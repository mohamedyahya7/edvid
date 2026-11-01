import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAllTeachersScreen } from '@/hooks/useAllTeachersScreen';
import { BackButton } from '@/components/atoms/BackButton';
import { ThemedText } from '@/components/ui/ThemedText';
import { SyncService } from '@/services/SyncService';
import { useSQLiteContext } from 'expo-sqlite';

interface TeacherItemProps {
  teacher: any;
  onToggleFollow: (id: string, isFollowed: boolean) => void;
  onPress: (id: string) => void;
}

const TeacherCardItem = React.memo<TeacherItemProps>(({ teacher, onToggleFollow, onPress }) => {
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
      {/* Upper Section: Avatar & Info (Right), Follow Button (Left) */}
      <View style={styles.cardHeader}>
        {/* Right Info: Avatar + Details */}
        <View style={styles.teacherDetailsGroup}>
          <View style={[styles.avatarWrapper, { borderColor: colors.border }]}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>

          <View style={styles.teacherTextWrap}>
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

        {/* Left Action: Follow / Unfollow */}
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

      {/* Bio Snippet if exists */}
      {teacher.bio ? (
        <ThemedText style={styles.bioText} numberOfLines={2}>
          {teacher.bio}
        </ThemedText>
      ) : null}

      {/* Bottom Action Footer */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.footerActionText, { color: colors.primary }]}>
          تصفح الدورات والمحاضرات
        </ThemedText>
        <Ionicons name="chevron-back" size={13} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
});

export default function AllTeachersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ subjectId?: string }>();

  const { teachersBySubject, isLoading, refetchTeachers, toggleFollow } =
    useAllTeachersScreen();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    params.subjectId ? String(params.subjectId) : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('SyncService refresh error in AllTeachers:', e);
    }
    await refetchTeachers();
    setIsRefreshing(false);
  };

  // Build subject tabs from the grouped data
  const subjectTabs = useMemo(() => {
    return teachersBySubject.map((section) => ({
      id: String(section.id),
      title: section.title,
      count: section.data ? section.data.length : 0,
    }));
  }, [teachersBySubject]);

  const totalTeachersCount = useMemo(() => {
    return teachersBySubject.reduce((acc, s) => acc + (s.data ? s.data.length : 0), 0);
  }, [teachersBySubject]);

  // Flatten and filter teachers by selected subject and search query
  const filteredTeachers = useMemo(() => {
    let list: any[] = [];

    if (selectedSubjectId) {
      const targetSection = teachersBySubject.find(
        (s) => String(s.id) === String(selectedSubjectId)
      );
      list = targetSection && targetSection.data ? [...targetSection.data] : [];
    } else {
      list = teachersBySubject.flatMap((s) => (s.data ? s.data : []));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => {
        const nameMatch = t.name && t.name.toLowerCase().includes(q);
        const subjectMatch =
          t.subject_title && t.subject_title.toLowerCase().includes(q);
        const bioMatch = t.bio && t.bio.toLowerCase().includes(q);
        return nameMatch || subjectMatch || bioMatch;
      });
    }

    return list;
  }, [teachersBySubject, selectedSubjectId, searchQuery]);

  const handleNavigateToTeacher = (id: string) => {
    router.push({
      pathname: '/teacher/[id]',
      params: { id },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation Bar: Back Button (Right in RTL), Title (Center) */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <BackButton variant="solid" />

        <View style={styles.topBarCenter}>
          <ThemedText style={styles.topBarTitle}>نخبة المعلمين</ThemedText>
          <ThemedText style={styles.topBarSubtitle}>
            {selectedSubjectId
              ? `معلمو ${subjectTabs.find((s) => s.id === selectedSubjectId)?.title || 'المادة'}`
              : `جميع المدرسين (${totalTeachersCount})`}
          </ThemedText>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث باسم المدرس أو المادة..."
            placeholderTextColor="#8E8E93"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={17} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal Subject Filtering Tabs */}
      {subjectTabs.length > 0 && (
        <View style={[styles.tabsWrap, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {/* All Subjects Tab */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedSubjectId(null)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: !selectedSubjectId ? colors.primary : colors.card,
                  borderColor: !selectedSubjectId ? colors.primary : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: !selectedSubjectId ? '#FFFFFF' : colors.text },
                ]}
              >
                الكل ({totalTeachersCount})
              </ThemedText>
            </TouchableOpacity>

            {/* Individual Subject Tabs */}
            {subjectTabs.map((tab) => {
              const isSelected = selectedSubjectId === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSubjectId(isSelected ? null : tab.id)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {tab.title} ({tab.count})
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Teachers List or Loading / Empty state */}
      {isLoading && filteredTeachers.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTeachers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TeacherCardItem
              teacher={item}
              onToggleFollow={toggleFollow}
              onPress={handleNavigateToTeacher}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#8E8E93" style={{ marginBottom: 10 }} />
              <ThemedText style={styles.emptyTitle}>لا يوجد معلمون مطابقون</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {selectedSubjectId
                  ? 'لا يوجد معلمون مسجلون لهذه المادة في سنتك الدراسية حالياً.'
                  : 'جرب البحث بكلمات أخرى أو اختر مادة دراسية أخرى.'}
              </ThemedText>
              {(selectedSubjectId || searchQuery) && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedSubjectId(null);
                    setSearchQuery('');
                  }}
                  style={[styles.resetBtn, { backgroundColor: `${colors.primary}15` }]}
                >
                  <ThemedText style={[styles.resetBtnText, { color: colors.primary }]}>
                    عرض جميع المعلمين
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  topBarSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    textAlign: 'right',
  },
  clearBtn: {
    padding: 4,
  },
  tabsWrap: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teacherDetailsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: '#E5E5EA',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teacherTextWrap: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teacherName: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  followingBtn: {
    borderWidth: 1,
  },
  notFollowingBtn: {},
  followBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8E8E93',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerActionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
