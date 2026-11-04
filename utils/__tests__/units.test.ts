import { formatBytes, formatBytesEn } from '../formatBytes';
import { filterLibraryVideos } from '../filterLibraryVideos';
import { LibraryVideoItem } from '@/types/library';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('🧪 Running Pure Units Verification Tests...');

// 1. Tests for formatBytes
assert(formatBytes(0) === '0 MB', '0 bytes should return 0 MB');
assert(formatBytes(null) === '0 MB', 'null should return 0 MB');
assert(formatBytes(undefined) === '0 MB', 'undefined should return 0 MB');
assert(formatBytes(-100) === '0 MB', 'negative bytes should return 0 MB');
assert(formatBytes(1024 * 1024 * 50) === '50 ميغابايت', '50 MB Arabic format');
assert(formatBytesEn(1024 * 1024 * 50) === '50 MB', '50 MB English format');
assert(formatBytes(1024 * 1024 * 1024 * 1.5) === '1.5 غيغابايت', '1.5 GB Arabic format');
console.log('✅ formatBytes tests passed.');

// 2. Tests for filterLibraryVideos
const mockVideos: LibraryVideoItem[] = [
  {
    id: 1,
    title: 'مراجعة التفاضل الأولى',
    teacher_id: 101,
    teacher_name: 'أحمد محمود',
    subject_name: 'رياضيات',
    download_status: 'COMPLETED',
    effective_download_status: 'COMPLETED',
    access_type: 'offline',
  },
  {
    id: 2,
    title: 'شرح الكيمياء العضوية',
    teacher_id: 102,
    teacher_name: 'خالد جلال',
    subject_name: 'كيمياء',
    download_status: 'PENDING',
    effective_download_status: 'PENDING',
    access_type: 'watch',
    effective_access_type: 'watch',
  },
  {
    id: 3,
    title: 'مسائل الديناميكا المتقدمة',
    teacher_id: 101,
    teacher_name: 'أحمد محمود',
    subject_name: 'رياضيات',
    download_status: 'COMPLETED',
    effective_download_status: 'COMPLETED',
    access_type: 'offline',
  },
];

// Test All
const resAll = filterLibraryVideos(mockVideos, {
  activeFilter: 'all',
  selectedSubject: null,
  selectedTeacherId: null,
  searchQuery: '',
});
assert(resAll.filteredVideos.length === 3, 'All filter should return 3 videos');
assert(resAll.offlineCount === 2, 'Offline count should be 2');
assert(resAll.streamCount === 1, 'Stream count should be 1');
assert(resAll.subjectOptions.length === 2, 'Should have 2 distinct subjects');

// Test Offline Only
const resOffline = filterLibraryVideos(mockVideos, {
  activeFilter: 'offline',
  selectedSubject: null,
  selectedTeacherId: null,
  searchQuery: '',
});
assert(resOffline.filteredVideos.length === 2, 'Offline filter should return 2 videos');

// Test Stream Only
const resStream = filterLibraryVideos(mockVideos, {
  activeFilter: 'stream',
  selectedSubject: null,
  selectedTeacherId: null,
  searchQuery: '',
});
assert(resStream.filteredVideos.length === 1, 'Stream filter should return 1 video');

// Test Subject filter
const resSubject = filterLibraryVideos(mockVideos, {
  activeFilter: 'all',
  selectedSubject: 'رياضيات',
  selectedTeacherId: null,
  searchQuery: '',
});
assert(resSubject.filteredVideos.length === 2, 'Math filter should return 2 videos');
assert(resSubject.teacherOptions.length === 1, 'Math teacher options should have 1 teacher');

// Test Search
const resSearch = filterLibraryVideos(mockVideos, {
  activeFilter: 'all',
  selectedSubject: null,
  selectedTeacherId: null,
  searchQuery: 'عضوية',
});
assert(resSearch.filteredVideos.length === 1, 'Search query should match 1 video');
assert(resSearch.filteredVideos[0].id === 2, 'Matched video ID should be 2');

console.log('✅ filterLibraryVideos tests passed.');
console.log('🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!');
