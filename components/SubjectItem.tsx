import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { storageUrl } from '@/api/Axios';

interface SubjectItemProps {
  item: {
    id: string | number;
    title: string;
    description?: string;
    image?: string;
    is_followed?: boolean | number;
  };
  onToggleFollow: (item: any) => void;
}

export const SubjectItem: React.FC<SubjectItemProps> = ({ item, onToggleFollow }) => {
  const { colors } = useTheme();
  const isFollowed = Boolean(item.is_followed);

  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${storageUrl}${item.image}`
    : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isFollowed ? 'rgba(0, 200, 151, 0.35)' : colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Follow Toggle Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onToggleFollow(item)}
          style={[
            styles.followBtn,
            isFollowed
              ? styles.followedBtn
              : [styles.unfollowedBtn, { borderColor: colors.border, backgroundColor: colors.background }],
          ]}
        >
          {isFollowed ? (
            <>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.followedBtnText}>متابعة</Text>
            </>
          ) : (
            <>
              <Ionicons name="add" size={16} color={colors.text} />
              <Text style={[styles.unfollowedBtnText, { color: colors.text }]}>متابعة</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Right: Info & Subject Icon (RTL layout) */}
        <View style={styles.rightInfo}>
          <View style={styles.textDetails}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {item.description}
              </Text>
            ) : (
              <Text style={styles.description} numberOfLines={1}>
                {isFollowed ? 'المادة مضافة إلى موادك الدراسية' : 'اضغط للمتابعة وتلقي أحدث الحصص'}
              </Text>
            )}
          </View>

          <View style={[styles.iconWrapper, { backgroundColor: isFollowed ? 'rgba(0, 200, 151, 0.12)' : 'rgba(150, 150, 150, 0.08)' }]}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons
                name="book-outline"
                size={22}
                color={isFollowed ? '#00C897' : '#8E8E93'}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 12,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
    writingDirection: 'rtl',
  },
  description: {
    fontSize: 12,
    color: '#8E8E93',
    writingDirection: 'rtl',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  followedBtn: {
    backgroundColor: '#00C897',
  },
  unfollowedBtn: {
    borderWidth: 1,
  },
  followedBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  unfollowedBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
