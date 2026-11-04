import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateViewProps {
  // Generic props
  iconName?: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;

  // Legacy/Library backward-compatible props
  hasActiveFilters?: boolean;
  isOfflineOnly?: boolean;
  onResetFilters?: () => void;
  onExplore?: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  iconName = 'library-outline',
  title,
  subtitle,
  actionLabel,
  actionIcon = 'compass-outline',
  onAction,
  style,

  // Legacy/Library backward compatibility
  hasActiveFilters,
  isOfflineOnly,
  onResetFilters,
  onExplore,
}) => {
  const { colors } = useTheme();

  // If used with legacy Library props, calculate title/subtitle/actions
  const resolvedTitle =
    title ??
    (hasActiveFilters
      ? 'لا توجد دروس مطابقة للفلاتر المحددة'
      : isOfflineOnly
      ? 'لا توجد فيديوهات محملة أوفلاين'
      : 'مكتبتك فارغة حالياً');

  const resolvedSubtitle =
    subtitle ??
    (hasActiveFilters
      ? 'جرب تغيير خيارات الفلترة أو إعادة ضبطها لعرض كل محتويات مكتبتك.'
      : isOfflineOnly
      ? 'يمكنك تحميل الحصص لمشاهدتها بدون اتصال بالإنترنت'
      : 'الحصص التي تقوم بتفعيلها أو مشاهدتها ستظهر هنا تلقائياً لسهولة الوصول إليها.');

  const resolvedActionLabel =
    actionLabel ??
    (hasActiveFilters
      ? 'إعادة ضبط الفلاتر'
      : onExplore
      ? 'استكشف الحصص والمدرسين'
      : undefined);

  const resolvedActionIcon =
    actionIcon ?? (hasActiveFilters ? 'filter-outline' : 'compass-outline');

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (hasActiveFilters && onResetFilters) {
      onResetFilters();
    } else if (onExplore) {
      onExplore();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}15` }]}>
        <Ionicons name={iconName} size={36} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{resolvedTitle}</Text>
      {resolvedSubtitle ? <Text style={styles.subtitle}>{resolvedSubtitle}</Text> : null}

      {resolvedActionLabel && handleAction ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={handleAction}
        >
          <Ionicons name={resolvedActionIcon} size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>{resolvedActionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
    gap: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
