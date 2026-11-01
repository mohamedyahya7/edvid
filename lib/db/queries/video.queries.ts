import { Video } from "@/lib/store/types";
import * as FileSystem from "expo-file-system";
import { type SQLiteDatabase } from "expo-sqlite";
import { addPendingAction } from "./pendingActions.queries";
import { ensureMockCodesIfEmpty } from "./usedCodes.queries";

export const getContinueWatchingVideo = async (
  db: SQLiteDatabase
): Promise<Video | null> => {
  const query = `
    SELECT
      v.*,
      COALESCE(t.name, 'أستاذ المادة') as teacher_name,
      t.profile_picture_url as teacher_image,
      s.title as subject_name
    FROM videos v
    LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
    LEFT JOIN teachers t ON (
      (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
      OR
      (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
    )
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    WHERE v.progress_seconds > 0
       OR v.download_status = 'COMPLETED'
       OR v.access_type = 'watch'
    ORDER BY v.updated_at DESC, v.id DESC;
  `;
  const potentialVideos = await db.getAllAsync<Video>(query);

  for (const video of potentialVideos) {
    const now = new Date();

    // Check for download expiry
    if (video.download_status === "COMPLETED" && video.download_expiry_date) {
      if (new Date(video.download_expiry_date) < now) {
        // This video is expired, let's mark it and continue to the next one
        await findAndDeleteExpiredVideos(db); // Reuse existing cleanup logic
        continue; // Skip to the next video
      }
    }

    // Check for watch count
    if (video.access_type === "watch" && (video.watch_count || 0) <= 0) {
      // No watches left, deactivate and continue
      await deactivateWatchedVideo(db, video.id);
      continue; // Skip to the next video
    }

    // If all checks pass, this is a valid video to continue watching
    return video;
  }

  // --- DEV FALLBACK: If user hasn't watched any video yet, show latest lesson for UI testing ---
  const devFallbackQuery = `
    SELECT
      v.*,
      COALESCE(t.name, 'أستاذ المادة') as teacher_name,
      t.profile_picture_url as teacher_image,
      s.title as subject_name
    FROM videos v
    LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
    LEFT JOIN teachers t ON (
      (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
      OR
      (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
    )
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    ORDER BY (CASE WHEN v.video_type = 'free' THEN 1 ELSE 2 END), v.id DESC
    LIMIT 1;
  `;
  const fallbackVideo = await db.getFirstAsync<Video>(devFallbackQuery);
  if (fallbackVideo) {
    return {
      ...fallbackVideo,
      progress_seconds: fallbackVideo.progress_seconds > 0 ? fallbackVideo.progress_seconds : 180,
      duration_seconds: fallbackVideo.duration_seconds || 1800,
    };
  }

  return null;
};

export const getVideoById = async (
  db: SQLiteDatabase,
  videoId: string
): Promise<Video | null> => {
  const query = `
    SELECT *
    FROM videos
    WHERE id = ? OR CAST(id AS TEXT) = CAST(? AS TEXT);
  `;
  const result = await db.getFirstAsync<Video>(query, [videoId, videoId]);
  return result;
};

export const findAndDeleteExpiredVideos = async (
  db: SQLiteDatabase
): Promise<void> => {
  console.log("Checking for expired videos...");
  const now = new Date().toISOString();
  const query = `
    SELECT id, local_video_path, local_audio_path
    FROM videos
    WHERE download_status = 'COMPLETED'
      AND download_expiry_date IS NOT NULL
      AND download_expiry_date < ?;
  `;

  try {
    const expiredVideos = await db.getAllAsync<Video>(query, [now]);

    if (expiredVideos.length === 0) {
      console.log("No expired videos found.");
      return;
    }

    console.log(`Found ${expiredVideos.length} expired videos to delete.`);
    const idsToDelete: string[] = [];

    for (const video of expiredVideos) {
      // Delete files from filesystem
      if (video.local_video_path) {
        await FileSystem.deleteAsync(video.local_video_path, {
          idempotent: true,
        });
        console.log(`Deleted expired video file: ${video.local_video_path}`);
      }
      if (video.local_audio_path) {
        await FileSystem.deleteAsync(video.local_audio_path, {
          idempotent: true,
        });
        console.log(`Deleted expired audio file: ${video.local_audio_path}`);
      }
      idsToDelete.push(video.id);
    }

    // Update database records
    if (idsToDelete.length > 0) {
      const placeholders = idsToDelete.map(() => "?").join(", ");
      const updateQuery = `
        UPDATE videos
        SET download_status = 'EXPIRED',
            local_video_path = NULL,
            local_audio_path = NULL,
            updated_at = ?
        WHERE id IN (${placeholders});
      `;
      await db.runAsync(updateQuery, [now, ...idsToDelete]);
      console.log(`Updated ${idsToDelete.length} videos to EXPIRED status.`);
    }
  } catch (error) {
    console.error("Error finding and deleting expired videos:", error);
  }
};

export const getVideoDetails = async (
  db: SQLiteDatabase,
  videoId: string
): Promise<{ video: any; otherVideos: any[] }> => {
  const video = await db.getFirstAsync(
    `
      SELECT
        v.*,
        COALESCE(t.name, 'أستاذ المادة') as teacher_name,
        t.profile_picture_url as teacher_profile_picture_url,
        s.title as subject_name
      FROM videos v
      LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
      LEFT JOIN teachers t ON (
        (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
        OR
        (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
      )
      LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
      WHERE v.id = ? OR CAST(v.id AS TEXT) = CAST(? AS TEXT);
    `,
    [videoId, videoId]
  );

  if (!video) {
    return { video: null, otherVideos: [] };
  }

  const teacherId = (video as any).teacher_id;
  const otherVideos = await db.getAllAsync(
    `
      SELECT
        v.id,
        v.title,
        v.video_type,
        v.thumbnail,
        v.duration_seconds,
        v.price,
        v.youtube_id
      FROM videos v
      LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
      WHERE ((v.teacher_id IS NOT NULL AND (v.teacher_id = ? OR CAST(v.teacher_id AS TEXT) = CAST(? AS TEXT)))
         OR (c.teacher_id IS NOT NULL AND (c.teacher_id = ? OR CAST(c.teacher_id AS TEXT) = CAST(? AS TEXT))))
        AND (v.id != ? AND CAST(v.id AS TEXT) != CAST(? AS TEXT))
      LIMIT 10;
    `,
    [teacherId, teacherId, teacherId, teacherId, videoId, videoId]
  );

  return { video, otherVideos };
};

export const updateVideoProgress = async (
  db: SQLiteDatabase,
  videoId: string,
  progressSeconds: number
): Promise<void> => {
  await db.runAsync(
    "UPDATE videos SET progress_seconds = ?, updated_at = ? WHERE id = ? OR CAST(id AS TEXT) = CAST(? AS TEXT);",
    [progressSeconds, new Date().toISOString(), videoId, videoId]
  );
};

export const fetchVideosForCourse = async (
  db: SQLiteDatabase,
  courseId: string
): Promise<Video[]> => {
  const query = `
    SELECT 
      v.*,
      COALESCE(t.name, 'أستاذ المادة') as teacher_name
    FROM videos v
    LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
    LEFT JOIN teachers t ON CAST(COALESCE(v.teacher_id, c.teacher_id) AS TEXT) = CAST(t.id AS TEXT)
    WHERE v.course_id = ? OR CAST(v.course_id AS TEXT) = CAST(? AS TEXT)
    ORDER BY v.sort_order;
  `;
  const result = await db.getAllAsync<Video>(query, [courseId, courseId]);
  return result;
};

export const fetchLibraryVideos = async (
  db: SQLiteDatabase
): Promise<Video[]> => {
  await ensureMockCodesIfEmpty(db);
  const query = `
    SELECT DISTINCT
      v.*,
      COALESCE(t.name, 'أستاذ المادة') as teacher_name,
      t.profile_picture_url as teacher_image,
      s.title as subject_name,
      COALESCE(v.download_status, uc.download_status) as effective_download_status,
      COALESCE(v.access_type, uc.access_type) as effective_access_type
    FROM videos v
    LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
    LEFT JOIN teachers t ON CAST(COALESCE(v.teacher_id, c.teacher_id) AS TEXT) = CAST(t.id AS TEXT)
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    LEFT JOIN used_codes uc ON CAST(v.id AS TEXT) = CAST(uc.video_id AS TEXT)
    WHERE v.download_status = 'COMPLETED'
       OR uc.download_status = 'COMPLETED'
       OR (v.access_type = 'watch' AND (v.watch_count > 0 OR v.watch_count IS NULL))
       OR uc.access_type = 'watch'
       OR uc.id IS NOT NULL
    ORDER BY v.updated_at DESC, v.id DESC;
  `;
  
  const result = await db.getAllAsync<Video>(query);
  console.log(
    `[DEBUG] fetchLibraryVideos found ${result.length} videos. IDs: ${result
      .map((v) => v.id)
      .join(", ")}`
  );
  return result;
};

export const getNewestVideosFromFollowedTeachers = async (
  db: SQLiteDatabase
): Promise<Video[]> => {
  // 1. Get newest videos from teachers followed by student (ordered from newest to oldest)
  const query = `
    SELECT
      v.*,
      COALESCE(t.name, 'أستاذ المادة') as teacher_name,
      t.profile_picture_url as teacher_profile_picture_url,
      s.title as subject_name
    FROM videos v
    LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
    INNER JOIN user_teachers ut ON (
      (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(ut.teacher_id AS TEXT))
      OR
      (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(ut.teacher_id AS TEXT))
    )
    LEFT JOIN teachers t ON (
      (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
      OR
      (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
    )
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    ORDER BY v.id DESC
    LIMIT 10;
  `;
  const videos = await db.getAllAsync<Video>(query);
  if (videos && videos.length > 0) {
    return videos;
  }

  // 2. Fallback: If followed teachers do not have videos in this grade, show newest general lessons
  const fallbackQuery = `
    SELECT
      v.*,
      COALESCE(t.name, 'أستاذ المادة') as teacher_name,
      t.profile_picture_url as teacher_profile_picture_url,
      s.title as subject_name
    FROM videos v
    LEFT JOIN courses c ON CAST(v.course_id AS TEXT) = CAST(c.id AS TEXT)
    LEFT JOIN teachers t ON (
      (v.teacher_id IS NOT NULL AND v.teacher_id != '' AND v.teacher_id != '0' AND CAST(v.teacher_id AS TEXT) = CAST(t.id AS TEXT))
      OR
      (c.teacher_id IS NOT NULL AND CAST(c.teacher_id AS TEXT) = CAST(t.id AS TEXT))
    )
    LEFT JOIN subjects s ON CAST(t.subject_id AS TEXT) = CAST(s.id AS TEXT)
    ORDER BY v.id DESC
    LIMIT 10;
  `;
  return await db.getAllAsync<Video>(fallbackQuery);
};

export const getLibraryVideosCount = async (
  db: SQLiteDatabase
): Promise<number> => {
  await ensureMockCodesIfEmpty(db);
  const query = `
    SELECT COUNT(DISTINCT v.id) as count
    FROM videos v
    LEFT JOIN used_codes uc ON CAST(v.id AS TEXT) = CAST(uc.video_id AS TEXT)
    WHERE v.download_status = 'COMPLETED'
       OR uc.download_status = 'COMPLETED'
       OR (v.access_type = 'watch' AND (v.watch_count > 0 OR v.watch_count IS NULL))
       OR uc.access_type = 'watch'
       OR uc.id IS NOT NULL;
  `;
  const result = await db.getFirstAsync<{ count: number }>(query);
  return result?.count ?? 0;
};

export const deactivateWatchedVideo = async (
  db: SQLiteDatabase,
  videoId: string
): Promise<void> => {
  const query = `
    UPDATE videos
    SET access_type = NULL,
        watch_count = 0,
        activation_code = NULL,
        updated_at = ?
    WHERE id = ?;
  `;
  await db.runAsync(query, [new Date().toISOString(), videoId]);
};

export const decrementWatchCount = async (
  db: SQLiteDatabase,
  videoId: string
): Promise<void> => {
  const video = await db.getFirstAsync<{ watch_count: number }>(
    `SELECT watch_count FROM videos WHERE id = ?;`,
    videoId
  );
  if (!video || video.watch_count <= 0) {
    console.log("Video not found or no watch count left.");
    return;
  }

  const newWatchCount = video.watch_count - 1;
  if (newWatchCount <= 0) {
    console.log("Watch count depleted, deactivating video.");
    await deactivateWatchedVideo(db, videoId);
    // Optionally, delete files here as well
  } else {
    const query = `
      UPDATE videos
      SET watch_count = ?,
          updated_at = ?
      WHERE id = ?;
    `;
    await db.runAsync(query, [
      newWatchCount,
      new Date().toISOString(),
      videoId,
    ]);
  }
};

export const toggleFavoriteStatus = async (
  db: SQLiteDatabase,
  videoId: string,
  isFavorite: boolean
): Promise<void> => {
  const query = "UPDATE videos SET is_favorite = ? WHERE id = ?;";
  await db.runAsync(query, [isFavorite ? 1 : 0, videoId]);

  const action_type = isFavorite ? "like_video" : "unlike_video";
  await addPendingAction(db, action_type, { videoId });
};

export const activateVideoForWatching = async (
  db: SQLiteDatabase,
  videoId: string,
  activationCode: string
): Promise<void> => {
  const query = `
    UPDATE videos
    SET access_type = 'watch',
        activation_code = ?,
        updated_at = ?
    WHERE id = ?;
  `;
  await db.runAsync(query, [activationCode, new Date().toISOString(), videoId]);
};

export const updateVideoOnDownloadComplete = async (
  db: SQLiteDatabase,
  id: string,
  videoPath: string,
  audioPath?: string | null
) =>
  db.runAsync(
    "UPDATE videos SET download_status = 'COMPLETED', local_video_path = ?, local_audio_path = ? WHERE id = ?;",
    [videoPath, audioPath ?? null, id]
  );

export const clearVideoDownload = (db: SQLiteDatabase, videoId: string) =>
  db.runAsync(
    "UPDATE videos SET download_status = NULL,is_unlocked = 0, local_video_path = NULL, local_audio_path = NULL, access_type = NULL, watch_count = 0 WHERE id = ?;",
    [videoId]
  );

export const upsertVideo = async (
  db: SQLiteDatabase,
  video: any
): Promise<void> => {
  // First, try to update the existing video
  const updateResult = await db.runAsync(
    `UPDATE videos SET 
      title = ?, 
      description = ?, 
      thumbnail = ?, 
      course_id = ?, 
      teacher_id = ?, 
      video_type = ?, 
      youtube_id = ?, 
      duration_seconds = ?, 
      likes_count = ?, 
      views = ?, 
      price = ?, 
      watch_count = ?
      -- We explicitly DO NOT update updated_at, is_favorite, or progress_seconds
      -- as these are managed by the local app state.
    WHERE id = ?;`,
    [
      video.title,
      video.description || "",
      video.thumbnail,
      video.course_id,
      video.teacher_id,
      video.video_type,
      video.youtube_id || null,
      video.duration_seconds || 0,
      video.likes_count || 0,
      video.views || 0,
      video.price || 0,
      video.watch_count || 0,
      video.id,
    ]
  );

  // If no rows were affected, it means the video doesn't exist, so insert it
  if (updateResult.changes === 0) {
    await db.runAsync(
      `INSERT INTO videos (
        id, title, description, thumbnail, course_id, teacher_id, video_type, 
        youtube_id, is_unlocked, progress_seconds, is_favorite, duration_seconds, 
        updated_at, watch_count, likes_count, views, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        video.id,
        video.title,
        video.description || "",
        video.thumbnail,
        video.course_id,
        video.teacher_id,
        video.video_type,
        video.youtube_id || null,
        1, // is_unlocked
        0, // progress_seconds
        0, // is_favorite
        video.duration_seconds || 0,
        video.updated_at || new Date().toISOString(),
        video.watch_count || 0,
        video.likes_count || 0,
        video.views || 0,
        video.price || 0,
      ]
    );
  }
};
