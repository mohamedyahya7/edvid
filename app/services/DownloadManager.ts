import * as FileSystem from "expo-file-system";
import { type SQLiteDatabase } from "expo-sqlite";
import { ActivationService } from "../api/ActivationService";

/**
 * Represents a single download task managed by the DownloadManager.
 * Each task corresponds to one video and may involve downloading multiple files (video, audio, subtitles).
 */
export interface DownloadTask {
  videoId: string;
  videoTitle: string; // Added for notification purposes
  code: string; // The activation code used for the download
  videoUrl: string;
  audioUrl?: string;
  subtitleUrl?: string;
  status: "queued" | "downloading" | "paused" | "completed" | "failed";
  progress: number; // 0-100
  resumeData?: string; // To store resumable download state
  totalBytesExpected: number; // To show total size

  // Expo's download resumable object for each file type
  videoDownloader?: FileSystem.DownloadResumable;
  audioDownloader?: FileSystem.DownloadResumable;
  subtitleDownloader?: FileSystem.DownloadResumable;
  // To track individual file progress
  videoProgress: { downloadedBytes: number; totalBytes: number };
  audioProgress: { downloadedBytes: number; totalBytes: number };
  subtitleProgress: { downloadedBytes: number; totalBytes: number };
}

type TaskUpdateListener = (tasks: Map<string, DownloadTask>) => void;

/**
 * The DownloadManager handles the entire lifecycle of video downloads.
 * It maintains a queue of download tasks, processes them, and updates the database.
 */
class DownloadManager {
  private db: SQLiteDatabase | null = null;
  private activeTasks: Map<string, DownloadTask> = new Map();
  private downloadQueue: string[] = [];
  private readonly MAX_CONCURRENT_DOWNLOADS = 1; // Process one video at a time
  private updateListener: TaskUpdateListener | null = null;

  constructor() {
    // Here we could potentially load and resume any unfinished downloads
    // from the last session by checking the database.
    console.log("DownloadManager initialized.");
  }

  /**
   * Sets the database connection for the manager to use.
   * This must be called once the database is initialized.
   * @param db The SQLite database instance.
   */
  public setDb(db: SQLiteDatabase) {
    this.db = db;
  }

  public setUpdateListener(listener: TaskUpdateListener) {
    this.updateListener = listener;
  }

  private notifyUpdates() {
    if (this.updateListener) {
      this.updateListener(new Map(this.activeTasks));
    }
  }

  /**
   * Adds a new video to the download queue.
   * @param videoId The ID of the video to download.
   * @param videoTitle The title of the video for notifications.
   * @param code The activation code for the download.
   * @param urls The URLs for the video, audio, and subtitle files.
   */
  public async enqueueDownload(
    videoId: string,
    videoTitle: string,
    code: string,
    urls: { videoUrl: string; audioUrl?: string; subtitleUrl?: string }
  ) {
    if (this.activeTasks.has(videoId) || this.downloadQueue.includes(videoId)) {
      console.log(`Video ${videoId} is already in the download process.`);
      return;
    }

    if (!this.db) {
      console.error("Database is not set in DownloadManager.");
      return;
    }

    // Check if the video is already downloaded
    try {
      const videoData = await this.db.getFirstAsync<{
        download_status: string;
        local_video_path: string;
      }>(
        "SELECT download_status, local_video_path FROM videos WHERE id = ?;",
        videoId
      );

      if (
        videoData &&
        videoData.download_status === "COMPLETED" &&
        videoData.local_video_path
      ) {
        const fileInfo = await FileSystem.getInfoAsync(
          videoData.local_video_path
        );
        if (fileInfo.exists) {
          console.log(
            `Video ${videoId} is already downloaded and file exists.`
          );
          return; // Already downloaded
        } else {
          console.log(
            `Video ${videoId} marked as COMPLETED but file is missing. Re-downloading.`
          );
        }
      }
    } catch (error) {
      console.error(
        `Error checking database for existing download of video ${videoId}:`,
        error
      );
      // Decide if we should still proceed or not. For now, let's proceed.
    }

    // This needs to be fetched from the API response in a real scenario
    const task: DownloadTask = {
      videoId,
      videoTitle, // Store the title
      code, // Store the code
      videoUrl: urls.videoUrl,
      audioUrl: urls.audioUrl,
      subtitleUrl: urls.subtitleUrl,
      status: "queued",
      progress: 0,
      totalBytesExpected: 0, // Initialize total bytes
      videoProgress: { downloadedBytes: 0, totalBytes: 0 },
      audioProgress: { downloadedBytes: 0, totalBytes: 0 },
      subtitleProgress: { downloadedBytes: 0, totalBytes: 0 },
    };
    this.activeTasks.set(videoId, task);

    console.log(`Enqueuing video ${videoId} for download.`);
    try {
      // Update video status to 'queued' in the database.
      await this.db.runAsync(
        "UPDATE videos SET download_status = 'QUEUED' WHERE id = ?;",
        videoId
      );
      this.downloadQueue.push(videoId);
      this.notifyUpdates(); // Notify UI of the new queued task
      this.processQueue();
    } catch (error) {
      console.error(
        `Failed to update video ${videoId} status to QUEUED:`,
        error
      );
    }
  }

  /**
   * Processes the next item in the queue if there's a free slot.
   */
  private async processQueue() {
    const downloadingCount = Array.from(this.activeTasks.values()).filter(
      (task) => task.status === "downloading"
    ).length;

    if (
      downloadingCount >= this.MAX_CONCURRENT_DOWNLOADS ||
      this.downloadQueue.length === 0
    ) {
      return;
    }

    const videoId = this.downloadQueue.shift();
    if (videoId) {
      const task = this.activeTasks.get(videoId);
      if (task) {
        await this.startDownloadTask(task);
      }
    }
  }

  private async startDownloadTask(task: DownloadTask) {
    if (!this.db) {
      console.error("DB not set, cannot start download task.");
      return;
    }

    console.log(`Starting download for video ${task.videoId} from queue.`);
    task.status = "downloading";
    await this.db.runAsync(
      "UPDATE videos SET download_status = 'DOWNLOADING' WHERE id = ?;",
      task.videoId
    );
    this.notifyUpdates();

    // Define local file paths
    const videoFileUri =
      FileSystem.documentDirectory + `${task.videoId}_video.mp4`;
    const audioFileUri =
      FileSystem.documentDirectory + `${task.videoId}_audio.mp3`;

    // Create and start downloaders
    const videoDownloader = FileSystem.createDownloadResumable(
      task.videoUrl,
      videoFileUri,
      {},
      (progress) => this.updateTotalProgress(task.videoId, progress)
    );
    task.videoDownloader = videoDownloader;

    if (task.audioUrl) {
      const audioDownloader = FileSystem.createDownloadResumable(
        task.audioUrl,
        audioFileUri,
        {}
        // We only update progress based on the main video file for simplicity now
      );
      task.audioDownloader = audioDownloader;
    }

    try {
      // We will handle subtitle download later if needed.
      const [videoResult, audioResult] = await Promise.all([
        task.videoDownloader.downloadAsync(),
        task.audioDownloader?.downloadAsync(),
      ]);

      if (
        videoResult?.status === 200 &&
        (audioResult === undefined || audioResult?.status === 200)
      ) {
        // Download completed
        await this.onDownloadCompleted(task, {
          videoFileUri,
          audioFileUri,
        });
      } else {
        // Download failed
        await this.onDownloadFailed(task.videoId,task.code);
      }
    } catch (error) {
      console.error(`Error downloading video ${task.videoId}:`, error);
      await this.onDownloadFailed(task.videoId,task.code);
    }
  }

  private updateTotalProgress(
    videoId: string,
    progressData: FileSystem.DownloadProgressData
  ) {
    const task = this.activeTasks.get(videoId);
    if (!task) return;

    // For now, we'll track progress based on the video file alone.
    // A more complex implementation would aggregate all files.
    task.videoProgress.downloadedBytes = progressData.totalBytesWritten;
    task.videoProgress.totalBytes = progressData.totalBytesExpectedToWrite;
    task.totalBytesExpected = progressData.totalBytesExpectedToWrite; // Update total size

    const totalDownloaded = task.videoProgress.downloadedBytes;
    const totalSize = task.videoProgress.totalBytes;

    if (totalSize > 0) {
      task.progress = Math.round((totalDownloaded / totalSize) * 100);
      this.notifyUpdates(); // Notify UI of progress change
      // Here we can notify the UI about the progress change, e.g., via an event emitter or callback.
      console.log(`[In-App] Video ${videoId} progress: ${task.progress}%`);
    }
  }

  private async onDownloadCompleted(
    task: DownloadTask,
    paths: {
      videoFileUri: string;
      audioFileUri?: string;
      subtitleFileUri?: string;
    }
  ) {
    if (!this.db) {
      console.error("Database not set, cannot update on download completion.");
      return;
    }
    console.log(
      `Download completed for video ${task.videoId}. Updating database...`
    );
    
    if (task) {
      task.status = "completed";
      task.progress = 100;
    }

    try {
      const result = await this.db.runAsync(
        "UPDATE videos SET download_status = 'COMPLETED', local_video_path = ?, local_audio_path = ? , local_subtitle_path = ? WHERE id = ?;",
        paths.videoFileUri,
        paths.audioFileUri ?? null,
        paths.subtitleFileUri ?? null,
        task.videoId
      );
      const r = await ActivationService.notifyDownloadComplete(task.code);
      if (r) {
        console.log(`Download complete form donload manager`);
        alert(r.message);
        console.log(r);
      }
      if (result.changes > 0) {
        console.log(
          `Database updated successfully for video ${task.videoId}. Rows affected: ${result.changes}`
        );
        // Notify the API that the download is complete
        
      } else {
        console.warn(
          `Database update for video ${task.videoId} did not affect any rows.`
        );
      }
    } catch (error) {
      console.error(
        `Failed to update database for completed download of video ${task.videoId}:`,
        error
      );
    }

    this.activeTasks.delete(task.videoId);
    this.notifyUpdates(); // Notify UI that the task is finished
    this.processQueue();
  }

  private async onDownloadFailed(   videoId:string , code:string) {
    if (!this.db) return;
    console.error(`Download failed for video ${videoId}.`);
    const task = this.activeTasks.get(videoId);
    if (task) {
      task.status = "failed";
    }

    // TODO: Implement retry logic here
    await this.db.runAsync(
      "UPDATE videos SET download_status = 'FAILED' WHERE id = ?;",
      videoId
    );
    await ActivationService.notifyDownloadFailed(code);
    this.activeTasks.delete(videoId);
    this.notifyUpdates(); // Notify UI that the task failed
    this.processQueue();
  }

  /**
   * Pauses an active download.
   * @param videoId The ID of the video to pause.
   */
  public async pauseDownload(videoId: string) {
    const task = this.activeTasks.get(videoId);
    if (task && task.status === "downloading") {
      console.log(`Pausing download for video ${videoId}.`);
      // TODO:
      // 1. Pause all active FileSystem.DownloadResumable objects.
      // 2. Save their state.
      // 3. Update the task and database status to 'paused'.
    }
  }

  /**
   * Resumes a paused download.
   * @param videoId The ID of the video to resume.
   */
  public async resumeDownload(videoId: string) {
    const task = this.activeTasks.get(videoId);
    if (task && task.status === "paused") {
      console.log(`Resuming download for video ${videoId}.`);
      // TODO:
      // 1. Re-create FileSystem.DownloadResumable objects from saved state.
      // 2. Resume the downloads.
      // 3. Update the task and database status to 'downloading'.
    }
  }

  // Private helper methods for starting, updating, and completing downloads will go here.
}

// Export a singleton instance of the manager
export const downloadManager = new DownloadManager();
export default {};
