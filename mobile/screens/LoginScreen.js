import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { authAPI, storeToken } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // Store the auth token
        await storeToken(response.data.token);
        
        // Reset the navigation stack and navigate to main tabs
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        
        Alert.alert('Success', 'Logged in successfully');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // For now, we'll just show an alert
    // In a full implementation, you would create a RegisterScreen component
    Alert.alert('Register', 'Registration would be implemented here');
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
    padding: SPACING.medium,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.large * 2,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.accentRed,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
    borderRadius: 4,
    paddingHorizontal: SPACING.small,
    fontSize: TYPOGRAPHY.body.fontSize,
  },
  loginButton: {
    backgroundColor: COLORS.accentRed,
    paddingVertical: SPACING.medium,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: SPACING.large,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.accentGray,
  },
  loginButtonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.large * 2,
  },
  footerText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  registerLink: {
    color: COLORS.accentRed,
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    marginTop: SPACING.small,
  },
});

export default LoginScreen;