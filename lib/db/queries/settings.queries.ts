import { SQLiteDatabase } from "expo-sqlite";

export const getSetting = async (db: SQLiteDatabase, key: string) => {
  return await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ?;",
    [key]
  );
};

export const saveSetting = async (
  db: SQLiteDatabase,
  key: string,
  value: string
) => {
  return await db.runAsync(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);",
    [key, value]
  );
};
