import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import QRCodeScanner from '@/components/molecules/QRCodeScanner';
import { useActivationController } from '@/hooks/useActivationController';
import { ActivationInputStep } from '@/components/molecules/ActivationInputStep';
import { ActivationResolutionStep } from '@/components/molecules/ActivationResolutionStep';

interface ActivationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ActivationModal({ visible, onClose }: ActivationModalProps) {
  const { colors } = useTheme();
  const {
    code,
    setCode,
    isLoading,
    error,
    resolutions,
    video,
    selectedResolution,
    setSelectedResolution,
    isScannerVisible,
    setScannerVisible,
    handleClose,
    handleCheckCode,
    handleDownload,
    handleWatchNow,
    handleCodeScanned,
  } = useActivationController(onClose);

  return (
    <>
      {/* Scanner Overlay Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isScannerVisible}
        onRequestClose={() => setScannerVisible(false)}
      >
        <QRCodeScanner
          onCodeScanned={handleCodeScanned}
          onClose={() => setScannerVisible(false)}
        />
      </Modal>

      {/* Main Activation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible && !isScannerVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.backdrop}>
          <View style={[styles.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.titleWrap}>
                <View style={[styles.iconPill, { backgroundColor: `${colors.primary}18` }]}>
                  <Ionicons name="key-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>تفعيل كود الحصة</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClose}
                style={[styles.closeBtn, { backgroundColor: colors.background }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.body}>
              {isLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>جاري معالجة الكود...</Text>
                </View>
              ) : resolutions.length > 0 && video ? (
                <ActivationResolutionStep
                  video={video}
                  resolutions={resolutions}
                  selectedResolution={selectedResolution}
                  onSelectResolution={setSelectedResolution}
                  onWatchNow={handleWatchNow}
                  onDownload={handleDownload}
                />
              ) : (
                <ActivationInputStep
                  code={code}
                  onChangeCode={setCode}
                  error={error}
                  onOpenScanner={() => setScannerVisible(true)}
                  onSubmit={handleCheckCode}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    maxHeight: 520,
  },
  loadingBox: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
