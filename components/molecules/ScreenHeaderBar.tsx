import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BackButton } from '@/components/atoms/BackButton';

export interface ScreenHeaderBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ScreenHeaderBar: React.FC<ScreenHeaderBarProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.headerBar,
        {
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
        },
        style,
      ]}
    >
      <BackButton onPress={onBack} variant="solid" />

      <View style={styles.titleWrap}>
        <Text style={[styles.screenTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.screenSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightActionWrap}>
        {rightAction || <View style={styles.spacer} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
    paddingHorizontal: 8,
  },
  screenTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  rightActionWrap: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  spacer: {
    width: 40,
  },
});
