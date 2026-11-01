import { type SQLiteDatabase } from "expo-sqlite";
import { getSetting } from "./settings.queries";
import { addPendingAction } from "./pendingActions.queries";
import { storageUrl } from "@/api/Axios";

export const getTeacherDetails = async (
  db: SQLiteDatabase,
  teacherId: string,
  explicitGradeId?: string | null
): Promise<{ teacher: any; videos: any[] }> => {
  // 1. Get the current gradeId from settings or parameter
  let gradeId = explicitGradeId;
  if (!gradeId) {
    const gradeIdResult = await getSetting(db, "selected_grade_id");
    gradeId = gradeIdResult?.value || null;
  }

  // Get teacher details including is_followed status
  const teacherQuery = `
    SELECT 
      t.*, 
      s.title AS subject_name,
      ut.teacher_id IS NOT NULL AS is_followed
    FROM teachers t
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    LEFT JOIN user_teachers ut ON CAST(t.id AS TEXT) = CAST(ut.teacher_id AS TEXT)
    WHERE t.id = ? OR CAST(t.id AS TEXT) = CAST(? AS TEXT);
  `;
  const teacher = await db.getFirstAsync(teacherQuery, [teacherId, teacherId]);

  // 2. Fetch videos of this teacher
  let videos: any[] = [];

  // If gradeId is available, first attempt to get videos matching the grade
  if (gradeId) {
    videos = await db.getAllAsync(
      `SELECT 
         v.*,
         COALESCE(v.duration_seconds, 1800) as duration_seconds,
         COALESCE(t.name, 'أستاذ المادة') as teacher_name,
         MAX(uc.video_id IS NOT NULL) AS is_unlocked
       FROM videos v
       LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
       LEFT JOIN teachers t ON (
         (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
         OR
         (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
       )
       LEFT JOIN used_codes uc ON CAST(v.id AS TEXT) = CAST(uc.video_id AS TEXT)
       WHERE (
         (v.teacher_id IS NOT NULL AND (v.teacher_id = ? OR CAST(v.teacher_id AS TEXT) = CAST(? AS TEXT)))
         OR
         (c.teacher_id IS NOT NULL AND (c.teacher_id = ? OR CAST(c.teacher_id AS TEXT) = CAST(? AS TEXT)))
       ) 
       AND (c.grade_id = ? OR CAST(c.grade_id AS TEXT) = CAST(? AS TEXT))
       GROUP BY v.id
       ORDER BY v.id DESC;`,
      [teacherId, teacherId, teacherId, teacherId, gradeId, gradeId]
    );
  }

  // If no grade-specific videos found or gradeId is not set, fetch all videos of this teacher
  if (!videos || videos.length === 0) {
    videos = await db.getAllAsync(
      `SELECT 
         v.*,
         COALESCE(v.duration_seconds, 1800) as duration_seconds,
         COALESCE(t.name, 'أستاذ المادة') as teacher_name,
         MAX(uc.video_id IS NOT NULL) AS is_unlocked
       FROM videos v
       LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
       LEFT JOIN teachers t ON (
         (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
         OR
         (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
       )
       LEFT JOIN used_codes uc ON CAST(v.id AS TEXT) = CAST(uc.video_id AS TEXT)
       WHERE (
         (v.teacher_id IS NOT NULL AND (v.teacher_id = ? OR CAST(v.teacher_id AS TEXT) = CAST(? AS TEXT)))
         OR
         (c.teacher_id IS NOT NULL AND (c.teacher_id = ? OR CAST(c.teacher_id AS TEXT) = CAST(? AS TEXT)))
       )
       GROUP BY v.id
       ORDER BY v.id DESC;`,
      [teacherId, teacherId, teacherId, teacherId]
    );
  }

  return { teacher, videos };
};

export const getFollowedTeachersCount = async (
  db: SQLiteDatabase
): Promise<number> => {
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_teachers;"
  );
  return result?.count ?? 0;
};

export const getFollowedTeachers = async (
  db: SQLiteDatabase
): Promise<any[]> => {
  const result = await db.getAllAsync<any>(
    `
    SELECT t.*, s.title as subject_name, 1 as is_followed
    FROM teachers t
    JOIN user_teachers ut ON CAST(t.id AS TEXT) = CAST(ut.teacher_id AS TEXT)
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    ORDER BY ut.sort_order;
  `
  );
  return result;
};

export const toggleFollowTeacher = async (
  db: SQLiteDatabase,
  teacherId: string | number,
  isFollowed: boolean
): Promise<void> => {
  try {
    const teacher = await db.getFirstAsync<{ id: any }>(
      "SELECT id FROM teachers WHERE id = ? OR CAST(id AS TEXT) = CAST(? AS TEXT) LIMIT 1;",
      [teacherId, teacherId]
    );
    const targetId = teacher ? teacher.id : teacherId;

    if (isFollowed) {
      await db.runAsync(
        "INSERT OR REPLACE INTO user_teachers (teacher_id) VALUES (?);",
        [targetId]
      );
    } else {
      await db.runAsync(
        "DELETE FROM user_teachers WHERE teacher_id = ? OR CAST(teacher_id AS TEXT) = CAST(? AS TEXT);",
        [targetId, targetId]
      );
    }

    // 2. Add to pending actions
    const action_type = isFollowed ? "follow_teacher" : "unfollow_teacher";
    await addPendingAction(db, action_type, { teacherId: targetId });
  } catch (e) {
    console.error("toggleFollowTeacher error:", e);
  }
};

export const getAllTeachersForGrade = async (
  db: SQLiteDatabase,
  gradeId: string | null | undefined
): Promise<any[]> => {
  let teachers: any[];
  if (gradeId) {
    teachers = await db.getAllAsync(
      `
      SELECT DISTINCT
        t.id, t.name, t.bio, t.profile_picture_url,
        COALESCE(s.id, 'other') as subject_id,
        COALESCE(s.title, 'مواد عامة') as subject_title,
        s.image as subject_image,
        ut.teacher_id IS NOT NULL AS is_followed
      FROM teachers t
      LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
      JOIN courses c ON CAST(t.id AS TEXT) = CAST(c.teacher_id AS TEXT)
      LEFT JOIN user_teachers ut ON CAST(t.id AS TEXT) = CAST(ut.teacher_id AS TEXT)
      WHERE c.grade_id = ? OR CAST(c.grade_id AS TEXT) = CAST(? AS TEXT)
      ORDER BY s.title, t.name;
    `,
      [gradeId, gradeId]
    );
  } else {
    teachers = await db.getAllAsync(
      `
        SELECT DISTINCT
          t.id, t.name, t.bio, t.profile_picture_url,
          COALESCE(s.id, 'other') as subject_id,
          COALESCE(s.title, 'مواد عامة') as subject_title,
          s.image as subject_image,
          ut.teacher_id IS NOT NULL AS is_followed
        FROM teachers t
        LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
        LEFT JOIN user_teachers ut ON CAST(t.id AS TEXT) = CAST(ut.teacher_id AS TEXT)
        ORDER BY s.title, t.name;
      `
    );
  }

  // Format image URLs and group by subject
  const grouped: { [key: string]: { id: string; title: string; image?: string | null; data: any[] } } = {};

  for (const rawTeacher of teachers) {
    const title = rawTeacher.subject_title || 'مواد عامة';
    const sId = rawTeacher.subject_id ? String(rawTeacher.subject_id) : 'other';

    if (!grouped[sId]) {
      grouped[sId] = {
        id: sId,
        title: title,
        image: rawTeacher.subject_image ? (rawTeacher.subject_image.startsWith('http') ? rawTeacher.subject_image : storageUrl + rawTeacher.subject_image) : null,
        data: [],
      };
    }

    const formattedTeacher = {
      ...rawTeacher,
      profile_picture_url: rawTeacher.profile_picture_url
        ? (rawTeacher.profile_picture_url.startsWith('http')
            ? rawTeacher.profile_picture_url
            : storageUrl + rawTeacher.profile_picture_url)
        : null,
      is_followed: Boolean(rawTeacher.is_followed),
    };

    grouped[sId].data.push(formattedTeacher);
  }

  return Object.values(grouped);
};
