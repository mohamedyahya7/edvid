import { useState, useMemo, useCallback } from 'react';
import { useAllTeachersScreen } from '@/hooks/useAllTeachersScreen';
import { useSyncRefresh } from '@/hooks/useSyncRefresh';
import { matchesQuery } from '@/utils/searchMatcher';

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
  const { teachersBySubject, isLoading, refetchTeachers, toggleFollow } = useAllTeachersScreen();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Reusable unified pull-to-refresh
  const { isRefreshing, onRefresh } = useSyncRefresh(refetchTeachers, {
    debugTag: 'FollowedTeachers',
  });

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

  // Apply filters: Subject + Pure search matcher
  const displayedTeachers = useMemo<FollowedTeacher[]>(() => {
    let result = allFollowedTeachers;

    if (selectedSubjectId) {
      result = result.filter((t) => String(t.subject_id) === String(selectedSubjectId));
    }

    if (searchQuery.trim()) {
      result = result.filter((t) =>
        matchesQuery(t, searchQuery, (teacher) => [
          teacher.name,
          teacher.subject_title,
          teacher.bio,
        ])
      );
    }

    return result;
  }, [allFollowedTeachers, selectedSubjectId, searchQuery]);

  const handleUnfollow = useCallback(
    (id: string) => {
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
