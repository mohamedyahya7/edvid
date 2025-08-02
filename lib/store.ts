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
};

// Create the store
export const useAppStore = createWithEqualityFn<AppState>((set, get, api) => ({
  ...initialState,
  ...createActions(set, get, api),
}));
