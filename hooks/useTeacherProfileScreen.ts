import { databaseService } from "@/lib/DatabaseService";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

interface Video {
  id: string;
  title: string;
  type: string;
  duration_seconds: number;
}

interface Teacher {
  id: string;
  name: string;
  bio: string;
  profile_picture_url: string;
}

export const useTeacherProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const { teacher, videos } = await databaseService.getTeacherDetails(
            db,
            id
          );
          setTeacher(teacher);
          setVideos(videos);
        } catch (error) {
          console.error("Failed to fetch teacher details:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTeacherData();
  }, [id, db]);

  return { teacher, videos, isLoading, id };
};
