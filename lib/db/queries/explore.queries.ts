import { storageUrl } from "@/api/Axios";
import { type SQLiteDatabase } from "expo-sqlite";

export const getExploreData = async (
  db: SQLiteDatabase,
  gradeId: string,
  subjectIds: string[] = [],
  teacherIds: string[] = [],
  page: number = 1,
  limit: number = 10
): Promise<{
  subjects: any[];
  teachers: any[];
  freeVideos: any[];
  totalSubjectTeachersCount: number;
}> => {
  let subjectParams: (string | number)[] = [];
  let teacherParams = [gradeId];
  let videoParams: (string | number)[] = ["free", gradeId]; // Initialize with primitive types only

  // Show all subjects followed by the student
  let subjectQuery = `
      SELECT s.* FROM subjects s
      JOIN user_subjects us ON s.id = us.subject_id
      GROUP BY s.id;
    `;

  // Fetch only teachers who ACTUALLY have free videos for this grade
  let teacherQuery = `
      SELECT 
        t.*,
        s.title as subject_name 
      FROM teachers t
      JOIN subjects s ON t.subject_id = s.id
      JOIN courses c ON t.id = c.teacher_id
      JOIN user_subjects us ON t.subject_id = us.subject_id
      JOIN videos v ON v.course_id = c.id AND v.teacher_id = t.id AND v.video_type = 'free'
      WHERE c.grade_id = ?
    `;

  // Total teachers query for calculating (free teachers / total teachers of subject)
  let totalTeachersQuery = `
      SELECT COUNT(DISTINCT t.id) as total_count
      FROM teachers t
      JOIN subjects s ON t.subject_id = s.id
      JOIN courses c ON t.id = c.teacher_id
      JOIN user_subjects us ON t.subject_id = us.subject_id
      WHERE c.grade_id = ?
    `;
  let totalParams: (string | number)[] = [gradeId];

  if (subjectIds.length > 0) {
    const placeholders = subjectIds.map(() => "?").join(",");
    teacherQuery += ` AND t.subject_id IN (${placeholders})`;
    teacherParams.push(...subjectIds);

    totalTeachersQuery += ` AND t.subject_id IN (${placeholders})`;
    totalParams.push(...subjectIds);
  }

  teacherQuery += ` GROUP BY t.id;`;

  let videoQuery = `
      SELECT
        v.id,
        v.title,
        v.video_type,
        v.youtube_id,
        v.thumbnail,
        v.teacher_id,
        t.name as teacher_name,
        t.profile_picture_url as teacher_image,
        s.title as subject_name
      FROM videos v
      JOIN courses c ON v.course_id = c.id
      JOIN teachers t ON v.teacher_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN user_subjects us ON t.subject_id = us.subject_id
      WHERE v.video_type = ? AND c.grade_id = ?
    `;

  if (subjectIds.length > 0) {
    const placeholders = subjectIds.map(() => "?").join(",");
    videoQuery += ` AND v.teacher_id IN (SELECT id FROM teachers WHERE subject_id IN (${placeholders}))`;
    videoParams.push(...subjectIds); // Use spread to add elements, not the array itself
  }

  if (teacherIds.length > 0) {
    const placeholders = teacherIds.map(() => "?").join(",");
    videoQuery += ` AND v.teacher_id IN (${placeholders})`;
    videoParams.push(...teacherIds); // Use spread here as well
  }

  videoQuery += ` ORDER BY v.updated_at DESC LIMIT ? OFFSET ?;`;
  const offset = (page - 1) * limit;
  videoParams.push(limit, offset);

  const subjectsResult = await db.getAllAsync(subjectQuery, subjectParams);
  const teachersResult = await db.getAllAsync(teacherQuery, teacherParams);
  const freeVideos = await db.getAllAsync(videoQuery, videoParams); // No .flat() needed anymore
  const totalTeachersResult = await db.getFirstAsync<{ total_count: number }>(
    totalTeachersQuery,
    totalParams
  );
  const rawTotal = totalTeachersResult?.total_count ?? 0;
  const totalSubjectTeachersCount = Math.max(rawTotal, teachersResult.length);

  const subjects = subjectsResult.map((subject: any) => ({
    ...subject,
    image_url: subject.image ? `${storageUrl}${subject.image}` : null,
  }));

  const teachers = teachersResult.map((teacher: any) => ({
    ...teacher,
    profile_picture_url: teacher.profile_picture_url
      ? `${storageUrl}${teacher.profile_picture_url}`
      : null,
  }));

  return { subjects, teachers, freeVideos, totalSubjectTeachersCount };
};
