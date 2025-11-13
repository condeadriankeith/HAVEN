import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { authAPI } from '../services/api';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const LoginScreen = ({ navigation, onLogin }) => {
  const { width, height, aspectRatio } = useResponsiveDimensions();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.status === 200) {
        // Notify the app that login was successful
        if (onLogin) {
          onLogin();
        }
        
        Alert.alert('Success', 'Logged in successfully');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      // Use the more specific error message if available
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Navigate to registration screen
    navigation.navigate('Register');
  };

  // Function to login with default credentials
  const handleDefaultLogin = async () => {
    setEmail('admin@example.com');
    setPassword('admin123');
    // Automatically trigger login after setting default credentials
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HAVEN</Text>
        <Text style={styles.subtitle}>Pet Emergency Response System</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
        
        {/* Default login button for testing */}
        <TouchableOpacity 
          style={[styles.defaultLoginButton]} 
          onPress={handleDefaultLogin}
        >
          <Text style={styles.defaultLoginButtonText}>
            Use Default Credentials
          </Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: moderateScale(SPACING.lg * 2),
  },
  title: {
    fontSize: moderateScale(36),
    fontWeight: '700',
    color: COLORS.accentRed,
    marginBottom: moderateScale(SPACING.sm),
  },
  subtitle: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: moderateScale(SPACING.md),
  },
  label: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textPrimary,
    marginBottom: moderateScale(SPACING.sm),
  },
  input: {
    height: verticalScale(50),
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: moderateScale(4),
    paddingHorizontal: moderateScale(SPACING.sm),
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
  },
  loginButton: {
    backgroundColor: COLORS.accentRed,
    paddingVertical: moderateScale(SPACING.md),
    borderRadius: moderateScale(4),
    alignItems: 'center',
    marginTop: moderateScale(SPACING.lg),
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.accentGray,
  },
  loginButtonText: {
    color: COLORS.primaryBackground,
    fontSize: moderateScale(TYPOGRAPHY.button.fontSize),
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  defaultLoginButton: {
    backgroundColor: COLORS.primaryBackground,
    borderColor: COLORS.accentRed,
    borderWidth: moderateScale(1),
    paddingVertical: moderateScale(SPACING.md),
    borderRadius: moderateScale(4),
    alignItems: 'center',
    marginTop: moderateScale(SPACING.sm),
  },
  defaultLoginButtonText: {
    color: COLORS.accentRed,
    fontSize: moderateScale(TYPOGRAPHY.button.fontSize),
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  footer: {
    alignItems: 'center',
    marginTop: moderateScale(SPACING.lg * 2),
  },
  footerText: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
  },
  registerLink: {
    color: COLORS.accentRed,
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    fontWeight: '600',
    marginTop: moderateScale(SPACING.sm),
  },
});

export default LoginScreen;