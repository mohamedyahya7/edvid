export const generateMockDataSQL = (): string => {
  const grades = [
    { id: "g1", title: "الصف الأول الثانوي" },
    { id: "g2", title: "الصف الثاني الثانوي" },
    { id: "g3", title: "الصف الثالث الثانوي" },
  ];

  const subjects = [
    { id: "s1", title: "الرياضيات" },
    { id: "s2", title: "الفيزياء" },
    { id: "s3", title: "الكيمياء" },
    { id: "s4", title: "الأحياء" },
    { id: "s5", title: "التاريخ" },
  ];

  const youtubeVideoIds = [
    "sMg_3NY76UE",
    "wpKulkADzBk",
    "DVouQRAKxYo",
    "7MvXv66b5h4",
    "3x7tuIZd4Sw",
    "bWpsuKd66kI",
    "0xl-RQRlhiE",
    "i_CijGuk7fw",
  ];

  let sql = `
    DELETE FROM videos;
    DELETE FROM courses;
    DELETE FROM teachers;
    DELETE FROM subjects;
    DELETE FROM grades;
  `;

  grades.forEach((grade, index) => {
    sql += `INSERT INTO grades (id, title, sort_order, updated_at) VALUES ('${
      grade.id
    }', '${grade.title}', ${index + 1}, '2023-01-01');\n`;
  });

  subjects.forEach((subject) => {
    sql += `INSERT INTO subjects (id, title, description, updated_at) VALUES ('${subject.id}', '${subject.title}', 'وصف لمادة ${subject.title}', '2023-01-01');\n`;
  });

  let teacherCounter = 1;
  let videoCounter = 1;
  let courseCounter = 1;

  grades.forEach((grade) => {
    subjects.forEach((subject) => {
      // Create one teacher per subject for simplicity in mock data
      const teacherId = `t${teacherCounter++}`;
      const gender = teacherCounter % 2 === 0 ? "women" : "men";
      sql += `INSERT INTO teachers (id, name, bio, profile_picture_url, subject_id, updated_at) VALUES ('${teacherId}', 'مدرس ${teacherCounter}', 'نبذة عن المدرس ${teacherCounter}', 'https://randomuser.me/api/portraits/${gender}/${
        teacherCounter % 100
      }.jpg', '${subject.id}', '2023-01-01');\n`;

      const courseId = `c${courseCounter++}`;
      // Associate course with the created teacher
      sql += `INSERT INTO courses (id, teacher_id, grade_id) VALUES ('${courseId}', '${teacherId}', '${grade.id}');\n`;

      for (let j = 0; j < 4; j++) {
        const videoId = `v${videoCounter++}`;
        const videoType = j < 2 ? "free" : "paid";
        const youtubeId =
          videoType === "free"
            ? youtubeVideoIds[videoCounter % youtubeVideoIds.length]
            : null;
        const thumbnail = `https://picsum.photos/seed/${videoId}/400/225`;
        sql += `INSERT INTO videos (id, title, course_id, teacher_id, video_type, youtube_id,  is_unlocked, thumbnail, updated_at, duration_seconds) VALUES 
        ('${videoId}', 'فيديو ${videoCounter} - ${
          subject.title
        }', '${courseId}', '${teacherId}', '${videoType}', ${
          youtubeId ? `'${youtubeId}'` : "NULL"
        }, ${
          videoType === "free" ? 1 : 0
        }, '${thumbnail}', '${new Date().toISOString()}', ${
          Math.floor(Math.random() * 1000) + 60
        });\n`;
      }
    });
  });

  return sql;
};
