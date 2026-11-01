import { type SQLiteDatabase } from "expo-sqlite";

export interface Migration {
  version: number;
  execute: (db: SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  // All migrations have been consolidated into the main schema.
  // This file can be used for future schema changes.
];
