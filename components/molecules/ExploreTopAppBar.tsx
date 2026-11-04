import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface ExploreTopAppBarProps {
  onOpenActivationModal: () => void;
}

export const ExploreTopAppBar: React.FC<ExploreTopAppBarProps> = ({ onOpenActivationModal }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.topAppBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.brandRow}>
        <View style={[styles.logoPill, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.headerTitleWrap}>
          <View style={styles.titleWithBadge}>
            <Text style={[styles.mainBrandTitle, { color: colors.text }]}>منصة بامبو</Text>
            <View style={[styles.proBadge, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.proBadgeText, { color: colors.primary }]}>التعليمية</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>دليل المواد والدروس المجانية ونخبة المعلمين</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onOpenActivationModal}
        style={[styles.scannerBtn, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.scannerBtnText, { color: colors.primary }]}>تفعيل كود</Text>
        <Ionicons name="qr-code-outline" size={17} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoPill: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerTitleWrap: {
    alignItems: 'flex-start',
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mainBrandTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'right',
  },
  scannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  scannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
