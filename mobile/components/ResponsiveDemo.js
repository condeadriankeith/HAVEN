import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

/**
 * ResponsiveDemo component that demonstrates the responsive design utilities
 * @returns {JSX.Element} Responsive demo component
 */
const ResponsiveDemo = () => {
  const { width, height, aspectRatio } = useResponsiveDimensions();
  const isLandscape = width > height;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Responsive Design Demo</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Screen Dimensions</Text>
        <Text style={styles.infoText}>Width: {width.toFixed(2)}px</Text>
        <Text style={styles.infoText}>Height: {height.toFixed(2)}px</Text>
        <Text style={styles.infoText}>Aspect Ratio: {aspectRatio.toFixed(2)}</Text>
        <Text style={styles.infoText}>Orientation: {isLandscape ? 'Landscape' : 'Portrait'}</Text>
      </View>

      <View style={styles.scalingDemo}>
        <Text style={styles.sectionTitle}>Scaling Examples</Text>
        
        <View style={styles.scaleRow}>
          <View style={[styles.scaleBox, { width: scale(50), height: scale(50) }]}>
            <Text style={styles.scaleText}>Scale</Text>
          </View>
          <View style={[styles.scaleBox, { width: verticalScale(50), height: verticalScale(50) }]}>
            <Text style={styles.scaleText}>V-Scale</Text>
          </View>
          <View style={[styles.scaleBox, { width: moderateScale(50), height: moderateScale(50) }]}>
            <Text style={styles.scaleText}>M-Scale</Text>
          </View>
        </View>
      </View>

      <View style={styles.spacingDemo}>
        <Text style={styles.sectionTitle}>Spacing System</Text>
        <View style={styles.spacingRow}>
          <View style={[styles.spacingBox, { width: SPACING.xs, height: SPACING.xs }]} />
          <Text style={styles.spacingLabel}>XS</Text>
        </View>
        <View style={styles.spacingRow}>
          <View style={[styles.spacingBox, { width: SPACING.sm, height: SPACING.sm }]} />
          <Text style={styles.spacingLabel}>SM</Text>
        </View>
        <View style={styles.spacingRow}>
          <View style={[styles.spacingBox, { width: SPACING.md, height: SPACING.md }]} />
          <Text style={styles.spacingLabel}>MD</Text>
        </View>
        <View style={styles.spacingRow}>
          <View style={[styles.spacingBox, { width: SPACING.lg, height: SPACING.lg }]} />
          <Text style={styles.spacingLabel}>LG</Text>
        </View>
        <View style={styles.spacingRow}>
          <View style={[styles.spacingBox, { width: SPACING.xl, height: SPACING.xl }]} />
          <Text style={styles.spacingLabel}>XL</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: moderateScale(SPACING.md),
  },
  title: {
    ...TYPOGRAPHY.title,
    textAlign: 'center',
    marginBottom: moderateScale(SPACING.lg),
    color: COLORS.textPrimary,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    padding: moderateScale(SPACING.md),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(SPACING.md),
  },
  infoTitle: {
    ...TYPOGRAPHY.subtitle,
    marginBottom: moderateScale(SPACING.sm),
    color: COLORS.textPrimary,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    marginBottom: moderateScale(SPACING.xs),
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle,
    marginBottom: moderateScale(SPACING.md),
    color: COLORS.textPrimary,
  },
  scalingDemo: {
    marginBottom: moderateScale(SPACING.lg),
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scaleBox: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(4),
  },
  scaleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryBackground,
    fontWeight: '600',
  },
  spacingDemo: {
    marginBottom: moderateScale(SPACING.lg),
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(SPACING.sm),
  },
  spacingBox: {
    backgroundColor: COLORS.primary,
    marginRight: moderateScale(SPACING.sm),
  },
  spacingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});

export default ResponsiveDemo;