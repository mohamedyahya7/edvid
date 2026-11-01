import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import axiosInstance from '../../api/Axios';
import { saveSetting } from '@/lib/db/queries/settings.queries';
import { useAppActions } from '@/lib/store';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginScreen() {
  const { signIn } = useAuthStore((state) => state.actions);
  const { setSelectedGradeId } = useAppActions();
  const db = useSQLiteContext();
  const router = useRouter();
  const { colors } = useTheme();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert('تنبيه', 'الرجاء إدخال رقم الهاتف وكلمة المرور.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/login', {
        phone: phone.trim(),
        password,
      });

      const { user, token } = response.data;

      signIn(user, token);

      if (user.role === 'student' && user.grade_id && db) {
        setSelectedGradeId(user.grade_id.toString());
        await saveSetting(db, 'selected_grade_id', user.grade_id.toString());
      }

      if (user.role === 'student') {
        router.replace('/(tabs)');
      } else {
        router.replace('/teacher-dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage =
        error.response?.data?.message || 'حدث خطأ غير متوقع. يرجى التحقق من بيانات الدخول.';
      Alert.alert('فشل تسجيل الدخول', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>
            <Text style={{ color: '#00C897' }}>B</Text>AMBOO
          </Text>
          <Text style={styles.brandSlogan}>عقول مشرقة طموحة تبني عالمنا</Text>
        </View>

        {/* Login Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>تسجيل الدخول</Text>
          <Text style={styles.cardSubtitle}>مرحباً بك مجدداً! سجّل دخولك لمتابعة دروسك</Text>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="01xxxxxxxxx"
                placeholderTextColor="#8E8E93"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                textAlign="right"
              />
              <Ionicons name="call-outline" size={20} color="#8E8E93" style={styles.leadingIcon} />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>كلمة المرور</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#8E8E93"
                />
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                textAlign="right"
              />
              <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.leadingIcon} />
            </View>
          </View>

          {/* Login CTA */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.loginBtnText}>دخول</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer: Register Link */}
        <View style={styles.footerContainer}>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.registerBtn} activeOpacity={0.7}>
              <Text style={styles.registerPrompt}>
                ليس لديك حساب؟{' '}
                <Text style={styles.registerHighlight}>سجّل الآن</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 200, 151, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 52,
    height: 52,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandSlogan: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 6,
    textAlign: 'right',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 12,
  },
  leadingIcon: {
    marginLeft: 8,
  },
  eyeBtn: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  loginBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C897',
    height: 50,
    borderRadius: 14,
    marginTop: 8,
    gap: 8,
    shadowColor: '#00C897',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  registerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  registerPrompt: {
    fontSize: 13.5,
    color: '#8E8E93',
  },
  registerHighlight: {
    color: '#00C897',
    fontWeight: '700',
  },
});
