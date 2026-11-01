export interface GradeModel {
  id: string;
  title: string;
  sort_order: number;
}

export interface SubjectModel {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  is_followed?: boolean;
}

export interface TeacherModel {
  id: string;
  name: string;
  bio?: string | null;
  profile_picture_url?: string | null;
  subject_id?: string;
  subject_name?: string;
  followers_count?: number;
  phone?: string | null;
}

export interface CourseModel {
  id: string;
  name: string;
  teacher_id: string;
  grade_id: string;
  teacher?: TeacherModel;
}
