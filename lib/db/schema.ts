export const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    profile_picture_url TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY NOT NULL,
    subject_id TEXT NOT NULL,
    grade_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id)
  );

  CREATE TABLE IF NOT EXISTS course_teachers (
    course_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, teacher_id)
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    course_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    video_type TEXT NOT NULL CHECK(video_type IN ('free', 'paid')),
    youtube_id TEXT,
    video_path TEXT,
    audio_path TEXT,
    subtitle_path TEXT,
    is_unlocked INTEGER DEFAULT 0,
    downloaded_size_bytes INTEGER,
    download_status TEXT DEFAULT 'NOT_DOWNLOADED',
    local_video_path TEXT,
    local_audio_path TEXT,
    local_subtitle_path TEXT,
    total_size_bytes INTEGER,
    progress_seconds INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    sort_order INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS used_codes (
    id TEXT PRIMARY KEY NOT NULL,
    video_id TEXT NOT NULL,
    download_status TEXT NOT NULL,
    used_at TEXT NOT NULL,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
  );
`;
