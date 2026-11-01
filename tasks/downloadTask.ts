import {
  BackgroundFetchResult,
  registerTaskAsync,
} from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

// This will be the name of the background fetch task
export const BACKGROUND_DOWNLOAD_TASK = "background-download-checker";

interface ActiveDownload {
  videoId: string;
  videoTitle: string;
  progress: number;
}

// Define background task on native platforms only
if (Platform.OS !== "web") {
  TaskManager.defineTask(BACKGROUND_DOWNLOAD_TASK, async () => {
    console.log("[BackgroundFetch] Task running...");

    const activeDownloads: ActiveDownload[] = [];

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

    return activeDownloads.length > 0
      ? BackgroundFetchResult.NewData
      : BackgroundFetchResult.NoData;
  });
}

export default {};

/**
 * Registers the background fetch task.
 * This should be called once, when the app starts.
 */
export async function registerBackgroundFetchAsync() {
  if (Platform.OS === "web") {
    console.log("[BackgroundFetch] Skipping task registration on web.");
    return;
  }

  try {
    console.log("Registering background fetch task...");
    return await registerTaskAsync(BACKGROUND_DOWNLOAD_TASK, {
      minimumInterval: 5 * 60, // 5 minutes
      stopOnTerminate: false, // keep running even if app is closed
      startOnBoot: true, // start automatically after device reboot
    });
  } catch (error) {
    console.error("[BackgroundFetch] Failed to register task:", error);
  }
}
