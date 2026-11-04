import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useExploreScreen } from '@/hooks/useExploreScreen';
import { ExploreTopAppBar } from '@/components/molecules/ExploreTopAppBar';
import { ExploreHeader } from '@/components/organisms/ExploreHeader';
import { ExploreVideoGrid } from '@/components/organisms/ExploreVideoGrid';
import ActivationModal from '@/components/organisms/ActivationModal';
import { SyncService } from '@/services/SyncService';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    subjects,
    suggestedTeachers,
    totalSubjectTeachersCount,
    freeVideos,
    isLoading,
    selectedSubjectId,
    selectedTeacherIds,
    isFetchingMore,
    toggleSubjectFilter,
    toggleTeacherFilter,
    clearFilters,
    handleLoadMore,
    refetchData,
  } = useExploreScreen();

  useEffect(() => {
    if (isFocused) {
      refetchData();
    }
  }, [isFocused, refetchData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('SyncService refresh error:', e);
    }
    await refetchData();
    setIsRefreshing(false);
  }, [db, refetchData]);

  const handleNavigateToTeacher = (id: string) => {
    router.push({ pathname: '/teacher/[id]', params: { id } });
  };

  const handleNavigateToAllTeachers = () => {
    router.push({
      pathname: '/all-teachers',
      params: selectedSubjectId ? { subjectId: selectedSubjectId } : undefined,
    });
  };

  if (isLoading && subjects.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ExploreVideoGrid
        videos={freeVideos}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isFetchingMore={isFetchingMore}
        onRefresh={onRefresh}
        onLoadMore={handleLoadMore}
        onOpenVideo={(id) => router.push({ pathname: '/video/[id]', params: { id } })}
        onNavigateToTeacher={handleNavigateToTeacher}
        ListHeaderComponent={
          <>
            <ExploreTopAppBar onOpenActivationModal={() => setModalVisible(true)} />
            <ExploreHeader
              subjects={subjects}
              selectedSubjectId={selectedSubjectId}
              toggleSubjectFilter={toggleSubjectFilter}
              clearFilters={clearFilters}
              suggestedTeachers={suggestedTeachers}
              selectedTeacherIds={selectedTeacherIds}
              toggleTeacherFilter={toggleTeacherFilter}
              totalSubjectTeachersCount={totalSubjectTeachersCount}
              freeVideosCount={freeVideos.length}
              onOpenActivationModal={() => setModalVisible(true)}
              onNavigateToTeacher={handleNavigateToTeacher}
              onNavigateToAllTeachers={handleNavigateToAllTeachers}
            />
          </>
        }
      />

      <ActivationModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
