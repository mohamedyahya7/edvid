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
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';

import { useAllTeachersScreen } from '@/hooks/useAllTeachersScreen';
import { TeachersCatalogHeader } from '@/components/organisms/TeachersCatalogHeader';
import { TeacherCatalogCard } from '@/components/molecules/TeacherCatalogCard';
import { EmptyStateView } from '@/components/molecules/EmptyStateView';
import { useSyncRefresh } from '@/hooks/useSyncRefresh';
import { matchesQuery } from '@/utils/searchMatcher';

export default function AllTeachersScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { teachersBySubject, isLoading, refetchTeachers, toggleFollow } =
    useAllTeachersScreen();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Unified pull-to-refresh
  const { isRefreshing, onRefresh } = useSyncRefresh(refetchTeachers, {
    debugTag: 'AllTeachers',
  });

  const subjectTabs = useMemo(() => {
    return teachersBySubject.map((section) => ({
      id: section.id,
      title: section.title,
      count: (section.data || []).length,
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
      list = targetSection ? targetSection.data || [] : [];
    } else {
      list = teachersBySubject.flatMap((s) => (s.data ? s.data : []));
    }

    if (searchQuery.trim()) {
      list = list.filter((t) =>
        matchesQuery(t, searchQuery, (teacher) => [
          teacher.name,
          teacher.subject_title,
          teacher.bio,
        ])
      );
    }

    return list;
  }, [teachersBySubject, selectedSubjectId, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

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
            <EmptyStateView
              iconName="people-outline"
              title="لا يوجد مدرسين مطابقين للبحث"
              subtitle={
                searchQuery.trim()
                  ? `لم نجد أي مدرس يطابق "${searchQuery}"`
                  : 'لا يوجد معلمون مسجلون في هذا القسم حالياً'
              }
            />
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
});
