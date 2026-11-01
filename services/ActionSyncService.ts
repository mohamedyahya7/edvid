import { DB_NAME } from "@/lib/db";
import {
  getPendingActions,
  incrementActionAttempt,
  removePendingAction,
} from "@/lib/db/queries/pendingActions.queries";
import * as BackgroundFetch from "expo-background-fetch";
import { openDatabaseSync } from "expo-sqlite";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { CatalogService } from "../api/CatalogService";

const ACTION_SYNC_TASK_NAME = "background-action-sync";

export const processPendingActions = async () => {
  console.log("[ActionSyncService] Starting to process pending actions...");
  // In background tasks, we can't use hooks. We need to open the DB connection directly.
  const database = openDatabaseSync(DB_NAME);
  const actions = await getPendingActions(database);

  if (actions.length === 0) {
    console.log("[ActionSyncService] No pending actions to process.");
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  console.log(`[ActionSyncService] Found ${actions.length} pending actions.`);

  for (const action of actions) {
    try {
      let success = false;
      const payload = JSON.parse(action.payload);

      switch (action.action_type) {
        case "like_video":
          success = await CatalogService.likeVideo(payload.videoId, true);
          break;
        case "unlike_video":
          success = await CatalogService.likeVideo(payload.videoId, false);
          break;
        case "follow_teacher":
          success = await CatalogService.followTeacher(payload.teacherId, true);
          break;
        case "unfollow_teacher":
          success = await CatalogService.followTeacher(
            payload.teacherId,
            false
          );
          break;
      }

      if (success) {
        await removePendingAction(database, action.id);
      } else {
        await incrementActionAttempt(database, action.id);
      }
    } catch (error) {
      console.error(
        `[ActionSyncService] Error processing action ${action.id}:`,
        error
      );
      await incrementActionAttempt(database, action.id);
    }
  }
  return BackgroundFetch.BackgroundFetchResult.NewData;
};

if (Platform.OS !== "web") {
  TaskManager.defineTask(ACTION_SYNC_TASK_NAME, async () => {
    try {
      return await processPendingActions();
    } catch (error) {
      console.error("[ActionSyncService] Task failed:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export const registerActionSyncTask = async () => {
  if (Platform.OS === "web") {
    console.log("[ActionSyncService] Skipping background action sync on web.");
    return;
  }

  try {
    await BackgroundFetch.registerTaskAsync(ACTION_SYNC_TASK_NAME, {
      minimumInterval: 60 * 60 * 2, // 2 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("[ActionSyncService] Background action sync task registered.");
  } catch (error) {
    console.error("[ActionSyncService] Failed to register task:", error);
  }
};
