import { useState, useMemo, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useAllTeachersScreen } from '@/hooks/useAllTeachersScreen';
import { SyncService } from '@/services/SyncService';

export interface FollowedTeacher {
  id: string | number;
  name: string;
  bio?: string | null;
  profile_picture_url?: string | null;
  subject_id: string | number;
  subject_title?: string;
  is_followed: boolean;
  [key: string]: any;
}

export interface SubjectTab {
  id: string;
  title: string;
  count: number;
}

export function useFollowedTeachersScreen() {
  const db = useSQLiteContext();
  const { teachersBySubject, isLoading, refetchTeachers, toggleFollow } = useAllTeachersScreen();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('SyncService refresh error in FollowedTeachers:', e);
    }
    await refetchTeachers();
    setIsRefreshing(false);
  }, [db, refetchTeachers]);

  // Filter only followed teachers across all subject sections
  const allFollowedTeachers = useMemo<FollowedTeacher[]>(() => {
    const list: FollowedTeacher[] = [];
    teachersBySubject.forEach((section) => {
      (section.data || []).forEach((t: any) => {
        if (t.is_followed) {
          list.push({
            ...t,
            subject_id: section.id,
            subject_title: section.title,
          });
        }
      });
    });
    return list;
  }, [teachersBySubject]);

  // Build subject tabs from followed teachers
  const subjectTabs = useMemo<SubjectTab[]>(() => {
    const subjectsMap = new Map<string, SubjectTab>();
    allFollowedTeachers.forEach((t) => {
      const sId = String(t.subject_id);
      if (!subjectsMap.has(sId)) {
        subjectsMap.set(sId, { id: sId, title: t.subject_title || 'مادة عامة', count: 0 });
      }
      subjectsMap.get(sId)!.count += 1;
    });
    return Array.from(subjectsMap.values());
  }, [allFollowedTeachers]);

  // Apply filters: Subject + Search Query
  const displayedTeachers = useMemo<FollowedTeacher[]>(() => {
    let result = allFollowedTeachers;

    if (selectedSubjectId) {
      result = result.filter((t) => String(t.subject_id) === String(selectedSubjectId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.subject_title && t.subject_title.toLowerCase().includes(q)) ||
          (t.bio && t.bio.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allFollowedTeachers, selectedSubjectId, searchQuery]);

  const handleUnfollow = useCallback(
    (id: string) => {
      // currentStatus = true -> toggles to unfollow (false)
      toggleFollow(id, true);
    },
    [toggleFollow]
  );

  return {
    allFollowedTeachers,
    displayedTeachers,
    subjectTabs,
    selectedSubjectId,
    setSelectedSubjectId,
    searchQuery,
    setSearchQuery,
    isLoading,
    isRefreshing,
    onRefresh,
    handleUnfollow,
  };
}
