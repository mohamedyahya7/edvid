import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { SubjectItem } from '@/components/SubjectItem';
import { SubjectListSkeleton } from '@/components/SubjectListSkeleton';
import {
  followSubject,
  getAllSubjects,
  unfollowSubject,
} from '@/lib/db/queries/subject.queries';
import { useAppStore } from '@/lib/store';
import { SyncService } from '@/services/SyncService';

type FilterTab = 'all' | 'followed' | 'unfollowed';

export default function SubjectsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { colors } = useTheme();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const fetchSubjects = async () => {
    try {
      const allSubjects = await getAllSubjects(db);
      setSubjects(allSubjects || []);
    } catch (e) {
      console.warn('fetchSubjects error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [db]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('SyncService refresh error in Subjects:', e);
    }
    await fetchSubjects();
  };

  const handleToggleFollow = async (subjectToToggle: any) => {
    const newStatus = !subjectToToggle.is_followed;
    // Optimistically update the UI
    setSubjects((currentSubjects) =>
      currentSubjects.map((subject) =>
        String(subject.id) === String(subjectToToggle.id)
          ? { ...subject, is_followed: newStatus ? 1 : 0 }
          : subject
      )
    );

    try {
      if (subjectToToggle.is_followed) {
        await unfollowSubject(db, subjectToToggle.id);
      } else {
        await followSubject(db, subjectToToggle.id);
      }
      // Instantly notify app store so ExploreScreen, AllTeachersScreen and Home refresh immediately
      useAppStore.getState().actions.notifySyncCompleted();
    } catch (error) {
      console.error('Failed to update follow status:', error);
      const updatedSubjects = await getAllSubjects(db);
      setSubjects(updatedSubjects);
    }
  };

  // Followed count calculation
  const followedCount = useMemo(() => {
    return subjects.filter((s) => Boolean(s.is_followed)).length;
  }, [subjects]);

  // Filtered and searched subjects
  const filteredSubjects = useMemo(() => {
    let result = subjects;

    if (activeTab === 'followed') {
      result = result.filter((s) => Boolean(s.is_followed));
    } else if (activeTab === 'unfollowed') {
      result = result.filter((s) => !Boolean(s.is_followed));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((s) =>
        (s.title || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [subjects, activeTab, searchQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>المواد الدراسية</Text>
          <Text style={styles.screenSubtitle}>
            {followedCount} مادة متابعة من أصل {subjects.length}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="ابحث عن مادة..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('all')}
          style={[
            styles.tabChip,
            activeTab === 'all'
              ? styles.activeTabChip
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            الكل ({subjects.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('followed')}
          style={[
            styles.tabChip,
            activeTab === 'followed'
              ? styles.activeTabChip
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'followed' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            المتابعة ({followedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('unfollowed')}
          style={[
            styles.tabChip,
            activeTab === 'unfollowed'
              ? styles.activeTabChip
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'unfollowed' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            غير المتابعة ({subjects.length - followedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <SubjectListSkeleton />
      ) : (
        <FlatList
          data={filteredSubjects}
          renderItem={({ item }) => (
            <SubjectItem item={item} onToggleFollow={handleToggleFollow} />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#00C897"
              colors={['#00C897']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(0, 200, 151, 0.08)' }]}>
                <Ionicons name="book-outline" size={32} color="#00C897" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد نتائج</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `لم نجد أي مادة مطابقة لبحث "${searchQuery}"`
                  : activeTab === 'followed'
                  ? 'لم تقم بمتابعة أي مادة حتى الآن'
                  : 'لا توجد مواد مسجلة حالياً'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 11.5,
    color: '#8E8E93',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeTabChip: {
    backgroundColor: '#00C897',
  },
  inactiveTabChip: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
