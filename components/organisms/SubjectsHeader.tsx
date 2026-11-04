import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SubjectFilterTab } from '@/hooks/useSubjectsScreen';

export interface SubjectsHeaderProps {
  totalCount: number;
  followedCount: number;
  activeTab: SubjectFilterTab;
  onSelectTab: (tab: SubjectFilterTab) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onBack: () => void;
}

export const SubjectsHeader: React.FC<SubjectsHeaderProps> = ({
  totalCount,
  followedCount,
  activeTab,
  onSelectTab,
  searchQuery,
  onChangeSearchQuery,
  onBack,
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

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>المواد الدراسية</Text>
          <Text style={styles.screenSubtitle}>
            {followedCount} مادة متابعة من أصل {totalCount}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="ابحث عن مادة..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onChangeSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('all')}
          style={[
            styles.tabChip,
            activeTab === 'all'
              ? [styles.activeTabChip, { backgroundColor: colors.primary }]
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            الكل ({totalCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('followed')}
          style={[
            styles.tabChip,
            activeTab === 'followed'
              ? [styles.activeTabChip, { backgroundColor: colors.primary }]
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'followed' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            المتابعة ({followedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('unfollowed')}
          style={[
            styles.tabChip,
            activeTab === 'unfollowed'
              ? [styles.activeTabChip, { backgroundColor: colors.primary }]
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'unfollowed' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            غير المتابعة ({totalCount - followedCount})
          </Text>
        </TouchableOpacity>
      </View>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 11.5,
    color: '#8E8E93',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeTabChip: {},
  inactiveTabChip: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
