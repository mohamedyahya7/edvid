import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StorageMeter } from '@/components/molecules/StorageMeter';

interface LibraryStorageHeaderProps {
  totalVideosCount: number;
  usedBytes: number;
  downloadedCount: number;
  onRefresh: () => void;
}

export const LibraryStorageHeader: React.FC<LibraryStorageHeaderProps> = ({
  totalVideosCount,
  usedBytes,
  downloadedCount,
  onRefresh,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: colors.text }]}>مكتبتك التعليمية</Text>
          <Text style={styles.subtitle}>
            {totalVideosCount} درس محفوظ ومتاح لك للمتابعة
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onRefresh}
          style={[styles.refreshBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <StorageMeter usedBytes={usedBytes} downloadedCount={downloadedCount} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  titleCol: {
    gap: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
