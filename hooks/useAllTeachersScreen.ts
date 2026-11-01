import { getAllTeachersForGrade, toggleFollowTeacher } from "@/lib/db/queries/teacher.queries";
import { getFollowedSubjects } from "@/lib/db/queries/subject.queries";
import { useAuthStore } from "@/lib/store/authStore";
import { useAppStore } from "@/lib/store";
import { useSQLiteContext } from "expo-sqlite";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

export function useAllTeachersScreen() {
  const db = useSQLiteContext();
  const user = useAuthStore((state) => state.user);
  const selectedGradeId = useAppStore((state) => state.selectedGradeId);
  const lastSyncTimestamp = useAppStore((state) => state.lastSyncTimestamp);
  const isFocused = useIsFocused();

  const [teachersBySubject, setTeachersBySubject] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const gradeIdToUse = selectedGradeId || user?.grade_id?.toString() || null;

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    if (db) {
      const [allTeachers, followedSubjects] = await Promise.all([
        getAllTeachersForGrade(db, gradeIdToUse),
        getFollowedSubjects(db),
      ]);

      // Ensure every followed subject has a section/tab even if 0 teachers exist yet
      const existingSubjectIds = new Set(allTeachers.map((s) => String(s.id)));
      const fullSections = [...allTeachers];
      for (const subj of followedSubjects) {
        if (!existingSubjectIds.has(String(subj.id))) {
          fullSections.push({
            id: String(subj.id),
            title: subj.title,
            image: subj.image,
            data: [],
          });
        }
      }

      setTeachersBySubject(fullSections);
    }
    setIsLoading(false);
  }, [db, gradeIdToUse]);

  useEffect(() => {
    if (isFocused) {
      fetchTeachers();
    }
  }, [isFocused, lastSyncTimestamp, fetchTeachers]);

  const handleToggleFollow = useCallback(
    async (teacherId: string, currentStatus: boolean) => {
      // Optimistic update
      setTeachersBySubject((prev) =>
        prev.map((section) => ({
          ...section,
          data: section.data.map((t: any) =>
            String(t.id) === String(teacherId)
              ? { ...t, is_followed: !currentStatus }
              : t
          ),
        }))
      );
      await toggleFollowTeacher(db, teacherId, !currentStatus);
      useAppStore.getState().actions.notifySyncCompleted();
    },
    [db]
  );

  return {
    teachersBySubject,
    isLoading,
    refetchTeachers: fetchTeachers,
    toggleFollow: handleToggleFollow,
    setTeachersBySubject,
  };
}
