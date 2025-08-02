import { type SQLiteDatabase } from "expo-sqlite";
import { downloadManager } from "../app/services/DownloadManager";
import { generateMockDataSQL } from "./db/mockData";
import * as courseQueries from "./db/queries/course.queries";
import * as exploreQueries from "./db/queries/explore.queries";
import * as gradeQueries from "./db/queries/grade.queries";
import * as teacherQueries from "./db/queries/teacher.queries";
import * as videoQueries from "./db/queries/video.queries";
import { createTablesSQL } from "./db/schema";

const initializeDatabase = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(createTablesSQL);
  console.log("Database tables created successfully.");

  // Set the db connection for the download manager
  downloadManager.setDb(db);
  console.log("Database connection set for DownloadManager.");

  const mockDataSQL = generateMockDataSQL();
  await db.execAsync(mockDataSQL);
  console.log("Mock data added successfully.");
};

export const databaseService = {
  initializeDatabase,
  ...gradeQueries,
  ...courseQueries,
  ...exploreQueries,
  ...videoQueries,
  ...teacherQueries,
};
