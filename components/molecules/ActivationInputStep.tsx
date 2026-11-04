import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface ActivationInputStepProps {
  code: string;
  onChangeCode: (text: string) => void;
  error: string | null;
  onOpenScanner: () => void;
  onSubmit: () => void;
}

export const ActivationInputStep: React.FC<ActivationInputStepProps> = ({
  code,
  onChangeCode,
  error,
  onOpenScanner,
  onSubmit,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.helperText}>
        أدخل كود الحصة المطبوع على الكارت أو امسح رمز الـ QR مباشرة عبر الكاميرا:
      </Text>

      <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="مثال: BAMBOO-XXXX"
          placeholderTextColor="#8E8E93"
          value={code}
          onChangeText={onChangeCode}
          autoCapitalize="characters"
          autoCorrect={false}
          textAlign="right"
        />
        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.qrBtn, { backgroundColor: `${colors.primary}18` }]}
          onPress={onOpenScanner}
        >
          <Ionicons name="camera-outline" size={21} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={onSubmit}
        >
          <Ionicons name="checkmark-done-outline" size={19} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>تفعيل الدرس</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  helperText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'right',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  qrBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
  },
  submitBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
