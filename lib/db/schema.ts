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
    image TEXT,
    is_followed INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_subjects (
    subject_id TEXT PRIMARY KEY NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_teachers (
    teacher_id TEXT PRIMARY KEY NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    profile_picture_url TEXT,
    is_followed INTEGER DEFAULT 0,
    subject_id TEXT,
    views INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    phone TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY NOT NULL,
    teacher_id TEXT NOT NULL,
    grade_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id)
  );


  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    course_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    description TEXT,
    video_type TEXT NOT NULL CHECK(video_type IN ('free', 'paid')),
    youtube_id TEXT,
    thumbnail TEXT,
    is_unlocked INTEGER DEFAULT 0,
    download_status TEXT DEFAULT 'NOT_DOWNLOADED',
    local_video_path TEXT,
    local_audio_path TEXT,
    local_subtitle_path TEXT,
    downloaded_size_bytes INTEGER,
    total_size_bytes INTEGER,
    progress_seconds INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    sort_order INTEGER DEFAULT 0,
    price REAL,
    updated_at TEXT NOT NULL,
    access_type TEXT CHECK(access_type IN ('watch', 'download')),
    watch_count INTEGER DEFAULT 0,
    download_expiry_date TEXT,
    activation_code TEXT,
    likes_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS used_codes (
    id TEXT PRIMARY KEY NOT NULL,
    video_id TEXT NOT NULL,
    download_status TEXT NOT NULL,
    access_type TEXT NOT NULL CHECK(access_type IN ('watch', 'download')),
    used_at TEXT NOT NULL,
    expires_at TEXT,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS pending_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    attempts INTEGER NOT NULL DEFAULT 0
  );
`;
