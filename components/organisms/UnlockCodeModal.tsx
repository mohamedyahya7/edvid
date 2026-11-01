import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ActionButton } from '@/components/atoms/ActionButton';
import { IconPill } from '@/components/atoms/IconPill';

interface UnlockCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitCode: (code: string) => void;
  isLoading?: boolean;
}

export const UnlockCodeModal: React.FC<UnlockCodeModalProps> = ({
  visible,
  onClose,
  onSubmitCode,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    onSubmitCode(code);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <IconPill
            name="key-outline"
            size={22}
            containerSize={44}
            borderRadius={12}
            style={styles.iconPill}
          />

          <Text style={[styles.title, { color: colors.text }]}>
            تفعيل كود المحاضرة
          </Text>
          <Text style={styles.subtitle}>
            أدخل كود الكرت المكون من 8 أحرف لفتح المحاضرة على هذا الجهاز
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.primary,
                color: colors.text,
              },
            ]}
            placeholder="مثال: A9B2X7K1"
            placeholderTextColor="#8E8E93"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            maxLength={12}
            textAlign="center"
          />

          <View style={styles.buttonRow}>
            <ActionButton
              title="إلغاء"
              onPress={onClose}
              variant="secondary"
              style={styles.cancelButton}
            />
            <ActionButton
              title="تأكيد التفعيل"
              onPress={handleSubmit}
              variant="primary"
              loading={isLoading}
              disabled={code.trim().length === 0}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  iconPill: {
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
