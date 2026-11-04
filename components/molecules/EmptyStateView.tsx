import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateViewProps {
  hasActiveFilters: boolean;
  isOfflineOnly: boolean;
  onResetFilters: () => void;
  onExplore: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  hasActiveFilters,
  isOfflineOnly,
  onResetFilters,
  onExplore,
}) => {
  const { colors } = useTheme();

  const title = hasActiveFilters
    ? 'لا توجد دروس مطابقة للفلاتر المحددة'
    : isOfflineOnly
    ? 'لا توجد فيديوهات محملة أوفلاين'
    : 'مكتبتك فارغة حالياً';

  const subtitle = hasActiveFilters
    ? 'جرب تغيير خيارات الفلترة أو إعادة ضبطها لعرض كل محتويات مكتبتك.'
    : isOfflineOnly
    ? 'يمكنك تحميل الحصص لمشاهدتها بدون اتصال بالإنترنت'
    : 'الحصص التي تقوم بتفعيلها أو مشاهدتها ستظهر هنا تلقائياً لسهولة الوصول إليها.';

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="library-outline" size={36} color="#00C897" />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {hasActiveFilters ? (
        <TouchableOpacity activeOpacity={0.8} style={styles.actionBtn} onPress={onResetFilters}>
          <Ionicons name="filter-outline" size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>إعادة ضبط الفلاتر</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity activeOpacity={0.8} style={styles.actionBtn} onPress={onExplore}>
          <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>استكشف الحصص والمدرسين</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 200, 151, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00C897',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
