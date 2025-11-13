import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation, onLogin }) => {
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
      
      if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'Network Error: Cannot connect to the server. Please check that:\n\n1. Your device is on the same Wi-Fi network as your computer\n2. The server is running on your computer\n3. Windows Firewall is not blocking the connection\n4. The IP address in api.js is correct';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
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
    // For now, we'll just show an alert
    // In a full implementation, you would create a RegisterScreen component
    Alert.alert('Register', 'Registration would be implemented here');
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
    backgroundColor: COLORS.secondaryBackground,
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
  defaultLoginButton: {
    backgroundColor: COLORS.primaryBackground,
    borderColor: COLORS.accentRed,
    borderWidth: 1,
    paddingVertical: SPACING.medium,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  defaultLoginButtonText: {
    color: COLORS.accentRed,
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