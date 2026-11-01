import React from 'react';
import { StyleSheet, TouchableOpacity, View, ImageBackground, Text, I18nManager } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { storageUrl } from '@/api/Axios';

interface SubjectChipProps {
  id: string;
  label: string;
  image?: string | null;
  isSelected: boolean;
  onPress: () => void;
}

export const SubjectChip = React.memo<SubjectChipProps>(({
  label,
  image,
  isSelected,
  onPress,
}) => {
  const { colors } = useTheme();

  const imageUrl = image
    ? (image.startsWith('http') ? image : storageUrl + image)
    : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.chipBackground}
          imageStyle={{ borderRadius: 16, opacity: isSelected ? 0.6 : 0.25 }}
        >
          <View style={[
            styles.chipContent,
            isSelected && { backgroundColor: 'rgba(0, 0, 0, 0.45)' }
          ]}>
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? '#FFFFFF' : colors.text },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.chipContent}>
          <Text
            style={[
              styles.chipText,
              { color: isSelected ? '#FFFFFF' : colors.text },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
    marginBottom: 10,
    height: 72,
    width: '31.5%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chipBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContent: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
