import { useEffect, useMemo, useState } from 'react';
import { filterLibraryVideos } from '@/utils/filterLibraryVideos';
import { LibraryFilterType, LibraryVideoItem } from '@/types/library';

export function useLibraryFilters(videos: LibraryVideoItem[]) {
  const [activeFilter, setActiveFilter] = useState<LibraryFilterType>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filterResult = useMemo(() => {
    return filterLibraryVideos(videos, {
      activeFilter,
      selectedSubject,
      selectedTeacherId,
      searchQuery,
    });
  }, [videos, activeFilter, selectedSubject, selectedTeacherId, searchQuery]);

  // Auto-reset selectedSubject if no longer in subjectOptions
  useEffect(() => {
    if (
      selectedSubject &&
      !filterResult.subjectOptions.some((s) => s.name === selectedSubject)
    ) {
      setSelectedSubject(null);
    }
  }, [filterResult.subjectOptions, selectedSubject]);

  // Auto-reset selectedTeacherId if no longer in teacherOptions
  useEffect(() => {
    if (
      selectedTeacherId &&
      !filterResult.teacherOptions.some((t) => t.id === selectedTeacherId)
    ) {
      setSelectedTeacherId(null);
    }
  }, [filterResult.teacherOptions, selectedTeacherId]);

  const hasActiveSubFilters = Boolean(
    selectedSubject || selectedTeacherId || searchQuery.trim()
  );

  const resetAllFilters = () => {
    setActiveFilter('all');
    setSelectedSubject(null);
    setSelectedTeacherId(null);
    setSearchQuery('');
  };

  return {
    activeFilter,
    setActiveFilter,
    selectedSubject,
    setSelectedSubject,
    selectedTeacherId,
    setSelectedTeacherId,
    searchQuery,
    setSearchQuery,
    hasActiveSubFilters,
    resetAllFilters,
    ...filterResult,
  };
}
