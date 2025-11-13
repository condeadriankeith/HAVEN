import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';

const EmergencyButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.buttonText}>EMERGENCY</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    // Fixed deprecated shadow* props
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accentRed,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 4px 8px ${COLORS.accentRed}4D`,
      }
    }),
  },
  buttonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default EmergencyButton;