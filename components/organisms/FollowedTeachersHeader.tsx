import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SubjectTab } from '@/hooks/useFollowedTeachersScreen';

export interface FollowedTeachersHeaderProps {
  totalCount: number;
  subjectTabs: SubjectTab[];
  selectedSubjectId: string | null;
  onSelectSubjectId: (id: string | null) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onBack: () => void;
  onExploreAll: () => void;
}

export const FollowedTeachersHeader: React.FC<FollowedTeachersHeaderProps> = ({
  totalCount,
  subjectTabs,
  selectedSubjectId,
  onSelectSubjectId,
  searchQuery,
  onChangeSearchQuery,
  onBack,
  onExploreAll,
}) => {
  const { colors } = useTheme();

  return (
    <View>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>مدرسينك المتابعون</Text>
          <Text style={styles.screenSubtitle}>
            {totalCount > 0
              ? `${totalCount} مدرس تتابعهم`
              : 'قائمتك المفضلة من المدرسين'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onExploreAll}
          style={[styles.exploreAllBtn, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` }]}
        >
          <Ionicons name="compass-outline" size={16} color={colors.primary} />
          <Text style={[styles.exploreAllBtnText, { color: colors.primary }]}>
            كل المدرسين
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {totalCount > 0 && (
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="ابحث بين مدرسينك بالاسم أو المادة..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onChangeSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Horizontal Subject Filter Tabs */}
      {subjectTabs.length > 1 && (
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectSubjectId(null)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedSubjectId === null ? colors.primary : colors.card,
                  borderColor: selectedSubjectId === null ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedSubjectId === null ? '#FFFFFF' : colors.text },
                ]}
              >
                الكل ({totalCount})
              </Text>
            </TouchableOpacity>

            {subjectTabs.map((tab) => {
              const isSelected = selectedSubjectId === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.8}
                  onPress={() => onSelectSubjectId(isSelected ? null : tab.id)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {tab.title} ({tab.count})
                  </Text>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    gap: 2,
  },
  screenTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  exploreAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  exploreAllBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchIcon: {
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  tabsWrapper: {
    marginTop: 6,
    marginBottom: 2,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
