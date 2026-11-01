import { SQLiteDatabase } from "expo-sqlite";
import { DownloadTask } from "../../services/DownloadManager";
import { ReactNode } from "react";

export type Video = {
  subject_name: ReactNode;
  teacher_profile_picture_url: any;
  id: string;
  title: string;
  thumbnail: string;
  course_id: string;
  teacher_id: string;
  video_type: "free" | "paid";
  youtube_id?: string;
  is_unlocked: number;
  downloaded_size_bytes?: number;
  progress_seconds: number;
  is_favorite: number;
  duration_seconds?: number;
  updated_at: string;
  description?: string; // Added from course
  teacher_name?: string; // Added from join
  teacher_image?: string; // Added from join
  download_status?:
    | "COMPLETED"
    | "DOWNLOADING"
    | "PAUSED"
    | "QUEUED"
    | "FAILED"; // Added for local state
  local_video_path?: string;
  local_audio_path?: string;
  access_type?: "watch" | "download";
  watch_count?: number;
  download_expiry_date?: string;
  activation_code?: string;
  size?: number;
};

export interface StoreState {
  selectedGradeId: string | null;
  courses: any[];
  subjects: any[];
  suggestedTeachers: any[];
  totalSubjectTeachersCount: number;
  allTeachers: any[]; // Add new state for all teachers
  freeVideos: Video[];
  libraryVideos: Video[];
  isLoading: boolean;
  selectedSubjectId: string | null;
  selectedTeacherIds: string[];
  explorePage: number;
  hasMoreExploreVideos: boolean;
  downloadTasks: Map<string, DownloadTask>;
  lastDownloadCompletedTimestamp: number;
  lastSyncTimestamp: number; // For triggering refetches
}

export interface StoreActions {
  setSelectedGradeId: (gradeId: string) => void;
  fetchCourses: (db: SQLiteDatabase, gradeId: string) => Promise<void>;
  fetchExploreData: (db: SQLiteDatabase) => Promise<void>;
  fetchVideosForCourse: (db: SQLiteDatabase, courseId: string) => Promise<void>;
  toggleSubjectFilter: (db: SQLiteDatabase, subjectId: string) => void;
  toggleTeacherFilter: (db: SQLiteDatabase, teacherId: string) => void;
  clearFilters: (db: SQLiteDatabase) => void;
  fetchAllTeachers: (db: SQLiteDatabase, gradeId: string) => Promise<void>; // Add new action
  fetchMoreExploreVideos: (db: SQLiteDatabase) => Promise<void>;
  initializeDownloadManagerListener: () => void;
  notifyDownloadCompleted: () => void;
  notifySyncCompleted: () => void; // For triggering refetches
  fetchLibraryVideos: (db: SQLiteDatabase) => Promise<void>;
}

// Define the types for our state
export interface AppState extends StoreState {
  actions: StoreActions;
}
