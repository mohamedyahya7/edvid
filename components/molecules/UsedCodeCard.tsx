import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UsedCodeItem } from '@/hooks/useUsedCodes';

export interface UsedCodeCardProps {
  item: UsedCodeItem;
  onPress: (videoId: string | number) => void;
}

export const UsedCodeCard = React.memo<UsedCodeCardProps>(({ item, onPress }) => {
  const { colors } = useTheme();

  const isWatch = item.access_type === 'watch';
  const usedDate = item.used_at
    ? new Date(item.used_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'غير محدد';

  const expireDate = item.expires_at
    ? new Date(item.expires_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item.video_id)}
      style={[
        styles.codeCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Header of Card: Code badge and Access Type */}
      <View style={styles.cardHeader}>
        <View style={[styles.codePill, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
          <Ionicons name="key-outline" size={14} color={colors.primary} />
          <Text style={[styles.codeText, { color: colors.primary }]}>{item.id}</Text>
        </View>

        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: isWatch ? '#007AFF15' : '#34C75915',
              borderColor: isWatch ? '#007AFF30' : '#34C75930',
            },
          ]}
        >
          <Ionicons
            name={isWatch ? 'play-outline' : 'cloud-download-outline'}
            size={13}
            color={isWatch ? '#007AFF' : '#34C759'}
          />
          <Text
            style={[
              styles.typeBadgeText,
              { color: isWatch ? '#007AFF' : '#34C759' },
            ]}
          >
            {isWatch ? 'مشاهدة مباشرة' : 'تحميل أوفلاين'}
          </Text>
        </View>
      </View>

      {/* Video Title */}
      <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
        {item.video_title}
      </Text>

      {/* Dates Meta */}
      <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color="#8E8E93" />
          <Text style={styles.metaLabel}>تاريخ التفعيل: {usedDate}</Text>
        </View>

        {expireDate && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color="#FF9500" />
            <Text style={[styles.metaLabel, { color: '#FF9500' }]}>
              ينتهي: {expireDate}
            </Text>
          </View>
        )}
      </View>

      {/* Click-through Action Footer */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.cardFooterAction}>
          <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.cardFooterText, { color: colors.primary }]}>
            فتح المحاضرة الآن
          </Text>
        </View>
        <Ionicons name="chevron-back" size={14} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  codeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
