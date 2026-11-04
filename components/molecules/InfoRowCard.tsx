import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type InfoRowCardProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export const InfoRowCard = ({
  iconName,
  title,
  subtitle,
  onPress,
}: InfoRowCardProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}15` }]}>
        <Ionicons name={iconName} size={22} color={colors.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.primary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-back" size={16} color="#8E8E93" style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  chevron: {
    opacity: 0.6,
  },
});

export default InfoRowCard;
