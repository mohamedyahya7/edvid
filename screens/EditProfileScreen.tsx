import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getGradeById } from '@/lib/db/queries/grade.queries';
import { getSetting } from '@/lib/db/queries/settings.queries';
import { useAuthStore } from '@/lib/store/authStore';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const db = useSQLiteContext();
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthStore((state) => state.actions);

  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gradeName, setGradeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGradeName = async () => {
      try {
        const gradeIdSetting = await getSetting(db, 'selected_grade_id');
        if (gradeIdSetting?.value) {
          const grade = await getGradeById(db, gradeIdSetting.value);
          if (grade) {
            setGradeName(grade.title);
          }
        }
      } catch (e) {
        console.warn('fetchGradeName error:', e);
      }
    };
    fetchGradeName();
  }, [db]);

  const handleCopySupportId = async () => {
    if (user?.support_id) {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(user.support_id);
      } else {
        Clipboard.setString(user.support_id);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('تم النسخ', 'تم نسخ معرف الدعم الخاص بك بنجاح.');
    } else {
      Alert.alert('تنبيه', 'لا يوجد معرف دعم متاح للنسخ.');
    }
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسمك.');
      return;
    }

    if (password && password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.');
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين.');
      return;
    }

    setIsSaving(true);
    try {
      // Future API sync hook; update local auth store user
      if (user) {
        const updatedUser = { ...user, name: name.trim() };
        useAuthStore.setState({ user: updatedUser });
      }
      Alert.alert('تم الحفظ', 'تم تحديث بيانات ملفك الشخصي بنجاح.');
      setPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      Alert.alert('خطأ', 'تعذر حفظ التغييرات حالياً.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل خروج',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // Student Initials
  const userInitials = (name || 'طالب')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join(' ');

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.text }]}>الملف الشخصي</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.badgeOnline} />
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'طالب بامبو'}</Text>

          {/* Grade Badge */}
          <View style={styles.gradeBadge}>
            <Ionicons name="school-outline" size={14} color="#00C897" />
            <Text style={styles.gradeText}>{gradeName || 'الصف الدراسي غير محدد'}</Text>
          </View>

          {/* Support ID Card */}
          <View style={[styles.supportIdBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopySupportId}
              style={[styles.copyBtn, copied && styles.copiedBtn]}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copied ? '#FFFFFF' : '#00C897'}
              />
              <Text style={[styles.copyBtnText, copied && { color: '#FFFFFF' }]}>
                {copied ? 'تم النسخ' : 'نسخ'}
              </Text>
            </TouchableOpacity>

            <View style={styles.supportIdDetails}>
              <Text style={styles.supportIdLabel}>معرف الدعم الخاص بك</Text>
              <Text style={[styles.supportIdValue, { color: colors.text }]}>
                {user?.support_id || 'BAMBOO-STU-001'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 1: Basic Information */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>البيانات الأساسية</Text>
        </View>

        <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>الاسم بالكامل</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={18} color="#8E8E93" style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="أدخل اسمك"
                placeholderTextColor="#8E8E93"
                textAlign="right"
              />
            </View>
          </View>

          {/* Phone Field (Read Only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>رقم الهاتف المسجل</Text>
            <View style={[styles.inputWrapper, styles.disabledWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={18} color="#8E8E93" style={styles.fieldIcon} />
              <Text style={[styles.disabledText, { color: colors.text }]}>
                {user?.phone || 'لا يوجد رقم مسجل'}
              </Text>
              <Ionicons name="lock-closed" size={14} color="#8E8E93" />
            </View>
          </View>
        </View>

        {/* Section 2: Security & Password */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>الأمان وكلمة المرور</Text>
        </View>

        <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* New Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>كلمة المرور الجديدة</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#8E8E93"
                />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="اتركها فارغة إذا لم ترغب بالتغيير"
                placeholderTextColor="#8E8E93"
                secureTextEntry={!showPassword}
                textAlign="right"
              />
              <Ionicons name="key-outline" size={18} color="#8E8E93" style={styles.fieldIcon} />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>تأكيد كلمة المرور الجديدة</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#8E8E93"
                />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="أعد إدخال كلمة المرور"
                placeholderTextColor="#8E8E93"
                secureTextEntry={!showConfirmPassword}
                textAlign="right"
              />
              <Ionicons name="shield-checkmark-outline" size={18} color="#8E8E93" style={styles.fieldIcon} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.logoutBtn, { borderColor: 'rgba(231, 76, 60, 0.4)' }]}
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out-outline" size={19} color="#E74C3C" />
          <Text style={styles.logoutBtnText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00C897',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C897',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  badgeOnline: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2ECC71',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  gradeBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 151, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  supportIdDetails: {
    alignItems: 'flex-end',
  },
  supportIdLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  supportIdValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 151, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  copiedBtn: {
    backgroundColor: '#00C897',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00C897',
  },
  sectionHeader: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  disabledWrapper: {
    opacity: 0.85,
    justifyContent: 'space-between',
  },
  fieldIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  disabledText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginRight: 8,
  },
  saveBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C897',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
    shadowColor: '#00C897',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(231, 76, 60, 0.06)',
    gap: 8,
  },
  logoutBtnText: {
    color: '#E74C3C',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
