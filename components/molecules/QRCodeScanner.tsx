import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { ActionButton } from '@/components/atoms/ActionButton';
import { IconPill } from '@/components/atoms/IconPill';

type QRCodeScannerProps = {
  onCodeScanned: (data: string) => void;
  onClose: () => void;
};

export default function QRCodeScanner({
  onCodeScanned,
  onClose,
}: QRCodeScannerProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (hasScanned) return;
    setHasScanned(true);
    onCodeScanned(data);
  };

  // Web Fallback if Camera is not supported or not available
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconPill name="qr-code-outline" size={32} color={colors.primary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>مسح رمز الـ QR</Text>
          <Text style={styles.permissionSubtitle}>
            خاصية الكاميرا المباشرة غير مدعومة بالكامل على المتصفح. يمكنك إدخال كود التفعيل يدوياً بكل سهولة.
          </Text>
          <View style={styles.actionRow}>
            <ActionButton
              title="إدخال الكود يدوياً"
              onPress={onClose}
              variant="primary"
              style={styles.fullWidthBtn}
            />
          </View>
        </View>
      </View>
    );
  }

  // Permission Loading State
  if (!permission) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: '#000000' }]}>
        <Text style={styles.loadingText}>جاري تهيئة الكاميرا...</Text>
      </View>
    );
  }

  // Permission Denied / Not Granted State
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconPill name="camera-outline" size={32} color={colors.primary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>تصريح الكاميرا مطلوب</Text>
          <Text style={styles.permissionSubtitle}>
            يلزم السماح بالوصول إلى الكاميرا لتتمكن من مسح كود تفعيل الحصة أو الكورس تلقائياً وبسرعة.
          </Text>
          <View style={styles.actionRow}>
            <ActionButton
              title="منح إذن الكاميرا"
              onPress={requestPermission}
              variant="primary"
              icon={<Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />}
              style={styles.fullWidthBtn}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.cancelTextBtn}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>إلغاء والعودة للإدخال اليدوي</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <CameraView
        onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dark Overlay Layer with Viewfinder Target Cutout */}
      <SafeAreaView style={styles.overlay}>
        {/* Top Navigation Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.glassCircleBtn}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>مسح رمز التفعيل</Text>
            <Text style={styles.headerSub}>وجّه الكاميرا نحو كود الـ QR</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTorchEnabled((prev) => !prev)}
            style={[styles.glassCircleBtn, torchEnabled && { backgroundColor: colors.primary }]}
          >
            <Ionicons
              name={torchEnabled ? 'flash' : 'flash-off-outline'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Viewfinder Target Box with 4 Corner Brackets */}
        <View style={styles.viewfinderCenter}>
          <View style={[styles.viewfinderBox, { borderColor: `${colors.primary}40` }]}>
            {/* Corner Brackets */}
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
          </View>
          <Text style={styles.scanHintText}>
            ضع الرمز داخل المربع ليتم المسح تلقائياً
          </Text>
        </View>

        {/* Bottom Manual Action Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={styles.manualEntryBtn}
          >
            <Ionicons name="keypad-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.manualEntryText}>أو اكتب الكود يدوياً</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionRow: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  fullWidthBtn: {
    width: '100%',
  },
  cancelTextBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.75,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  glassCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  viewfinderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderBox: {
    width: 250,
    height: 250,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: '#22C55E',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  scanHintText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  manualEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  manualEntryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
