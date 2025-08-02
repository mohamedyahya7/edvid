import { type SQLiteDatabase } from "expo-sqlite";

export const getExploreData = async (
  db: SQLiteDatabase,
  gradeId: string,
  subjectIds: string[] = [],
  teacherIds: string[] = [],
  page: number = 1,
  limit: number = 10
): Promise<{ subjects: any[]; teachers: any[]; freeVideos: any[] }> => {
  let subjectParams = [gradeId];
  let teacherParams = [gradeId];
  let videoParams: (string | number | string[])[] = ["free", gradeId];

  let subjectQuery = `
      SELECT s.* FROM subjects s
      JOIN courses c ON s.id = c.subject_id
      WHERE c.grade_id = ?
      GROUP BY s.id;
    `;

  let teacherQuery = `
      SELECT t.* FROM teachers t
      JOIN course_teachers ct ON t.id = ct.teacher_id
      JOIN courses c ON ct.course_id = c.id
      WHERE c.grade_id = ?
    `;

  if (subjectIds.length > 0) {
    const placeholders = subjectIds.map(() => "?").join(",");
    teacherQuery += ` AND c.subject_id IN (${placeholders})`;
    teacherParams.push(...subjectIds);
  }

  teacherQuery += ` GROUP BY t.id;`;

  let videoQuery = `
      SELECT
        v.id,
        v.title,
        v.video_type as type,
        v.youtube_id
      FROM videos v
      JOIN courses c ON v.course_id = c.id
      WHERE v.video_type = ? AND c.grade_id = ?
    `;

  if (subjectIds.length > 0) {
    const placeholders = subjectIds.map(() => "?").join(",");
    videoQuery += ` AND c.subject_id IN (${placeholders})`;
    videoParams.push(...subjectIds);
  }

  if (teacherIds.length > 0) {
    const placeholders = teacherIds.map(() => "?").join(",");
    videoQuery += ` AND v.teacher_id IN (${placeholders})`;
    videoParams.push(...teacherIds);
  }

  videoQuery += ` ORDER BY v.updated_at DESC LIMIT ? OFFSET ?;`;
  const offset = (page - 1) * limit;
  videoParams.push(limit, offset);

  const subjects = await db.getAllAsync(subjectQuery, subjectParams);
  const teachers = await db.getAllAsync(teacherQuery, teacherParams);
  const freeVideos = await db.getAllAsync(videoQuery, videoParams.flat());

  return { subjects, teachers, freeVideos };
};
