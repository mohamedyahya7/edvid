import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProfileHeaderBarProps {
  userName: string;
}

export const ProfileHeaderBar: React.FC<ProfileHeaderBarProps> = ({ userName }) => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.userInfoWrap}
        onPress={() => router.push('/edit-profile')}
      >
        <View style={[styles.avatarPill, { backgroundColor: `${colors.primary}18`, borderColor: colors.border }]}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
        <View style={styles.userTextCol}>
          <Text style={styles.greetingText}>مرحباً بك 👋</Text>
          <Text style={[styles.userNameText, { color: colors.text }]} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => router.push('/edit-profile')}
        style={[styles.settingsBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="settings-outline" size={19} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  userInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTextCol: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  greetingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
