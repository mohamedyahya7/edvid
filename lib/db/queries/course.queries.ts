import { type SQLiteDatabase } from "expo-sqlite";

export const getCoursesForGrade = async (
  db: SQLiteDatabase,
  gradeId: string
): Promise<any[]> => {
  return await db.getAllAsync("SELECT * FROM courses WHERE grade_id = ?;", [
    gradeId,
  ]);
};
