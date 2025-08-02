import { type SQLiteDatabase } from "expo-sqlite";

export const getGrades = async (db: SQLiteDatabase): Promise<any[]> => {
  return await db.getAllAsync("SELECT * FROM grades ORDER BY sort_order ASC;");
};
