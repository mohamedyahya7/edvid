import { type SQLiteDatabase } from "expo-sqlite";

export const getVideoDetails = async (
  db: SQLiteDatabase,
  videoId: string
): Promise<{ video: any; otherVideos: any[] }> => {
  const video = await db.getFirstAsync(
    `
      SELECT
        v.*,
        t.name as teacher_name,
        t.profile_picture_url as teacher_profile_picture_url,
        c.description as course_description
      FROM videos v
      JOIN teachers t ON v.teacher_id = t.id
      JOIN courses c ON v.course_id = c.id
      WHERE v.id = ?;
    `,
    [videoId]
  );

  if (!video) {
    return { video: null, otherVideos: [] };
  }

  const otherVideos = await db.getAllAsync(
    `
      SELECT
        v.id,
        v.title,
        c.cover_image_url
      FROM videos v
      JOIN courses c ON v.course_id = c.id
      WHERE v.teacher_id = ? AND v.id != ?
      LIMIT 5;
    `,
    [(video as any).teacher_id, videoId]
  );

  return { video, otherVideos };
};

export const updateVideoProgress = async (
  db: SQLiteDatabase,
  videoId: string,
  progressSeconds: number
): Promise<void> => {
  await db.runAsync("UPDATE videos SET progress_seconds = ? WHERE id = ?;", [
    progressSeconds,
    videoId,
  ]);
};
