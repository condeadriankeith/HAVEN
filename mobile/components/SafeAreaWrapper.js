import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { COLORS } from '../constants/styles';

/**
 * SafeAreaWrapper component that handles safe areas for all screens
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.style - Additional styles to apply
 * @returns {JSX.Element} SafeAreaView wrapper component
 */
const SafeAreaWrapper = ({ children, style, ...props }) => {
  return (
    <SafeAreaView style={[styles.container, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
});

export default SafeAreaWrapper;