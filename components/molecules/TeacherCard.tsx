import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { TeacherMetaRow } from '@/components/molecules/TeacherMetaRow';

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    subject_name?: string | null;
    profile_picture_url?: string | null;
  };
  isSelected?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export const TeacherCard = React.memo<TeacherCardProps>(({
  teacher,
  isSelected = false,
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: 1.5,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <TeacherMetaRow
        teacherName={teacher.name}
        teacherImage={teacher.profile_picture_url}
        subjectName={teacher.subject_name}
        avatarSize={38}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 168,
    height: 56,
    maxHeight: 56,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
});
