import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAllTeachersScreen } from '@/hooks/useAllTeachersScreen';
import { TeachersCatalogHeader } from '@/components/organisms/TeachersCatalogHeader';
import { TeacherCatalogCard } from '@/components/molecules/TeacherCatalogCard';
import { ThemedText } from '@/components/ui/ThemedText';
import { SyncService } from '@/services/SyncService';

export default function AllTeachersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ subjectId?: string }>();

  const { teachersBySubject, isLoading, refetchTeachers, toggleFollow } = useAllTeachersScreen();

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
        const subjectMatch = t.subject_title && t.subject_title.toLowerCase().includes(q);
        const bioMatch = t.bio && t.bio.toLowerCase().includes(q);
        return nameMatch || subjectMatch || bioMatch;
      });
    }

    return list;
  }, [teachersBySubject, selectedSubjectId, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <TeachersCatalogHeader
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={setSelectedSubjectId}
        subjectTabs={subjectTabs}
        totalTeachersCount={totalTeachersCount}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
      />

      {isLoading && filteredTeachers.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTeachers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
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
              <ThemedText style={styles.emptyTitle}>لا يوجد مدرسين مطابقين للبحث</ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <TeacherCatalogCard
              teacher={item}
              onToggleFollow={toggleFollow}
              onPress={(id) => router.push({ pathname: '/teacher/[id]', params: { id } })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
});
