import * as FileSystem from "expo-file-system";
import { SQLiteDatabase } from "expo-sqlite";
import { Alert } from "react-native";
import { ActivationService } from "../api/ActivationService";

/**
 * Represents a single download task managed by the DownloadManager.
 * Each task corresponds to one video and may involve downloading multiple files (video, audio, subtitles).
 */
export interface DownloadTask {
  videoId: string;
  videoTitle: string; // Added for notification purposes
  code: string; // Activation code, might be needed for re-authentication
  videoUrl: string;
  audioUrl?: string;
  subtitleUrl?: string;
  status: "queued" | "downloading" | "paused" | "completed" | "failed";
  progress: number; // 0-100
  videoResumeData?: string; // To store resumable download state for video
  audioResumeData?: string; // To store resumable download state for audio
  totalBytesExpected: number; // To show total size

  // Expo's download resumable object for each file type
  videoDownloader?: FileSystem.DownloadResumable;
  audioDownloader?: FileSystem.DownloadResumable;
  subtitleDownloader?: FileSystem.DownloadResumable;
  // To track individual file progress
  videoProgress: { downloadedBytes: number; totalBytes: number };
  audioProgress: { downloadedBytes: number; totalBytes: number };
  subtitleProgress: { downloadedBytes: number; totalBytes: number };
  access_type: "watch" | "download";
}

type TaskUpdateListener = (tasks: Map<string, DownloadTask>) => void;

/**
 * The DownloadManager handles the entire lifecycle of video downloads.
 * It maintains a queue of download tasks, processes them, and updates the database.
 */
class DownloadManager {
  private activeTasks: Map<string, DownloadTask> = new Map();
  private downloadQueue: string[] = [];
  private readonly MAX_CONCURRENT_DOWNLOADS = 1; // Process one video at a time
  private updateListener: TaskUpdateListener | null = null;
  private db: SQLiteDatabase | null = null;
  private onDownloadCompletedCallback: (() => void) | null = null;

  constructor() {
    console.log("DownloadManager initialized.");
  }

  public initialize(
    db: SQLiteDatabase,
    onDownloadCompletedCallback: () => void
  ) {
    this.db = db;
    this.onDownloadCompletedCallback = onDownloadCompletedCallback;
    console.log("DownloadManager database connection set.");
    // Here we could potentially load and resume any unfinished downloads
    // from the last session by checking the database.
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
    urls: { videoUrl: string; audioUrl?: string; subtitleUrl?: string },
    access_type: "watch" | "download",
    expiryDays?: number // New parameter for expiry in days
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
      code, // Store the activation code
      videoUrl: urls.videoUrl,
      audioUrl: urls.audioUrl,
      subtitleUrl: urls.subtitleUrl,

      status: "queued",
      progress: 0,
      totalBytesExpected: 0, // Initialize total bytes
      videoProgress: { downloadedBytes: 0, totalBytes: 0 },
      audioProgress: { downloadedBytes: 0, totalBytes: 0 },
      subtitleProgress: { downloadedBytes: 0, totalBytes: 0 },
      access_type,
    };
    this.activeTasks.set(videoId, task);

    console.log(`Enqueuing video ${videoId} for download.`);
    try {
      let expiryDate: string | null = null;
      // Only calculate expiry date for downloads, and if expiryDays is provided
      if (access_type === "download" && expiryDays && expiryDays > 0) {
        const date = new Date();
        date.setDate(date.getDate() + expiryDays); // Set expiry from server value
        expiryDate = date.toISOString();
      }

      // Update video status to 'queued' in the database.
      await this.db.runAsync(
        "UPDATE videos SET download_status = 'QUEUED', access_type = ?, download_expiry_date = ?, activation_code = ? WHERE id = ?;",
        access_type,
        expiryDate,
        task.code,
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
    const audioFileUri = task.audioUrl
      ? FileSystem.documentDirectory + `${task.videoId}_audio.mp3`
      : null;

    // Create and start downloaders
    const videoDownloader = FileSystem.createDownloadResumable(
      task.videoUrl,
      videoFileUri,
      {},
      (p) => this.updateTotalProgress(task.videoId, p, "video"),
      task.videoResumeData
    );

    let audioDownloader: FileSystem.DownloadResumable | undefined;
    if (task.audioUrl && audioFileUri) {
      audioDownloader = FileSystem.createDownloadResumable(
        task.audioUrl,
        audioFileUri,
        {},
        (p) => this.updateTotalProgress(task.videoId, p, "audio"),
        task.audioResumeData
      );
    }

    task.videoDownloader = videoDownloader;
    task.audioDownloader = audioDownloader;

    const promises = [videoDownloader.downloadAsync()];
    if (audioDownloader) {
      promises.push(audioDownloader.downloadAsync());
    }

    try {
      const results = await Promise.all(promises);
      const videoResult = results[0] as FileSystem.FileSystemDownloadResult;
      const audioResult = audioDownloader
        ? (results[1] as FileSystem.FileSystemDownloadResult)
        : null;

      // Check for pause state again after awaiting promises
      const latestTaskState = this.activeTasks.get(task.videoId);
      if (latestTaskState?.status === "paused") {
        console.log(
          "Download was paused, ignoring completion/failure handlers."
        );
        return;
      }

      if (videoResult?.uri) {
        this.onDownloadCompleted(task, videoResult.uri, audioResult?.uri);
      } else {
        throw new Error("Video download resulted in no URI.");
      }
    } catch (e: any) {
      console.error(`Error downloading video ${task.videoId}:`, e);
      await this.onDownloadFailed(task, String(e));
    }
  }

  private updateTotalProgress(
    videoId: string,
    progressData: FileSystem.DownloadProgressData,
    fileType: "video" | "audio"
  ) {
    const task = this.activeTasks.get(videoId);
    if (!task) return;

    // Create a new task object to ensure immutable update
    const newTask = { ...task };

    if (fileType === "video") {
      newTask.videoProgress = {
        downloadedBytes: progressData.totalBytesWritten,
        totalBytes: progressData.totalBytesExpectedToWrite,
      };
    } else if (fileType === "audio") {
      newTask.audioProgress = {
        downloadedBytes: progressData.totalBytesWritten,
        totalBytes: progressData.totalBytesExpectedToWrite,
      };
    }

    const totalDownloaded =
      (newTask.videoProgress?.downloadedBytes || 0) +
      (newTask.audioProgress?.downloadedBytes || 0);
    const totalSize =
      (newTask.videoProgress?.totalBytes || 0) +
      (newTask.audioProgress?.totalBytes || 0);

    newTask.totalBytesExpected = totalSize;

    if (totalSize > 0) {
      newTask.progress = Math.round((totalDownloaded / totalSize) * 100);
      this.activeTasks.set(videoId, newTask); // Update the map with the new task object
      this.notifyUpdates();
      console.log(`[In-App] Video ${videoId} progress: ${newTask.progress}%`);
    }
  }

  private async onDownloadCompleted(
    task: DownloadTask,
    videoFileUri: string,
    audioFileUri?: string
  ) {
    // Notify the store immediately to refresh the library UI
    this.onDownloadCompletedCallback?.();

    if (!this.db) return;
    console.log(`Download completed for video ${task.videoId}.`);
    if (task) {
      task.status = "completed";
      task.progress = 100;
    }

    try {
      const result = await this.db.runAsync(
        "UPDATE videos SET download_status = 'COMPLETED', local_video_path = ?, local_audio_path = ? , local_subtitle_path = ? WHERE id = ?;",
        videoFileUri,
        audioFileUri ?? null,
        null, // Subtitle path is not tracked in this simplified example
        task.videoId
      );

      if (result.changes > 0) {
        console.log(
          `DATABASE: Successfully updated video ${task.videoId} to COMPLETED.`
        );
      } else {
        console.error(
          `DATABASE_ERROR: Failed to update video ${task.videoId}. Video ID not found in the database.`
        );
      }

      // Notify the backend that the download is complete
      try {
        await ActivationService.notifyDownloadComplete(task.code);
        console.log(
          `[DownloadManager] Successfully notified server of completion for code ${task.code}`
        );
      } catch (serverError) {
        console.error(
          "Failed to notify server of download completion:",
          serverError
        );
        // Show a non-blocking alert to the user
        Alert.alert(
          "خطأ في المزامنة",
          "اكتمل التحميل بنجاح، ولكن فشل إبلاغ الخادم. قد تحتاج إلى المزامنة يدويًا لاحقًا."
        );
      }
    } catch (error) {
      console.error(
        `Failed to update database for completed video ${task.videoId}:`,
        error
      );
    }

    this.activeTasks.delete(task.videoId);
    this.notifyUpdates(); // Notify UI that the task is finished
    this.processQueue();
  }

  private async onDownloadFailed(task: DownloadTask, error?: string) {
    // Safety check: If the task was intentionally paused, don't treat it as a failure.
    const latestTaskState = this.activeTasks.get(task.videoId);
    if (latestTaskState?.status === "paused") {
      console.log("Ignoring failure because task is paused.");
      return;
    }

    if (!this.db) return;
    console.error(`Download failed for video ${task.videoId}.`, error);
    if (task) {
      task.status = "failed";
    }

    // Show an alert to the user with the error
    Alert.alert(
      "فشل التحميل",
      `لم يتم تحميل الفيديو "${task.videoTitle}". الخطأ: ${error}`
    );

    try {
      await this.db.runAsync(
        "UPDATE videos SET download_status = 'FAILED' WHERE id = ?;",
        task.videoId
      );
      // Notify the backend that the download failed
      await ActivationService.notifyDownloadFailed(task.code);
    } catch (dbError) {
      console.error(
        `Failed to update database for failed video ${task.videoId}:`,
        dbError
      );
    }

    this.activeTasks.delete(task.videoId);
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
      try {
        // Immediately update the status to prevent race conditions and ensure UI update
        const pausedTask = { ...task, status: "paused" as const };
        this.activeTasks.set(videoId, pausedTask);
        await this.db?.runAsync(
          "UPDATE videos SET download_status = 'PAUSED' WHERE id = ?;",
          videoId
        );
        this.notifyUpdates(); // Notify UI immediately

        let videoResumeData: string | undefined;
        let audioResumeData: string | undefined;

        if (pausedTask.videoDownloader) {
          const videoSaveState = await pausedTask.videoDownloader.pauseAsync();
          videoResumeData = videoSaveState.resumeData;
        }
        if (pausedTask.audioDownloader) {
          const audioSaveState = await pausedTask.audioDownloader.pauseAsync();
          audioResumeData = audioSaveState.resumeData;
        }

        // Update the task again with the resume data for future use
        const taskWithResumeData = {
          ...pausedTask,
          videoResumeData,
          audioResumeData,
        };
        this.activeTasks.set(videoId, taskWithResumeData);

        console.log("Download paused and state saved for all parts.");
      } catch (error) {
        console.error("Failed to pause download:", error);
        // If pausing fails, we should probably set the status back to failed
        await this.onDownloadFailed(
          task,
          `Failed to save pause state: ${error}`
        );
      }
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
      try {
        // --- Create a new task object for immutable update ---
        const resumingTask = { ...task };
        resumingTask.status = "downloading";

        // Re-create downloaders from saved state
        if (resumingTask.videoResumeData) {
          const videoFileUri =
            FileSystem.documentDirectory + `${resumingTask.videoId}_video.mp4`;
          resumingTask.videoDownloader = new FileSystem.DownloadResumable(
            resumingTask.videoUrl,
            videoFileUri,
            {},
            (p) => this.updateTotalProgress(resumingTask.videoId, p, "video"),
            resumingTask.videoResumeData
          );
        }

        if (resumingTask.audioUrl && resumingTask.audioResumeData) {
          const audioFileUri =
            FileSystem.documentDirectory + `${resumingTask.videoId}_audio.mp3`;
          resumingTask.audioDownloader = new FileSystem.DownloadResumable(
            resumingTask.audioUrl,
            audioFileUri,
            {},
            (p) => this.updateTotalProgress(resumingTask.videoId, p, "audio"),
            resumingTask.audioResumeData
          );
        }
        // --- End of re-creation ---

        // Update the state with the new task object before starting the download
        this.activeTasks.set(videoId, resumingTask);
        await this.db?.runAsync(
          "UPDATE videos SET download_status = 'DOWNLOADING' WHERE id = ?;",
          videoId
        );
        this.notifyUpdates();

        // Resume both downloads
        const [videoResult, audioResult] = await Promise.all([
          resumingTask.videoDownloader?.resumeAsync(),
          resumingTask.audioDownloader?.resumeAsync(),
        ]);

        // Re-fetch the task to get the most up-to-date status
        const latestTaskState = this.activeTasks.get(resumingTask.videoId);
        if (latestTaskState?.status === "paused") {
          console.log(
            "Download was paused (during resume), ignoring completion/failure handlers."
          );
          return;
        }

        if (videoResult?.uri) {
          await this.onDownloadCompleted(
            resumingTask,
            videoResult.uri,
            audioResult?.uri
          );
        } else {
          await this.onDownloadFailed(
            resumingTask,
            "Download failed after resume."
          );
        }
      } catch (error) {
        console.error(`Failed to resume download for ${videoId}:`, error);
        await this.onDownloadFailed(task, String(error));
      }
    }
  }

  public async cancelDownload(videoId: string) {
    const task = this.activeTasks.get(videoId);
    if (!task) return;

    console.log(`Canceling download for video ${videoId}.`);

    // If the task is downloading, pause it first to stop the network request
    if (task.status === "downloading" && task.videoDownloader) {
      try {
        await task.videoDownloader.pauseAsync();
      } catch (e) {
        console.error(
          "Failed to pause before canceling, proceeding anyway.",
          e
        );
      }
    }

    // Remove from active tasks and queue
    this.activeTasks.delete(videoId);
    const queueIndex = this.downloadQueue.indexOf(videoId);
    if (queueIndex > -1) {
      this.downloadQueue.splice(queueIndex, 1);
    }

    // Notify the backend
    await ActivationService.notifyDownloadCanceled(task.code);

    // Update the UI
    this.notifyUpdates();

    console.log(`Download for ${videoId} has been canceled.`);
    this.processQueue(); // Check if another download can start
  }

  // Private helper methods for starting, updating, and completing downloads will go here.
}

// Export a singleton instance of the manager
export const downloadManager = new DownloadManager();
export default {};
