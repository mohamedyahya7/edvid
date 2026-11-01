export type DownloadStatus = 'NOT_DOWNLOADED' | 'QUEUED' | 'DOWNLOADING' | 'COMPLETED' | 'FAILED';
export type VideoType = 'free' | 'paid';
export type AccessType = 'watch' | 'download';

export interface VideoModel {
  id: string;
  title: string;
  description?: string | null;
  course_id: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_image?: string | null;
  subject_name?: string | null;
  video_type: VideoType;
  youtube_id?: string | null;
  thumbnail?: string | null;
  duration_seconds?: number | null;
  price?: number | null;
  is_unlocked: boolean;
  download_status: DownloadStatus;
  local_video_path?: string | null;
  stream_url?: string | null;
  download_progress?: number; // 0 - 100
  downloaded_size_bytes?: number;
  total_size_bytes?: number;
  progress_seconds?: number;
  watch_count?: number;
  download_expiry_date?: string | null;
  updated_at?: string;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
}

export interface WatermarkConfig {
  studentName: string;
  studentPhone: string;
  studentCode?: string;
  opacity?: number;
  intervalMs?: number;
}
