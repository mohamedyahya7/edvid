import { type SQLiteDatabase } from "expo-sqlite";

export const getTeacherDetails = async (
  db: SQLiteDatabase,
  teacherId: string
): Promise<{ teacher: any; videos: any[] }> => {
  const teacher = await db.getFirstAsync(
    "SELECT * FROM teachers WHERE id = ?;",
    [teacherId]
  );
  const videos = await db.getAllAsync(
    "SELECT * FROM videos WHERE teacher_id = ? ORDER BY sort_order ASC;",
    [teacherId]
  );
  return { teacher, videos };
};

export const getAllTeachersForGrade = async (
  db: SQLiteDatabase,
  gradeId: string
): Promise<any[]> => {
  const teachers = await db.getAllAsync(
    `
      SELECT
        t.id, t.name, t.bio, t.profile_picture_url,
        s.title as subject_title
      FROM teachers t
      JOIN course_teachers ct ON t.id = ct.teacher_id
      JOIN courses c ON ct.course_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE c.grade_id = ?
      ORDER BY s.title, t.name;
    `,
    [gradeId]
  );

  // Group by subject
  type GroupedTeachers = { [key: string]: { title: string; data: any[] } };
  const grouped = teachers.reduce<GroupedTeachers>((acc, teacher: any) => {
    const title = teacher.subject_title;
    const { subject_title, ...teacherData } = teacher;
    if (!acc[title]) {
      acc[title] = { title: title, data: [] };
    }
    acc[title].data.push(teacherData);
    return acc;
  }, {});

  return Object.values(grouped);
};
