import { SQLiteDatabase } from "expo-sqlite";

export const addUsedCode = async (
  db: SQLiteDatabase,
  code: string,
  videoId: string | number,
  accessType: "watch" | "download",
  expiresAt: string | null
): Promise<void> => {
  const usedAt = new Date().toISOString();
  const downloadStatus = accessType === "download" ? "QUEUED" : "NOT_DOWNLOADED";

  await db.runAsync(
    "INSERT OR REPLACE INTO used_codes (id, video_id, access_type, used_at, expires_at, download_status) VALUES (?, ?, ?, ?, ?, ?);",
    [code, String(videoId), accessType, usedAt, expiresAt, downloadStatus]
  );
};

export const ensureMockCodesIfEmpty = async (db: SQLiteDatabase, force: boolean = false): Promise<void> => {
  try {
    const countRes = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM used_codes;"
    );
    // If empty or only has the initial 2 mock codes, seed a rich diverse test set (up to 8 videos)
    if (force || !countRes || countRes.count <= 2) {
      await db.runAsync("DELETE FROM used_codes WHERE id LIKE 'BAMBOO-%';");

      // Query videos spanning different teachers and subjects
      let sampleVideos = await db.getAllAsync<{ id: any; title: string }>(
        `SELECT v.id, v.title
         FROM videos v
         WHERE v.id IN ('v1', 'v2', 'v5', 'v6', 'v9', 'v10', 'v13', 'v14')
         ORDER BY v.id ASC;`
      );

      if (!sampleVideos || sampleVideos.length < 4) {
        sampleVideos = await db.getAllAsync<{ id: any; title: string }>(
          `SELECT v.id, v.title
           FROM videos v
           ORDER BY v.id ASC
           LIMIT 8;`
        );
      }

      if (sampleVideos && sampleVideos.length > 0) {
        const now = new Date();
        const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        for (let i = 0; i < sampleVideos.length; i++) {
          const vid = sampleVideos[i];
          const isOffline = i % 2 === 1; // Alternating download vs watch
          const code = `BAMBOO-TEST-${101 + i}`;
          const accessType = isOffline ? 'download' : 'watch';
          const dlStatus = isOffline ? 'COMPLETED' : 'NOT_DOWNLOADED';

          await db.runAsync(
            "INSERT OR REPLACE INTO used_codes (id, video_id, access_type, used_at, expires_at, download_status) VALUES (?, ?, ?, ?, ?, ?);",
            [code, String(vid.id), accessType, now.toISOString(), inOneMonth, dlStatus]
          );

          if (isOffline) {
            await db.runAsync(
              "UPDATE videos SET download_status = 'COMPLETED', access_type = 'download', is_unlocked = 1 WHERE id = ?;",
              [String(vid.id)]
            );
          } else {
            await db.runAsync(
              "UPDATE videos SET access_type = 'watch', watch_count = 3, is_unlocked = 1 WHERE id = ?;",
              [String(vid.id)]
            );
          }
        }
      }
    }
  } catch (e) {
    console.warn("ensureMockCodesIfEmpty error:", e);
  }
};

export const getUsedCodes = async (db: SQLiteDatabase): Promise<any[]> => {
  await ensureMockCodesIfEmpty(db);

  const result = await db.getAllAsync<any>(
    `
    SELECT uc.*, COALESCE(v.title, 'درس تدريبي مفعّل') as video_title
    FROM used_codes uc
    LEFT JOIN videos v ON CAST(uc.video_id AS TEXT) = CAST(v.id AS TEXT)
    ORDER BY uc.used_at DESC;
  `
  );
  return result;
};

export const getUsedCodesCount = async (
  db: SQLiteDatabase
): Promise<number> => {
  await ensureMockCodesIfEmpty(db);

  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM used_codes;"
  );
  return result?.count ?? 0;
};
