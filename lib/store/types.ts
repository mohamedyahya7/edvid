export type Video = {
  id: string;
  title: string;
  course_id: string;
  teacher_id: string;
  video_type: "free" | "paid";
  youtube_id?: string;
  video_path?: string;
  audio_path?: string;
  subtitle_path?: string;
  is_unlocked: number;
  downloaded_size_bytes?: number;
  progress_seconds: number;
  is_favorite: number;
  duration_seconds?: number;
  updated_at: string;
  description?: string; // Added from course
  teacher_name?: string; // Added from join
  teacher_profile_picture_url?: string; // Added from join
  cover_image_url?: string; // Added from course
};

export interface StoreState {
  selectedGradeId: string | null;
  courses: any[];
  subjects: any[];
  suggestedTeachers: any[];
  freeVideos: Video[];
  videos: Video[];
  isLoading: boolean;
  selectedSubjectId: string | null;
  selectedTeacherIds: string[];
  db: any | null;
  explorePage: number;
  hasMoreExploreVideos: boolean;
}

export interface StoreActions {
  setDb: (db: any) => void;
  setSelectedGradeId: (gradeId: string) => void;
  fetchCourses: (db: any) => Promise<void>;
  fetchExploreData: (db: any) => Promise<void>;
  fetchVideosForCourse: (db: any, courseId: string) => Promise<void>;
  toggleSubjectFilter: (subjectId: string) => void;
  toggleTeacherFilter: (teacherId: string) => void;
  clearFilters: () => void;
  fetchMoreExploreVideos: (db: any) => Promise<void>;
}

// Define the types for our state
export interface AppState extends StoreState {
  actions: StoreActions;
}
