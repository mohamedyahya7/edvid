import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatBytes } from '@/utils/formatBytes';

interface StorageMeterProps {
  usedBytes: number;
  totalBytes?: number;
  downloadedCount: number;
}

export const StorageMeter: React.FC<StorageMeterProps> = ({
  usedBytes,
  totalBytes = 32 * 1024 * 1024 * 1024, // 32 GB default virtual limit
  downloadedCount,
}) => {
  const { colors } = useTheme();
  const percentage = Math.min(100, Math.max(0, (usedBytes / totalBytes) * 100));

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.labelCol}>
          <View style={styles.iconTitleRow}>
            <Ionicons name="hardware-chip-outline" size={15} color="#00C897" />
            <Text style={[styles.title, { color: colors.text }]}>المساحة المستخدمة</Text>
          </View>
          <Text style={styles.subtitle}>{downloadedCount} دروس محملة محلياً</Text>
        </View>
        <Text style={[styles.sizeText, { color: colors.text }]}>
          {formatBytes(usedBytes)}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(percentage, 3)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelCol: {
    gap: 2,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  sizeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#00C897',
    borderRadius: 3,
  },
});
