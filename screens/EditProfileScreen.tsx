import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEditProfileController } from '@/hooks/useEditProfileController';
import { ProfileHeroCard } from '@/components/molecules/ProfileHeroCard';
import { ProfileFormFields } from '@/components/molecules/ProfileFormFields';
import { ScreenHeaderBar } from '@/components/molecules/ScreenHeaderBar';
import { ThemeSelectorCard } from '@/components/molecules/ThemeSelectorCard';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const {
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
  } = useEditProfileController();

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header Bar */}
      <ScreenHeaderBar title="الملف الشخصي" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <ProfileHeroCard
          userName={user?.name || 'طالب بامبو'}
          userInitials={userInitials}
          gradeName={gradeName}
          supportId={user?.support_id}
          copied={copied}
          onCopySupportId={handleCopySupportId}
        />

        {/* Dynamic 3-Way Theme Switcher (Light / Dark / System) */}
        <ThemeSelectorCard />

        <ProfileFormFields
          name={name}
          onChangeName={setName}
          password={password}
          onChangePassword={setPassword}
          confirmPassword={confirmPassword}
          onChangeConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          showConfirmPassword={showConfirmPassword}
          onToggleShowConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        {/* Action Buttons */}
        <View style={styles.actionsCol}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveChanges}
            disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={19} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>حفظ التعديلات</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleLogoutPress}
            style={[styles.logoutBtn, { borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.08)' }]}
          >
            <Ionicons name="log-out-outline" size={19} color="#E74C3C" />
            <Text style={styles.logoutBtnText}>تسجيل الخروج من الحساب</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  actionsCol: {
    gap: 12,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '700',
  },
});
