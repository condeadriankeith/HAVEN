import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login with default admin account
  const loginAsAdmin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      setUser(response.data);
      Alert.alert('Success', 'Logged in as admin');
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send emergency alert
  const sendEmergencyAlert = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/emergencies/alert`, {
        type: 'injury',
        severity: 'critical',
        description: 'Pet emergency - immediate assistance required',
        location: {
          latitude: 14.5995,
          longitude: 120.9842,
          address: 'Manila, Philippines'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      Alert.alert('Success', 'Emergency alert sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
      console.error('Emergency alert error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HAVEN Pet Emergency Response</Text>
      
      {user ? (
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>Welcome, {user.firstName} {user.lastName}!</Text>
          <Text style={styles.roleText}>Role: {user.role}</Text>
          
          <TouchableOpacity 
            style={styles.emergencyButton} 
            onPress={sendEmergencyAlert}
            disabled={loading}
          >
            <Text style={styles.emergencyButtonText}>
              {loading ? 'Sending...' : 'EMERGENCY'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.instructionText}>
            Press the red button to send an emergency alert
          </Text>
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.subtitle}>Mobile Application</Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={loginAsAdmin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <Text style={styles.footerText}>
        HAVEN - Pet Emergency Response System
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  loginContainer: {
    alignItems: 'center',
  },
  userContainer: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
  },
  roleText: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#2D9CDB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
    color: '#999',
  },
});