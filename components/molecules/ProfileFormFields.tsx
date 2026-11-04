import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileFormFieldsProps {
  name: string;
  onChangeName: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  confirmPassword: string;
  onChangeConfirmPassword: (text: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  showConfirmPassword: boolean;
  onToggleShowConfirmPassword: () => void;
}

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  name,
  onChangeName,
  password,
  onChangePassword,
  confirmPassword,
  onChangeConfirmPassword,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Name Input */}
      <View style={styles.fieldWrap}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>الاسم الكامل</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="person-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder="أدخل اسمك"
            placeholderTextColor="#8E8E93"
            style={[styles.input, { color: colors.text }]}
            textAlign="right"
          />
        </View>
      </View>

      {/* New Password Input */}
      <View style={styles.fieldWrap}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>كلمة المرور الجديدة (اختياري)</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={onToggleShowPassword} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TextInput
            value={password}
            onChangeText={onChangePassword}
            placeholder="اتركه فارغاً إذا لم ترغب في التغيير"
            placeholderTextColor="#8E8E93"
            secureTextEntry={!showPassword}
            style={[styles.input, { color: colors.text }]}
            textAlign="right"
          />
          <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
        </View>
      </View>

      {/* Confirm Password Input */}
      {password.length > 0 && (
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>تأكيد كلمة المرور الجديدة</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity onPress={onToggleShowConfirmPassword} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8E8E93" />
            </TouchableOpacity>
            <TextInput
              value={confirmPassword}
              onChangeText={onChangeConfirmPassword}
              placeholder="أعد كتابة كلمة المرور"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, { color: colors.text }]}
              textAlign="right"
            />
            <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 24,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  inputIcon: {
    marginLeft: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
