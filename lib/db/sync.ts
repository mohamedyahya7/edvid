import { type SQLiteDatabase } from "expo-sqlite";

// Helper function to extract YouTube video ID from URL
const getYouTubeId = (url: string | null): string | null => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to find teacher_id for a given course_id from the catalog data
const getTeacherIdForCourse = (
  courseId: string,
  courses: any[],
  teachers: any[]
): string | null => {
  const course = courses.find((c) => c.id.toString() === courseId.toString());
  return course ? course.teacher_id : null;
};

export const syncCatalogData = async (db: SQLiteDatabase, catalogData: any) => {
  const {
    grades,
    subjects: subjectsObject,
    teachers,
    courses,
    videos,
  } = catalogData || {};

  // Convert subjects object to an array if it's an object, otherwise use it as is.
  const subjects =
    subjectsObject &&
    typeof subjectsObject === "object" &&
    !Array.isArray(subjectsObject)
      ? Object.values(subjectsObject)
      : subjectsObject;

  try {
    await db.withTransactionAsync(async () => {
      // 1. Sync Grades
      for (const grade of grades || []) {
        try {
          const params = [
            grade.id,
            grade.title,
            grade.sort_order,
            grade.updated_at,
          ];
          await db.runAsync(
            `INSERT INTO grades (id, title, sort_order, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title=excluded.title,
               sort_order=excluded.sort_order,
               updated_at=excluded.updated_at;`,
            params
          );
        } catch (e) {
          console.error("SYNC_LOG: Failed on grade:", grade, e);
          throw e;
        }
      }

      // 2. Sync Subjects
      for (const subject of subjects || []) {
        try {
          const params = [
            subject.id,
            subject.name, // Corrected: Use `name` from API for the `title` column
            subject.image,
            subject.updated_at || new Date().toISOString(),
          ];
          // console.log("SYNC_LOG: Inserting subject:", JSON.stringify(params));
          await db.runAsync(
            `INSERT INTO subjects (id, title, image, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title=excluded.title,
               image=excluded.image,
               updated_at=excluded.updated_at;`,
            params
          );
        } catch (e) {
          console.error("SYNC_LOG: Failed on subject:", subject, e);
          throw e;
        }
      }

      // 3. Sync Teachers
      for (const teacher of teachers || []) {
        try {
          const teacherCourse = (courses || []).find(
            (c: any) =>
              c.teacher_id &&
              c.subject_id &&
              String(c.teacher_id) === String(teacher.id)
          );
          const resolvedSubjectId =
            teacher.subject_id !== undefined
              ? teacher.subject_id
              : teacherCourse?.subject_id !== undefined
              ? teacherCourse.subject_id
              : null;

          const params = [
            teacher.id,
            teacher.user?.name || teacher.name || "مدرس",
            teacher.bio || null,
            teacher.image || null,
            resolvedSubjectId,
            teacher.updated_at || new Date().toISOString(),
            teacher.views ? parseInt(teacher.views, 10) : 0,
            teacher.followers_count || 0,
            teacher.user?.phone || teacher.phone || "",
          ];
          // console.log("SYNC_LOG: Inserting teacher:", JSON.stringify(params));
          if (params.some((p) => p === undefined)) {
            console.error(
              "SYNC_LOG: Undefined parameter found for teacher:",
              teacher
            );
            continue; // Skip this record
          }
          await db.runAsync(
            `INSERT INTO teachers (id, name, bio, profile_picture_url, subject_id, updated_at, views, followers_count, phone)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               name=excluded.name,
               bio=excluded.bio,
               profile_picture_url=excluded.profile_picture_url,
               subject_id=excluded.subject_id,
               updated_at=excluded.updated_at,
               views=excluded.views,
               followers_count=excluded.followers_count,
               phone=excluded.phone;`,
            params
          );
        } catch (e) {
          console.error("SYNC_LOG: Failed on teacher:", teacher, e);
          throw e;
        }
      }

      // 4. Sync Courses
      for (const course of courses || []) {
        const teacherId = getTeacherIdForCourse(course.id, courses, teachers);
        if (!teacherId) {
          continue;
        }

        try {
          const params = [
            course.id,
            course.teacher_id,
            course.grade_id,
            course.updated_at,
          ];
          if (params.some((p) => p === undefined)) {
            console.error(
              "SYNC_LOG: Undefined parameter found for course:",
              course
            );
            continue;
          }
          await db.runAsync(
            `INSERT INTO courses (id, teacher_id, grade_id, updated_at) 
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               teacher_id=excluded.teacher_id, grade_id=excluded.grade_id,
               updated_at=excluded.updated_at;`,
            params
          );
        } catch (e) {
          console.error("SYNC_LOG: Failed on course:", course, e);
          throw e;
        }
      }

      // 5. Sync Videos
      for (const video of videos || []) {
        const teacherId = getTeacherIdForCourse(
          video.course_id,
          courses,
          teachers
        );
        if (!teacherId) {
          continue;
        }

        try {
          const params = [
            video.id,
            video.title,
            video.course_id,
            teacherId, // The new, crucial parameter
            video.description,
            video.type,
            video.youtube_url ? video.youtube_url.split("v=")[1] : null,
            video.thumbnail_path,
            video.updated_at,
            video.likes_count || 0,
            video.views || 0,
            parseFloat(video.price) || 0,
            video.duration || 0,
          ];

          await db.runAsync(
            `INSERT INTO videos (id, title, course_id, teacher_id, description, video_type, youtube_id, thumbnail, updated_at, likes_count, views, price, duration_seconds)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title=excluded.title,
               course_id=excluded.course_id,
               teacher_id=excluded.teacher_id,
               description=excluded.description,
               video_type=excluded.video_type,
               youtube_id=excluded.youtube_id,
               thumbnail=excluded.thumbnail,
               updated_at=excluded.updated_at,
               likes_count=excluded.likes_count,
               views=excluded.views,
               price=excluded.price,
               duration_seconds=excluded.duration_seconds;`,
            params
          );
        } catch (e) {
          console.error("SYNC_LOG: Failed on video:", video, e);

          throw e;
        }
      }
    });
    console.log("✅ Catalog data synced successfully!");
  } catch (error) {
    console.error("❌ Failed to sync catalog data:", error);
    throw error;
  }
};
