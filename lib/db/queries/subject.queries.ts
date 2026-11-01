import { SQLiteDatabase } from "expo-sqlite";

export const getSubjectById = async (
  db: SQLiteDatabase,
  subjectId: string
): Promise<{ id: string; title: string } | null> => {
  const subject = await db.getFirstAsync<any>(
    "SELECT id, title FROM subjects WHERE id = ? OR CAST(id AS TEXT) = CAST(? AS TEXT);",
    [subjectId, subjectId]
  );
  return subject;
};

export const getAllSubjects = async (db: SQLiteDatabase): Promise<any[]> => {
  const result = await db.getAllAsync<any>(
    `
    SELECT
      s.id, s.title, s.description, s.image, s.updated_at,
      CASE WHEN us.subject_id IS NOT NULL THEN 1 ELSE 0 END AS is_followed
    FROM subjects s
    LEFT JOIN user_subjects us ON CAST(s.id AS TEXT) = CAST(us.subject_id AS TEXT);
  `
  );
  return result;
};

export const getFollowedSubjectsCount = async (
  db: SQLiteDatabase
): Promise<number> => {
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_subjects;"
  );
  return result?.count ?? 0;
};

export const getFollowedSubjects = async (
  db: SQLiteDatabase
): Promise<any[]> => {
  const result = await db.getAllAsync<any>(
    `
    SELECT s.* FROM subjects s
    JOIN user_subjects us ON CAST(s.id AS TEXT) = CAST(us.subject_id AS TEXT)
    ORDER BY us.sort_order;
  `
  );
  return result;
};

export const followSubject = async (
  db: SQLiteDatabase,
  subjectId: string | number
): Promise<void> => {
  try {
    const subject = await db.getFirstAsync<{ id: any }>(
      "SELECT id FROM subjects WHERE id = ? OR CAST(id AS TEXT) = CAST(? AS TEXT) LIMIT 1;",
      [subjectId, subjectId]
    );
    const targetId = subject ? subject.id : subjectId;
    await db.runAsync(
      "INSERT OR REPLACE INTO user_subjects (subject_id) VALUES (?);",
      [targetId]
    );
  } catch (e) {
    console.error("followSubject error:", e);
  }
};

export const unfollowSubject = async (
  db: SQLiteDatabase,
  subjectId: string | number
): Promise<void> => {
  try {
    await db.runAsync(
      "DELETE FROM user_subjects WHERE subject_id = ? OR CAST(subject_id AS TEXT) = CAST(? AS TEXT);",
      [subjectId, subjectId]
    );
  } catch (e) {
    console.error("unfollowSubject error:", e);
  }
};
