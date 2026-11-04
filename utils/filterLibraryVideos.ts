import {
  LibraryFilterType,
  LibrarySubjectOption,
  LibraryTeacherOption,
  LibraryVideoItem,
} from '@/types/library';

export interface FilterParams {
  activeFilter: LibraryFilterType;
  selectedSubject: string | null;
  selectedTeacherId: string | null;
  searchQuery: string;
}

export interface FilterResult {
  filteredVideos: LibraryVideoItem[];
  statusFilteredVideos: LibraryVideoItem[];
  subjectOptions: LibrarySubjectOption[];
  teacherOptions: LibraryTeacherOption[];
  offlineCount: number;
  streamCount: number;
}

export function filterLibraryVideos(
  videos: LibraryVideoItem[],
  params: FilterParams
): FilterResult {
  const { activeFilter, selectedSubject, selectedTeacherId, searchQuery } = params;

  // 1. Filter by status
  const statusFilteredVideos = videos.filter((v) => {
    if (activeFilter === 'offline') {
      return (
        v.effective_download_status === 'COMPLETED' ||
        v.download_status === 'COMPLETED'
      );
    }
    if (activeFilter === 'stream') {
      return (
        v.effective_access_type === 'watch' ||
        v.access_type === 'watch' ||
        (v.effective_download_status !== 'COMPLETED' &&
          v.download_status !== 'COMPLETED')
      );
    }
    return true;
  });

  // 2. Distinct subjects derived strictly from statusFilteredVideos
  const subjectMap = new Map<string, number>();
  statusFilteredVideos.forEach((v) => {
    const name = v.subject_name?.trim() || 'عام';
    subjectMap.set(name, (subjectMap.get(name) || 0) + 1);
  });
  const subjectOptions: LibrarySubjectOption[] = Array.from(subjectMap.entries()).map(
    ([name, count]) => ({ name, count })
  );

  // 3. Filter by subject
  const subjectFilteredVideos = selectedSubject
    ? statusFilteredVideos.filter(
        (v) => (v.subject_name?.trim() || 'عام') === selectedSubject
      )
    : statusFilteredVideos;

  // 4. Distinct teachers derived strictly from subjectFilteredVideos
  const teacherMap = new Map<string, { id: string; name: string; count: number }>();
  subjectFilteredVideos.forEach((v) => {
    const id = String(v.teacher_id || v.teacher_name || 'other');
    const name = v.teacher_name?.trim() || 'أستاذ المادة';
    const existing = teacherMap.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      teacherMap.set(id, { id, name, count: 1 });
    }
  });
  const teacherOptions: LibraryTeacherOption[] = Array.from(teacherMap.values());

  // 5. Final filter: Teacher + Search query
  let result = subjectFilteredVideos;
  if (selectedTeacherId) {
    result = result.filter(
      (v) => String(v.teacher_id || v.teacher_name || 'other') === String(selectedTeacherId)
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter(
      (v) =>
        (v.title || '').toLowerCase().includes(q) ||
        (v.teacher_name || '').toLowerCase().includes(q) ||
        (v.subject_name || '').toLowerCase().includes(q)
    );
  }

  // Calculate offline and stream counts
  const offlineCount = videos.filter(
    (v) =>
      v.effective_download_status === 'COMPLETED' ||
      v.download_status === 'COMPLETED'
  ).length;

  const streamCount = Math.max(0, videos.length - offlineCount);

  return {
    filteredVideos: result,
    statusFilteredVideos,
    subjectOptions,
    teacherOptions,
    offlineCount,
    streamCount,
  };
}
