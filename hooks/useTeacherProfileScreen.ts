import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getTeacherDetails, toggleFollowTeacher } from '@/lib/db/queries/teacher.queries';
import { Video } from '@/lib/store/types';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store/authStore';

export interface Teacher {
  id: string;
  name: string;
  bio: string;
  profile_picture_url: string;
  phone?: any;
  is_followed?: any;
  subject_name?: string | null;
}

export const useTeacherProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const selectedGradeId = useAppStore((state) => state.selectedGradeId);
  const user = useAuthStore((state) => state.user);
  const gradeIdToUse = selectedGradeId || user?.grade_id?.toString() || null;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const { teacher, videos } = await getTeacherDetails(db, id, gradeIdToUse);
          setTeacher(teacher);
          setVideos(videos);
        } catch (error) {
          console.error('Failed to fetch teacher details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTeacherData();
  }, [id, db, gradeIdToUse]);

  const handleToggleFollow = useCallback(async () => {
    if (!teacher) return;
    const newFollowStatus = !teacher.is_followed;
    await toggleFollowTeacher(db, teacher.id, newFollowStatus);
    setTeacher({ ...teacher, is_followed: newFollowStatus });
  }, [teacher, db]);

  const handleWhatsApp = useCallback(() => {
    if (teacher?.phone) {
      const cleanPhone = teacher.phone.toString().replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.startsWith('2') ? cleanPhone : `2${cleanPhone}`;
      Linking.openURL(`https://wa.me/+${fullPhone}`);
    }
  }, [teacher?.phone]);

  const freeLessonsCount = useMemo(
    () => videos.filter((v) => v.video_type === 'free').length,
    [videos]
  );

  return {
    teacher,
    videos,
    isLoading,
    id,
    freeLessonsCount,
    handleToggleFollow,
    handleWhatsApp,
  };
};
