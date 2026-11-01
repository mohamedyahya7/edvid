import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface VideoCodeBannerProps {
  onOpenActivationModal: () => void;
  filterLabel?: string | null;
  onClearFilters?: () => void;
}

export const VideoCodeBanner = React.memo<VideoCodeBannerProps>(({
  onOpenActivationModal,
  filterLabel,
  onClearFilters,
}) => {
  const { colors } = useTheme();

  if (filterLabel && onClearFilters) {
    return (
      <View
        style={[
          styles.filterContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
          },
        ]}
      >
        <View style={styles.filterTextWrapper}>
          <Ionicons name="funnel" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
          <Text style={[styles.filterText, { color: colors.text }]} numberOfLines={1}>
            {filterLabel}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClearFilters}
          style={[styles.clearBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
        >
          <Ionicons name="close-circle" size={14} color="#EF4444" style={{ marginLeft: 4 }} />
          <Text style={styles.clearBtnText}>إزالة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.bannerContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={onOpenActivationModal}
    >
      {/* Right side: Icon + Text (First child in RTL row = Right edge) */}
      <View style={styles.bannerContent}>
        <View style={[styles.qrIconBadge, { backgroundColor: `${colors.primary}18` }]}>
          <Ionicons name="qr-code-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: colors.text }]}>معك كود الفيديو؟</Text>
          <Text style={styles.subtitle}>اضغط لإدخال الكود أو المسح عبر الكاميرا</Text>
        </View>
      </View>

      {/* Left side: Chevron pointing left (Second child in space-between = Left edge) */}
      <Ionicons
        name="chevron-back"
        size={20}
        color={colors.text}
        style={{ opacity: 0.4 }}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bannerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  qrIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  filterTextWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'right',
  },
  clearBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
});
