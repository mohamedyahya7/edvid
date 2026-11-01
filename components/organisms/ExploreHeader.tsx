import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { storageUrl } from '@/api/Axios';
import { TeacherCard } from '@/components/molecules/TeacherCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';

interface ExploreHeaderProps {
  subjects: Array<{ id: string | number; title: string; image_url?: string | null }>;
  selectedSubjectId: string | number | null;
  toggleSubjectFilter: (id: string) => void;
  clearFilters: () => void;
  suggestedTeachers: Array<{
    id: string | number;
    name: string;
    subject_name?: string | null;
    profile_picture_url?: string | null;
  }>;
  selectedTeacherIds: Array<string | number>;
  toggleTeacherFilter: (id: string) => void;
  totalSubjectTeachersCount?: number;
  freeVideosCount?: number;
  onOpenActivationModal: () => void;
  onNavigateToTeacher: (id: string) => void;
  onNavigateToAllTeachers: () => void;
}

export const ExploreHeader = React.memo<ExploreHeaderProps>(({
  subjects,
  selectedSubjectId,
  toggleSubjectFilter,
  clearFilters,
  suggestedTeachers,
  selectedTeacherIds,
  toggleTeacherFilter,
  totalSubjectTeachersCount,
  freeVideosCount,
  onOpenActivationModal,
  onNavigateToTeacher,
  onNavigateToAllTeachers,
}) => {
  const { colors } = useTheme();

  const selectedSubject = subjects.find(
    (s) => String(s.id) === String(selectedSubjectId)
  );

  const teacherNames = suggestedTeachers
    .filter((t) => selectedTeacherIds.map(String).includes(String(t.id)))
    .map((t) => t.name)
    .join('، ');

  const hasFilter = Boolean(selectedSubjectId || selectedTeacherIds.length > 0);
  const filterLabel = hasFilter
    ? `فلترة بـ: ${selectedSubject?.title || ''}${teacherNames ? ` (${teacherNames})` : ''}`
    : null;

  // Teachers ratio: (free teachers count / total teachers of subject or grade)
  const teachersRatio =
    totalSubjectTeachersCount !== undefined && totalSubjectTeachersCount > 0
      ? `${suggestedTeachers.length} / ${totalSubjectTeachersCount}`
      : undefined;

  return (
    <View style={styles.container}>
      {/* 1. Study Subjects Section with Filter status bound to header */}
      {subjects.length > 0 && (
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="المواد الدراسية"
            subtitle="اختر مادة للفلترة السريعة"
            iconName="book-outline"
            filterLabel={filterLabel}
            onClearFilter={hasFilter ? clearFilters : undefined}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectTabsScroll}
          >
            {/* "All" Tab */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => clearFilters()}
              style={[
                styles.subjectTabPill,
                {
                  backgroundColor: !selectedSubjectId ? colors.primary : colors.card,
                  borderColor: !selectedSubjectId ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.subjectTabText,
                  { color: !selectedSubjectId ? '#FFFFFF' : colors.text },
                ]}
              >
                الكل
              </Text>
            </TouchableOpacity>

            {/* Subject Tabs with Background Images */}
            {subjects.map((subject) => {
              const isSelected = String(selectedSubjectId) === String(subject.id);
              const imageUrl = subject.image_url
                ? (subject.image_url.startsWith('http') ? subject.image_url : storageUrl + subject.image_url)
                : null;

              return (
                <TouchableOpacity
                  key={subject.id.toString()}
                  activeOpacity={0.8}
                  onPress={() => toggleSubjectFilter(subject.id.toString())}
                  style={[
                    styles.subjectTabPill,
                    styles.subjectTabWithImage,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  {imageUrl ? (
                    <ImageBackground
                      source={{ uri: imageUrl }}
                      style={StyleSheet.absoluteFillObject}
                      imageStyle={{ borderRadius: 14, opacity: isSelected ? 0.35 : 0.2 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View
                    style={[
                      styles.tabContentOverlay,
                      isSelected && { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subjectTabText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? '800' : '700',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {subject.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 2. Suggested Teachers Section */}
      {suggestedTeachers.length > 0 && (
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="نخبة المعلمين"
            subtitle={selectedSubject ? `أبرز معلمي مادة ${selectedSubject.title}` : 'أبرز معلمي المواد الدراسية'}
            iconName="people-outline"
            onShowAll={onNavigateToAllTeachers}
            showAllText="عرض الكل"
            count={teachersRatio}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teachersScroll}
          >
            {suggestedTeachers.slice(0, 10).map((teacher) => {
              const isSelected = selectedTeacherIds.map(String).includes(String(teacher.id));
              return (
                <TeacherCard
                  key={teacher.id.toString()}
                  teacher={{
                    id: teacher.id.toString(),
                    name: teacher.name,
                    subject_name: teacher.subject_name,
                    profile_picture_url: teacher.profile_picture_url,
                  }}
                  isSelected={isSelected}
                  onPress={() => {
                    if (selectedSubjectId) {
                      toggleTeacherFilter(teacher.id.toString());
                    } else {
                      onNavigateToTeacher(teacher.id.toString());
                    }
                  }}
                  onLongPress={() => onNavigateToTeacher(teacher.id.toString())}
                />
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 3. Free Lessons Section Header */}
      <View style={styles.sectionWrap}>
        <SectionHeader
          title="الدروس المجانية"
          subtitle="شاهد الدروس المجانية"
          iconName="play-circle-outline"
          count={freeVideosCount}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: 4,
  },
  sectionWrap: {
    marginTop: 4,
  },
  subjectTabsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    alignItems: 'center',
    gap: 8,
  },
  subjectTabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectTabWithImage: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    minWidth: 90,
    height: 38,
  },
  tabContentOverlay: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  subjectTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  teachersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    alignItems: 'center',
    gap: 8,
  },
});
