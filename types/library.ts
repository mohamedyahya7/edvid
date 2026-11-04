export type LibraryFilterType = 'all' | 'offline' | 'stream';

export interface LibrarySubjectOption {
  name: string;
  count: number;
}

export interface LibraryTeacherOption {
  id: string;
  name: string;
  count: number;
}

export interface LibraryStorageStats {
  usedBytes: number;
  usedFormatted: string;
  totalFormatted: string;
  percentage: number;
  downloadedCount: number;
}

export interface LibraryVideoItem {
  id: string | number;
  title: string;
  description?: string;
  teacher_id?: string | number;
  teacher_name?: string;
  teacher_image?: string;
  subject_name?: string;
  duration_seconds?: number;
  file_size?: number;
  download_status?: string;
  effective_download_status?: string;
  access_type?: string;
  effective_access_type?: string;
  local_path?: string;
  thumbnail_url?: string;
  youtube_video_id?: string;
  [key: string]: any;
}
