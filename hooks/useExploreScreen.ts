import { useAppStore } from "@/lib/store";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { shallow } from "zustand/shallow";

export const useExploreScreen = () => {
  const db = useSQLiteContext();
  const {
    subjects,
    suggestedTeachers,
    freeVideos,
    isLoading,
    selectedGradeId,
    selectedSubjectId,
    selectedTeacherIds,
    hasMoreExploreVideos,
  } = useAppStore(
    (state) => ({
      subjects: state.subjects,
      suggestedTeachers: state.suggestedTeachers,
      freeVideos: state.freeVideos,
      isLoading: state.isLoading,
      selectedGradeId: state.selectedGradeId,
      selectedSubjectId: state.selectedSubjectId,
      selectedTeacherIds: state.selectedTeacherIds,
      hasMoreExploreVideos: state.hasMoreExploreVideos,
    }),
    shallow
  );

  const {
    fetchExploreData,
    toggleSubjectFilter,
    toggleTeacherFilter,
    clearFilters,
    setDb,
    fetchMoreExploreVideos,
  } = useAppStore((state) => state.actions);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    setDb(db);
  }, [db, setDb]);

  const loadData = useCallback(() => {
    if (selectedGradeId) {
      fetchExploreData(db);
    }
  }, [selectedGradeId, db, fetchExploreData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || isFetchingMore || !hasMoreExploreVideos) return;

    setIsFetchingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await fetchMoreExploreVideos(db);
    setIsFetchingMore(false);
  }, [
    isLoading,
    isFetchingMore,
    hasMoreExploreVideos,
    db,
    fetchMoreExploreVideos,
  ]);

  return {
    subjects,
    suggestedTeachers,
    freeVideos,
    isLoading,
    selectedSubjectId,
    selectedTeacherIds,
    hasMoreExploreVideos,
    isFetchingMore,
    toggleSubjectFilter,
    toggleTeacherFilter,
    clearFilters,
    handleLoadMore,
  };
};
