import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '@/components/atoms/BackButton';
import { ThemedText } from '@/components/ui/ThemedText';

interface SubjectTab {
  id: string;
  title: string;
  count: number;
}

interface TeachersCatalogHeaderProps {
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
  subjectTabs: SubjectTab[];
  totalTeachersCount: number;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
}

export const TeachersCatalogHeader: React.FC<TeachersCatalogHeaderProps> = ({
  selectedSubjectId,
  onSelectSubject,
  subjectTabs,
  totalTeachersCount,
  searchQuery,
  onChangeSearchQuery,
}) => {
  const { colors } = useTheme();

  const currentSubjectTitle = selectedSubjectId
    ? subjectTabs.find((s) => s.id === selectedSubjectId)?.title || 'المادة'
    : null;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <BackButton variant="solid" />

        <View style={styles.topBarCenter}>
          <ThemedText style={styles.topBarTitle}>نخبة المعلمين</ThemedText>
          <ThemedText style={styles.topBarSubtitle}>
            {currentSubjectTitle
              ? `معلمو ${currentSubjectTitle}`
              : `جميع المدرسين (${totalTeachersCount})`}
          </ThemedText>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            placeholder="ابحث باسم المدرس أو المادة..."
            placeholderTextColor="#8E8E93"
            style={[styles.searchInput, { color: colors.text }]}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onChangeSearchQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Subject Tabs */}
      {subjectTabs.length > 0 && (
        <View style={[styles.tabsWrap, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectSubject(null)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: !selectedSubjectId ? colors.primary : colors.card,
                  borderColor: !selectedSubjectId ? colors.primary : colors.border,
                },
              ]}
            >
              <ThemedText style={[styles.tabText, { color: !selectedSubjectId ? '#FFFFFF' : colors.text }]}>
                الكل ({totalTeachersCount})
              </ThemedText>
            </TouchableOpacity>

            {subjectTabs.map((tab) => {
              const isSelected = selectedSubjectId === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.8}
                  onPress={() => onSelectSubject(isSelected ? null : tab.id)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <ThemedText style={[styles.tabText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                    {tab.title} ({tab.count})
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarCenter: {
    alignItems: 'center',
    gap: 2,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    marginLeft: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
  },
  tabsWrap: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
