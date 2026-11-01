import { type SQLiteDatabase } from "expo-sqlite";

export const getGrades = async (db: SQLiteDatabase): Promise<any[]> => {
  return await db.getAllAsync("SELECT * FROM grades ORDER BY sort_order ASC;");
};

export const getGradeById = async (
  db: SQLiteDatabase,
  gradeId: string
): Promise<{ id: string; title: string } | null> => {
  return await db.getFirstAsync("SELECT id, title FROM grades WHERE id = ?;", [
    gradeId,
  ]);
};
