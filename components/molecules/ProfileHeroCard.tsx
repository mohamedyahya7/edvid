import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeroCardProps {
  userName: string;
  userInitials: string;
  gradeName: string;
  supportId?: string | null;
  copied: boolean;
  onCopySupportId: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  userName,
  userInitials,
  gradeName,
  supportId,
  copied,
  onCopySupportId,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
        <View style={styles.badgeOnline} />
      </View>

      <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>

      <View style={styles.gradeBadge}>
        <Ionicons name="school-outline" size={14} color="#00C897" />
        <Text style={styles.gradeText}>{gradeName || 'الصف الدراسي غير محدد'}</Text>
      </View>

      <View style={[styles.supportIdBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCopySupportId}
          style={[styles.copyBtn, copied && styles.copiedBtn]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={16}
            color={copied ? '#FFFFFF' : '#00C897'}
          />
        </TouchableOpacity>
        <View style={styles.supportIdTextCol}>
          <Text style={styles.supportIdLabel}>معرف الدعم الفني (Support ID):</Text>
          <Text style={[styles.supportIdValue, { color: colors.text }]}>
            {supportId || 'غير متوفر'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 200, 151, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00C897',
  },
  badgeOnline: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2ECC71',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 200, 151, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00C897',
  },
  supportIdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  copyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 200, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedBtn: {
    backgroundColor: '#00C897',
  },
  supportIdTextCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  supportIdLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  supportIdValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
