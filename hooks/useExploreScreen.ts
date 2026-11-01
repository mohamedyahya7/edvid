import { useAppActions, useAppStore } from "@/lib/store";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export const useExploreScreen = () => {
  const {
    fetchExploreData,
    fetchMoreExploreVideos,
    toggleSubjectFilter,
    toggleTeacherFilter,
    clearFilters,
  } = useAppActions();

  const db = useSQLiteContext();
  const subjects = useAppStore((state) => state.subjects);
  const suggestedTeachers = useAppStore((state) => state.suggestedTeachers);
  const totalSubjectTeachersCount = useAppStore((state) => state.totalSubjectTeachersCount || 0);
  const freeVideos = useAppStore((state) => state.freeVideos);
  const isLoading = useAppStore((state) => state.isLoading);
  const selectedSubjectId = useAppStore((state) => state.selectedSubjectId);
  const selectedTeacherIds = useAppStore((state) => state.selectedTeacherIds);
  const hasMoreExploreVideos = useAppStore(
    (state) => state.hasMoreExploreVideos
  );
  const lastSyncTimestamp = useAppStore((state) => state.lastSyncTimestamp); // Listen to sync changes

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    fetchExploreData(db);
  }, [lastSyncTimestamp, fetchExploreData, db]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || isFetchingMore || !hasMoreExploreVideos) return;

    setIsFetchingMore(true);
    await fetchMoreExploreVideos(db);
    setIsFetchingMore(false);
  }, [
    isLoading,
    isFetchingMore,
    hasMoreExploreVideos,
    fetchMoreExploreVideos,
    db,
  ]);

  const handleToggleSubject = useCallback(
    (subjectId: string) => {
      toggleSubjectFilter(db, subjectId);
    },
    [db, toggleSubjectFilter]
  );

  const handleToggleTeacher = useCallback(
    (teacherId: string) => {
      toggleTeacherFilter(db, teacherId);
    },
    [db, toggleTeacherFilter]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters(db);
  }, [db, clearFilters]);

  const refetchData = useCallback(() => {
    fetchExploreData(db);
  }, [db, fetchExploreData]);

  return {
    subjects,
    suggestedTeachers,
    totalSubjectTeachersCount,
    freeVideos,
    isLoading,
    selectedSubjectId,
    selectedTeacherIds,
    hasMoreExploreVideos,
    isFetchingMore,
    toggleSubjectFilter: handleToggleSubject,
    toggleTeacherFilter: handleToggleTeacher,
    clearFilters: handleClearFilters,
    handleLoadMore,
    refetchData,
  };
};
