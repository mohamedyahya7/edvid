import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { storageUrl } from '@/api/Axios';

export interface TeacherMetaRowProps {
  id?: string | number | null;
  teacherName?: string | null;
  teacherImage?: string | null;
  subjectName?: string | null;
  avatarSize?: number;
  showVerified?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TeacherMetaRow = React.memo<TeacherMetaRowProps>(({
  teacherName,
  teacherImage,
  subjectName,
  avatarSize = 32,
  showVerified = true,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  if (!teacherName) return null;

  let finalImage = teacherImage;
  if (finalImage && !finalImage.startsWith('http')) {
    finalImage = storageUrl + finalImage;
  }
  if (!finalImage) {
    finalImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';
  }

  const innerContent = (
    <>
      <Image
        source={{ uri: finalImage }}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            borderColor: colors.border,
          },
        ]}
      />
      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {teacherName}
          </Text>
          {showVerified && (
            <Ionicons
              name="checkmark-circle"
              size={Math.max(11, Math.round(avatarSize * 0.38))}
              color={colors.primary}
              style={styles.verifiedIcon}
            />
          )}
        </View>
        {subjectName ? (
          <Text
            style={[styles.subject, { color: colors.primary }]}
            numberOfLines={1}
          >
            {subjectName}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.container, style]}
      >
        {innerContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {innerContent}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  avatar: {
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  textContainer: {
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  name: {
    fontSize: 12.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  verifiedIcon: {
    marginHorizontal: 2,
  },
  subject: {
    fontSize: 10.5,
    fontWeight: '500',
    opacity: 0.9,
    marginTop: 1,
    flexShrink: 1,
  },
});
