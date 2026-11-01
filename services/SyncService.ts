import { getSetting, saveSetting } from "@/lib/db/queries/settings.queries";
import { syncCatalogData } from "@/lib/db/sync";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/store/authStore";
import { SQLiteDatabase } from "expo-sqlite";
import { CatalogService } from "../api/CatalogService";

// that for testing in real time sync when serever change one time evry day at  7 pm if we sync after that we will not sync again until 7 pm
// const SYNC_INTERVAL = 3600 * 1000 * 24; // 1 day in milliseconds
const SYNC_INTERVAL = 60 * 1000; // 1 minute in milliseconds

let isSyncing = false; // Add a flag to prevent concurrent syncs

export const SyncService = {
  async run(db: SQLiteDatabase, force: boolean = false) {
    if (isSyncing) {
      console.log("SyncService: Sync already in progress. Skipping.");
      return;
    }

    console.log(`SyncService: Running sync check (force=${force})...`);
    isSyncing = true;

    try {
      if (!db) {
        console.log("SyncService: Database not available. Skipping.");
        isSyncing = false;
        return;
      }

      const { isAuthenticated, user, token } = useAuthStore.getState();

      if (!isAuthenticated || !token || !user?.grade_id) {
        console.log(
          "SyncService: Skipping sync, user not authenticated or grade_id missing."
        );
        isSyncing = false;
        return;
      }

      const lastSyncSetting = await getSetting(db, "last_sync_timestamp");
      const lastSync = lastSyncSetting
        ? parseInt(lastSyncSetting.value, 10)
        : 0;
      const now = Date.now();

      if (!force && now - lastSync < SYNC_INTERVAL) {
        console.log(
          `SyncService: Skipping sync, last sync was less than ${
            SYNC_INTERVAL / 1000
          }s ago.`
        );
        isSyncing = false;
        return;
      }

      console.log("SyncService: Starting catalog sync...");
      const catalogData = await CatalogService.fetchCatalog(
        user.grade_id!.toString()
      );
      console.log(
        "--- SERVER RESPONSE ---",
        JSON.stringify(catalogData, null, 2)
      );
      // Create a dummy grade object with the user's grade_id to satisfy the foreign key constraint.
      const dummyGrade = {
        id: user.grade_id,
        title: `Grade ${user.grade_id}`, // A placeholder title
        sort_order: 0,
        updated_at: new Date().toISOString(),
      };

      // Ensure the user's grade is included in the data to be synced
      const dataToSync = {
        ...catalogData,
        grades: [dummyGrade, ...(catalogData.grades || [])],
      };

      await syncCatalogData(db, dataToSync);

      await saveSetting(db, "last_sync_timestamp", now.toString());
      console.log("SyncService: Sync completed successfully.");

      // Notify the UI that a sync has happened so it can refetch data
      useAppStore.getState().actions.notifySyncCompleted();
    } catch (error) {
      console.error("SyncService: An error occurred during sync.", error);
    } finally {
      isSyncing = false; // Reset the flag
    }
  },
};
