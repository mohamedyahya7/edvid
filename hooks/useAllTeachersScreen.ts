import { databaseService } from "@/lib/DatabaseService";
import { useAppStore } from "@/lib/store";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

export const useAllTeachersScreen = () => {
  const db = useSQLiteContext();
  const selectedGradeId = useAppStore((state) => state.selectedGradeId);
  const [teachersBySubject, setTeachersBySubject] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedGradeId) {
      const fetchTeachers = async () => {
        try {
          setIsLoading(true);
          const result = await databaseService.getAllTeachersForGrade(
            db,
            selectedGradeId
          );
          setTeachersBySubject(result as any);
        } catch (error) {
          console.error("Failed to fetch all teachers:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTeachers();
    }
  }, [selectedGradeId, db]);

  return { teachersBySubject, isLoading };
};
