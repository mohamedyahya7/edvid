import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WatermarkConfig } from '@/types/video';

interface FloatingWatermarkProps {
  config: WatermarkConfig;
  containerWidth?: number;
  containerHeight?: number;
}

export const FloatingWatermark: React.FC<FloatingWatermarkProps> = ({
  config,
  containerWidth = 300,
  containerHeight = 180,
}) => {
  const [position, setPosition] = useState({ top: 20, left: 20 });

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate randomized positions within bounds
      const maxTop = Math.max(containerHeight - 50, 20);
      const maxLeft = Math.max(containerWidth - 140, 20);

      const randomTop = Math.floor(Math.random() * maxTop);
      const randomLeft = Math.floor(Math.random() * maxLeft);

      setPosition({ top: randomTop, left: randomLeft });
    }, config.intervalMs || 7000);

    return () => clearInterval(interval);
  }, [containerWidth, containerHeight, config.intervalMs]);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.watermarkContainer,
        {
          top: position.top,
          left: position.left,
          opacity: config.opacity ?? 0.28,
        },
      ]}
    >
      <Text style={styles.watermarkText}>{config.studentName}</Text>
      <Text style={styles.watermarkText}>{config.studentPhone}</Text>
      {config.studentCode && (
        <Text style={styles.watermarkSubText}>ID: {config.studentCode}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  watermarkContainer: {
    position: 'absolute',
    zIndex: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  watermarkSubText: {
    color: '#E0E0E0',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
