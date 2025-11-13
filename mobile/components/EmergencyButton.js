import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { scale, moderateScale } from '../utils/responsive';

const EmergencyButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.buttonText}>EMERGENCY</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    // Fixed deprecated shadow* props
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accentRed,
        shadowOffset: {
          width: 0,
          height: moderateScale(4),
        },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(8),
      },
      android: {
        elevation: moderateScale(8),
      },
      web: {
        boxShadow: `0 ${moderateScale(4)}px ${moderateScale(8)}px ${COLORS.accentRed}4D`,
      }
    }),
  },
  buttonText: {
    color: COLORS.primaryBackground,
    fontSize: moderateScale(TYPOGRAPHY.title.fontSize),
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default EmergencyButton;