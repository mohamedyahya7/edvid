import { type SQLiteDatabase } from "expo-sqlite";
import { migrations } from "./migrations";
import { createTablesSQL } from "./schema";
import { generateMockDataSQL } from "./mockData";

export const DB_NAME = "bamboo_v1.db";
// Dynamically determine the latest version from the migrations array
export const LATEST_VERSION =
  migrations.length > 0 ? Math.max(...migrations.map((m) => m.version)) : 0;

export const runMigrations = async (db: SQLiteDatabase) => {
  await db.execAsync("PRAGMA foreign_keys = ON;");

  let currentVersion = (await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  ))!.user_version;

  console.log(
    `Database version: current=${currentVersion}, latest=${LATEST_VERSION}`
  );

  if (currentVersion === 0) {
    console.log("Database is new. Creating schema from scratch.");
    await db.execAsync(createTablesSQL);
    await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
  } else if (currentVersion < LATEST_VERSION) {
    console.log(`Database is outdated. Applying migrations...`);
    const migrationsToApply = migrations.filter(
      (m) => m.version > currentVersion
    );

    for (const migration of migrationsToApply) {
      try {
        await migration.execute(db);
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
        console.log(
          `Successfully applied migration version ${migration.version}`
        );
      } catch (error) {
        console.error(
          `Failed to apply migration version ${migration.version}:`,
          error
        );
        throw new Error(`Migration failed at version ${migration.version}`);
      }
    }
  }

  // Ensure initial catalog data exists if database is empty
  try {
    const videoCount = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM videos;"
    );
    if (!videoCount || videoCount.count === 0) {
      console.log("Populating database with initial mock catalog data...");
      await db.execAsync(generateMockDataSQL());
      await db.execAsync(`
        INSERT OR IGNORE INTO user_subjects (subject_id) VALUES ('s1'), ('s2');
        INSERT OR IGNORE INTO user_teachers (teacher_id) VALUES ('t1'), ('t2');
        INSERT OR IGNORE INTO app_settings (key, value) VALUES ('selected_grade_id', 'g1');
        UPDATE videos SET progress_seconds = 240 WHERE id = 'v1';
      `);
      console.log("Initial mock data populated successfully.");
    }
  } catch (e) {
    console.warn("Initial data seeding note:", e);
  }

  console.log("Database is up-to-date and ready.");
};
