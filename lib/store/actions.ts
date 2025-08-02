import { downloadManager } from "@/app/services/DownloadManager";
import { StateCreator } from "zustand";
import { databaseService } from "../DatabaseService";
import { AppState, StoreActions } from "./types";

export const createActions: StateCreator<
  AppState,
  [],
  [],
  { actions: StoreActions }
> = (set, get) => ({
  actions: {
    setDb: (db) => set({ db }),
    setSelectedGradeId: (gradeId) => set({ selectedGradeId: gradeId }),
    fetchCourses: async (db) => {
      const { selectedGradeId } = get();
      if (!selectedGradeId) return;

      set({ isLoading: true });
      try {
        const courses = await databaseService.getCoursesForGrade(
          db,
          selectedGradeId
        );
        set({ courses, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        set({ isLoading: false });
      }
    },
    fetchExploreData: async (db) => {
      const { selectedGradeId, selectedSubjectId, selectedTeacherIds } = get();
      if (!selectedGradeId) return;

      set({
        isLoading: true,
        freeVideos: [],
        explorePage: 1,
        hasMoreExploreVideos: true,
      });
      try {
        const subjectIds = selectedSubjectId ? [selectedSubjectId] : [];
        const { subjects, teachers, freeVideos } =
          await databaseService.getExploreData(
            db,
            selectedGradeId,
            subjectIds,
            selectedTeacherIds,
            1 // Fetch page 1
          );
        set({
          subjects,
          suggestedTeachers: teachers,
          freeVideos,
          isLoading: false,
          hasMoreExploreVideos: freeVideos.length > 0,
        });
      } catch (error) {
        console.error("Failed to fetch explore data:", error);
        set({ isLoading: false });
      }
    },
    fetchVideosForCourse: async (db, courseId) => {
      set({ isLoading: true });
      // In the future, this will call a function in DatabaseService
      // const videos = await databaseService.getVideosForCourse(courseId);
      // set({ videos, isLoading: false });
      console.log(`Fetching videos for course: ${courseId}`);
      set({ isLoading: false }); // Placeholder
    },
    toggleSubjectFilter: (subjectId) => {
      const { selectedSubjectId } = get();
      const newSelectedSubjectId =
        selectedSubjectId === subjectId ? null : subjectId;
      set({
        selectedSubjectId: newSelectedSubjectId,
        selectedTeacherIds: [],
      }); // Reset teachers when subject changes
      get().actions.fetchExploreData(get().db);
    },
    toggleTeacherFilter: (teacherId) => {
      const { selectedTeacherIds } = get();
      const newSelectedTeacherIds = selectedTeacherIds.includes(teacherId)
        ? selectedTeacherIds.filter((id) => id !== teacherId)
        : [...selectedTeacherIds, teacherId];
      set({ selectedTeacherIds: newSelectedTeacherIds });
      get().actions.fetchExploreData(get().db);
    },
    clearFilters: () => {
      set({ selectedSubjectId: null, selectedTeacherIds: [] });
      get().actions.fetchExploreData(get().db);
    },
    fetchMoreExploreVideos: async (db) => {
      const {
        selectedGradeId,
        selectedSubjectId,
        selectedTeacherIds,
        explorePage,
        hasMoreExploreVideos,
      } = get();
      if (!hasMoreExploreVideos || !selectedGradeId) return;

      const nextPage = explorePage + 1;
      try {
        const subjectIds = selectedSubjectId ? [selectedSubjectId] : [];
        const { freeVideos: newVideos } = await databaseService.getExploreData(
          db,
          selectedGradeId,
          subjectIds,
          selectedTeacherIds,
          nextPage
        );
        set((state) => ({
          freeVideos: [...state.freeVideos, ...newVideos],
          explorePage: nextPage,
          hasMoreExploreVideos: newVideos.length > 0,
        }));
      } catch (error) {
        console.error("Failed to fetch more explore videos:", error);
      }
    },
    initializeDownloadManagerListener: () => {
      downloadManager.setUpdateListener((tasks) => {
        set({ downloadTasks: new Map(tasks) });
      });
    },
  },
});
