import { create } from "zustand";

import { downloadManager } from "@/services/DownloadManager";
import { SQLiteDatabase } from "expo-sqlite";
import { getCoursesForGrade } from "./db/queries/course.queries";
import { getExploreData } from "./db/queries/explore.queries";
import { getAllTeachersForGrade } from "./db/queries/teacher.queries";
import { fetchLibraryVideos } from "./db/queries/video.queries";
import { AppState, StoreActions } from "./store/types";

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  selectedGradeId: null,
  courses: [],
  subjects: [],
  suggestedTeachers: [],
  totalSubjectTeachersCount: 0,
  allTeachers: [],
  freeVideos: [],
  libraryVideos: [],
  isLoading: false,
  selectedSubjectId: null,
  selectedTeacherIds: [],
  explorePage: 1,
  hasMoreExploreVideos: true,
  downloadTasks: new Map(),
  lastDownloadCompletedTimestamp: 0,
  lastSyncTimestamp: 0,

  // Actions
  actions: {
    setSelectedGradeId: (gradeId: string) => set({ selectedGradeId: gradeId }),

    fetchExploreData: async (db: SQLiteDatabase) => {
      const { selectedGradeId, selectedSubjectId, selectedTeacherIds, subjects: currentSubjects } = get();
      if (!selectedGradeId) {
        console.warn("fetchExploreData skipped: selectedGradeId is null.");
        return;
      }
      // Only trigger full-screen loading on initial fetch to prevent lag/flash during filtering
      if (currentSubjects.length === 0) {
        set({ isLoading: true });
      }
      try {
        const subjectIds = selectedSubjectId ? [selectedSubjectId] : [];
        const { subjects, teachers, freeVideos, totalSubjectTeachersCount } = await getExploreData(
          db,
          selectedGradeId,
          subjectIds,
          selectedTeacherIds,
          1
        );
        set({
          subjects,
          suggestedTeachers: teachers,
          totalSubjectTeachersCount,
          freeVideos,
          isLoading: false,
          explorePage: 1,
          hasMoreExploreVideos: freeVideos.length > 0,
        });
      } catch (error) {
        console.error("Failed to fetch explore data:", error);
        set({ isLoading: false });
      }
    },

    fetchAllTeachers: async (db: SQLiteDatabase, gradeId: string) => {
      set({ isLoading: true });
      try {
        const teachers = await getAllTeachersForGrade(db, gradeId);
        set({ allTeachers: teachers as any, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch all teachers:", error);
        set({ isLoading: false });
      }
    },

    fetchCourses: async (db: SQLiteDatabase, gradeId: string) => {
      set({ isLoading: true });
      try {
        const courses = await getCoursesForGrade(db, gradeId);
        set({ courses, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        set({ isLoading: false });
      }
    },

    fetchVideosForCourse: async (db: SQLiteDatabase, courseId: string) => {
      set({ isLoading: true });
      // console.log(`Fetching videos for course: ${courseId}`);
      // Actual logic to fetch videos for a course would go here
      set({ isLoading: false });
    },

    toggleSubjectFilter: (db: SQLiteDatabase, subjectId: string) => {
      const { selectedSubjectId } = get();
      const newSelectedSubjectId =
        selectedSubjectId === subjectId ? null : subjectId;
      set({ selectedSubjectId: newSelectedSubjectId, selectedTeacherIds: [] });
      get().actions.fetchExploreData(db);
    },

    toggleTeacherFilter: (db: SQLiteDatabase, teacherId: string) => {
      const { selectedTeacherIds } = get();
      const newSelectedTeacherIds = selectedTeacherIds.includes(teacherId)
        ? selectedTeacherIds.filter((id) => id !== teacherId)
        : [...selectedTeacherIds, teacherId];
      set({ selectedTeacherIds: newSelectedTeacherIds });
      get().actions.fetchExploreData(db);
    },

    clearFilters: (db: SQLiteDatabase) => {
      set({ selectedSubjectId: null, selectedTeacherIds: [] });
      get().actions.fetchExploreData(db);
    },

    fetchMoreExploreVideos: async (db: SQLiteDatabase) => {
      const {
        selectedGradeId,
        selectedSubjectId,
        selectedTeacherIds,
        explorePage,
        hasMoreExploreVideos,
      } = get();
      if (!hasMoreExploreVideos || !selectedGradeId) {
        console.warn(
          "fetchMoreExploreVideos skipped: no more videos or selectedGradeId is null."
        );
        return;
      }

      const nextPage = explorePage + 1;
      try {
        const subjectIds = selectedSubjectId ? [selectedSubjectId] : [];
        const { freeVideos: newVideos } = await getExploreData(
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

    fetchLibraryVideos: async (db: SQLiteDatabase) => {
      try {
        const libraryVideos = await fetchLibraryVideos(db);
        set({ libraryVideos: libraryVideos });
      } catch (error) {
        console.error("Failed to fetch library videos:", error);
      }
    },

    initializeDownloadManagerListener: () => {
      downloadManager.setUpdateListener((tasks) => {
        set({ downloadTasks: new Map(tasks) });
      });
    },

    notifyDownloadCompleted: () =>
      set({ lastDownloadCompletedTimestamp: Date.now() }),

    notifySyncCompleted: () => set({ lastSyncTimestamp: Date.now() }),
  } as StoreActions,
}));

// Selectors
export const useAppActions = () => useAppStore((state) => state.actions);
export const useDownloadTasks = () =>
  useAppStore((state) => state.downloadTasks);
