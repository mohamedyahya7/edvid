import { downloadManager } from "@/app/services/DownloadManager";
import { createWithEqualityFn } from "zustand/traditional";
import { createActions } from "./store/actions";
import { AppState, StoreState } from "./store/types";

// Define the initial state
const initialState: StoreState = {
  selectedGradeId: null,
  courses: [],
  subjects: [],
  suggestedTeachers: [],
  freeVideos: [],
  videos: [],
  isLoading: false,
  selectedSubjectId: null,
  selectedTeacherIds: [],
  db: null,
  explorePage: 1,
  hasMoreExploreVideos: true,
  downloadTasks: new Map(),
};

// Create the store
export const useAppStore = createWithEqualityFn<AppState>((set, get, api) => ({
  ...initialState,
  ...createActions(set, get, api),

  // Download Manager Actions
  initializeDownloadManagerListener: () => {
    downloadManager.setUpdateListener((tasks) => {
      set({ downloadTasks: new Map(tasks) });
    });
  },
}));

// Selector to prevent unnecessary re-renders
export const useDownloadTasks = () =>
  useAppStore((state) => state.downloadTasks);
