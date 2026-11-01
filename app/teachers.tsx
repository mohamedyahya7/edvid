import React, { useCallback, useMemo, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';

import { useAllTeachersScreen } from '@/hooks/useAllTeachersScreen';
import { ThemedText } from '@/components/ui/ThemedText';
import { SyncService } from '@/services/SyncService';

interface FollowedTeacherCardProps {
  teacher: any;
  onUnfollow: (id: string) => void;
  onPress: (id: string) => void;
}

const FollowedTeacherCard = React.memo<FollowedTeacherCardProps>(({ teacher, onUnfollow, onPress }) => {
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

        {/* Left Action: Unfollow button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onUnfollow(teacher.id.toString())}
          style={[styles.followingBtn, { borderColor: colors.primary, backgroundColor: `${colors.primary}12` }]}
        >
          <Ionicons name="heart" size={13} color={colors.primary} />
          <ThemedText style={[styles.followBtnText, { color: colors.primary }]}>
            متابع
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

export default function TeachersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const db = useSQLiteContext();

  const { teachersBySubject, isLoading, refetchTeachers, toggleFollow } =
    useAllTeachersScreen();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('SyncService refresh error in Teachers:', e);
    }
    await refetchTeachers();
    setIsRefreshing(false);
  };

  // Filter only followed teachers
  const allFollowedTeachers = useMemo(() => {
    const list: any[] = [];
    teachersBySubject.forEach((section) => {
      (section.data || []).forEach((t: any) => {
        if (t.is_followed) {
          list.push({
            ...t,
            subject_id: section.id,
            subject_title: section.title,
          });
        }
      });
    });
    return list;
  }, [teachersBySubject]);

  // Build subject tabs from followed teachers
  const subjectTabs = useMemo(() => {
    const subjectsMap = new Map<string, { id: string; title: string; count: number }>();
    allFollowedTeachers.forEach((t) => {
      const sId = String(t.subject_id);
      if (!subjectsMap.has(sId)) {
        subjectsMap.set(sId, { id: sId, title: t.subject_title, count: 0 });
      }
      subjectsMap.get(sId)!.count += 1;
    });
    return Array.from(subjectsMap.values());
  }, [allFollowedTeachers]);

  // Apply filters: Subject + Search Query
  const displayedTeachers = useMemo(() => {
    let result = allFollowedTeachers;

    if (selectedSubjectId) {
      result = result.filter((t) => String(t.subject_id) === String(selectedSubjectId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.subject_title && t.subject_title.toLowerCase().includes(q)) ||
          (t.bio && t.bio.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allFollowedTeachers, selectedSubjectId, searchQuery]);

  const handleNavigateToTeacher = useCallback(
    (id: string) => {
      router.push({
        pathname: '/teacher/[id]',
        params: { id },
      });
    },
    [router]
  );

  const handleUnfollow = useCallback(
    (id: string) => {
      // currentStatus = true -> toggles to unfollow (false)
      toggleFollow(id, true);
    },
    [toggleFollow]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <ThemedText style={styles.screenTitle}>مدرسينك المتابعون</ThemedText>
          <ThemedText style={styles.screenSubtitle}>
            {allFollowedTeachers.length > 0
              ? `${allFollowedTeachers.length} مدرس تتابعهم`
              : 'قائمتك المفضلة من المدرسين'}
          </ThemedText>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/all-teachers')}
          style={[styles.exploreAllBtn, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` }]}
        >
          <Ionicons name="compass-outline" size={16} color={colors.primary} />
          <ThemedText style={[styles.exploreAllBtnText, { color: colors.primary }]}>
            كل المدرسين
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {allFollowedTeachers.length > 0 && (
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="ابحث بين مدرسينك بالاسم أو المادة..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Horizontal Subject Filter Tabs */}
      {subjectTabs.length > 1 && (
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedSubjectId(null)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedSubjectId === null ? colors.primary : colors.card,
                  borderColor: selectedSubjectId === null ? colors.primary : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: selectedSubjectId === null ? '#FFFFFF' : colors.text },
                ]}
              >
                الكل ({allFollowedTeachers.length})
              </ThemedText>
            </TouchableOpacity>

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

      {/* Content List */}
      {isLoading && allFollowedTeachers.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedTeachers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FollowedTeacherCard
              teacher={item}
              onUnfollow={handleUnfollow}
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
              <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="people-outline" size={36} color={colors.primary} />
              </View>
              <ThemedText style={styles.emptyTitle}>
                {searchQuery.trim()
                  ? 'لا يوجد مدرس مطابق لبحثك'
                  : 'أنت لا تتابع أي معلمين حالياً'}
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? 'جرّب كتابة اسم آخر أو مادة مختلفة.'
                  : 'تابع نخبة معلمي المواد الدراسية لتصلك حصصهم وإشعاراتهم أولاً بأول.'}
              </ThemedText>
              {!searchQuery.trim() && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/all-teachers')}
                  style={[styles.discoverBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.discoverBtnText}>استكشف المعلمين</ThemedText>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    gap: 2,
  },
  screenTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  exploreAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  exploreAllBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchIcon: {
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  tabsWrapper: {
    marginTop: 6,
    marginBottom: 2,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 6,
  },
  discoverBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
