import { useEffect, useState } from 'react';
import { Alert, Clipboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getGradeById } from '@/lib/db/queries/grade.queries';
import { getSetting } from '@/lib/db/queries/settings.queries';
import { useAuthStore } from '@/lib/store/authStore';

export function useEditProfileController() {
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

  const userInitials = (name || 'طالب')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join(' ');

  return {
    user,
    name,
    setName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    gradeName,
    isSaving,
    copied,
    userInitials,
    handleCopySupportId,
    handleSaveChanges,
    handleLogoutPress,
  };
}
