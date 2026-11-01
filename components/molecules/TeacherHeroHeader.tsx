import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageUrl } from '@/api/Axios';
import { BackButton } from '@/components/atoms/BackButton';

interface TeacherHeroHeaderProps {
  teacherImage?: string | null;
  teacherName: string;
  subjectName?: string | null;
  hasWhatsApp?: boolean;
  onBack: () => void;
  onWhatsApp?: () => void;
}

export const TeacherHeroHeader = React.memo<TeacherHeroHeaderProps>(({
  teacherImage,
  teacherName,
  subjectName,
  hasWhatsApp = false,
  onBack,
  onWhatsApp,
}) => {
  const insets = useSafeAreaInsets();

  const profileImg = teacherImage
    ? (teacherImage.startsWith('http') ? teacherImage : storageUrl + teacherImage)
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';

  return (
    <View style={styles.container}>
      {/* Background Image Overlay */}
      <Image
        source={{ uri: profileImg }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      {/* Top Floating Bar: row-reverse places BackButton on Right, WhatsApp on Left */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        {/* Back Button (on Far Right in RTL) */}
        <BackButton variant="glass" onPress={onBack} />

        {/* WhatsApp Direct Action (on Far Left in RTL) */}
        {hasWhatsApp && onWhatsApp ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onWhatsApp}
            style={[styles.glassBtn, styles.whatsAppBtn]}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>

      {/* Bottom Hero Info: row-reverse places Avatar on Right, Name & Subject on Left */}
      <View style={styles.bottomInfo}>
        {/* Avatar (on Far Right in RTL) */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: profileImg }}
            style={styles.avatar}
          />
        </View>

        {/* Teacher Identity & Badges (to Left of Avatar, Right-aligned) */}
        <View style={styles.nameBlock}>
          <View style={styles.titleWithVerify}>
            <Text style={styles.teacherName} numberOfLines={1}>
              {teacherName}
            </Text>
            <Ionicons name="checkmark-circle" size={17} color="#00C897" />
          </View>
          <Text style={styles.subjectName}>
            {subjectName ? `مدرس ${subjectName}` : 'مدرس معتمد'}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 250,
    position: 'relative',
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  glassBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  whatsAppBtn: {
    backgroundColor: 'rgba(37, 211, 102, 0.18)',
    borderColor: 'rgba(37, 211, 102, 0.4)',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  avatarWrapper: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#00C897',
    backgroundColor: '#1C1C1E',
  },
  nameBlock: {
    flex: 1,
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  titleWithVerify: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  teacherName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
  },
  subjectName: {
    color: '#E0E0E0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
  },
});
