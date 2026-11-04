import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAllSubjects,
  followSubject,
  unfollowSubject,
} from '@/lib/db/queries/subject.queries';
import { useAppStore } from '@/lib/store';
import { SyncService } from '@/services/SyncService';

export type SubjectFilterTab = 'all' | 'followed' | 'unfollowed';

export interface SubjectItemData {
  id: string | number;
  title: string;
  is_followed: number | boolean;
  [key: string]: any;
}

export function useSubjectsScreen() {
  const db = useSQLiteContext();
  const [subjects, setSubjects] = useState<SubjectItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SubjectFilterTab>('all');

  const fetchSubjects = useCallback(async () => {
    try {
      const allSubjects = await getAllSubjects(db);
      setSubjects(allSubjects || []);
    } catch (e) {
      console.warn('fetchSubjects error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('SyncService refresh error in Subjects:', e);
    }
    await fetchSubjects();
  }, [db, fetchSubjects]);

  const handleToggleFollow = useCallback(
    async (subjectToToggle: SubjectItemData) => {
      const newStatus = !subjectToToggle.is_followed;
      // Optimistically update the UI
      setSubjects((currentSubjects) =>
        currentSubjects.map((subject) =>
          String(subject.id) === String(subjectToToggle.id)
            ? { ...subject, is_followed: newStatus ? 1 : 0 }
            : subject
        )
      );

      try {
        if (subjectToToggle.is_followed) {
          await unfollowSubject(db, subjectToToggle.id);
        } else {
          await followSubject(db, subjectToToggle.id);
        }
        // Instantly notify app store so ExploreScreen, AllTeachersScreen and Home refresh immediately
        useAppStore.getState().actions.notifySyncCompleted();
      } catch (error) {
        console.error('Failed to update follow status:', error);
        const updatedSubjects = await getAllSubjects(db);
        setSubjects(updatedSubjects);
      }
    },
    [db]
  );

  // Followed count calculation
  const followedCount = useMemo(() => {
    return subjects.filter((s) => Boolean(s.is_followed)).length;
  }, [subjects]);

  // Filtered and searched subjects
  const filteredSubjects = useMemo(() => {
    let result = subjects;

    if (activeTab === 'followed') {
      result = result.filter((s) => Boolean(s.is_followed));
    } else if (activeTab === 'unfollowed') {
      result = result.filter((s) => !Boolean(s.is_followed));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((s) => (s.title || '').toLowerCase().includes(q));
    }

    return result;
  }, [subjects, activeTab, searchQuery]);

  return {
    subjects,
    filteredSubjects,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    followedCount,
    onRefresh,
    handleToggleFollow,
  };
}
