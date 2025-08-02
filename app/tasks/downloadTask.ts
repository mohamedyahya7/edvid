import {
  BackgroundFetchResult,
  registerTaskAsync,
} from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

// This will be the name of the background fetch task
export const BACKGROUND_DOWNLOAD_TASK = "background-download-checker";

interface ActiveDownload {
  videoId: string;
  videoTitle: string;
  progress: number;
}

// This is where we define the task that will run in the background
TaskManager.defineTask(BACKGROUND_DOWNLOAD_TASK, async () => {
  console.log("[BackgroundFetch] Task running...");

  // In a real app, we would need a way to access the database here.
  // This is a complex problem, as we can't easily share the DB connection
  // from the main app to a background task.
  //
  // A common solution is to use a separate, simple storage like AsyncStorage
  // to track download progress, or to initialize a new DB connection here.
  //
  // For now, we will simulate checking for active downloads.
  const activeDownloads: ActiveDownload[] = [
    // Example: { videoId: '123', videoTitle: 'My Awesome Video', progress: 50 }
  ];

  for (const download of activeDownloads) {
    await Notifications.scheduleNotificationAsync({
      identifier: `download_${download.videoId}`,
      content: {
        title: `Downloading: ${download.videoTitle}`,
        body: `${download.progress}% complete`,
        sticky: true,
      },
      trigger: null,
    });
  }

  // You must return a result from the task.
  // BackgroundFetch.Result.NewData indicates that new data was fetched.
  return activeDownloads.length > 0
    ? BackgroundFetchResult.NewData
    : BackgroundFetchResult.NoData;
});

export default {};

/**
 * Registers the background fetch task.
 * This should be called once, when the app starts.
 */
export async function registerBackgroundFetchAsync() {
  console.log("Registering background fetch task...");
  return registerTaskAsync(BACKGROUND_DOWNLOAD_TASK, {
    minimumInterval: 5 * 60, // 5 minutes
    stopOnTerminate: false, // keep running even if app is closed
    startOnBoot: true, // start automatically after device reboot
  });
}
