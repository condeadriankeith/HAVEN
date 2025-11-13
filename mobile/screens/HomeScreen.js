import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import * as Location from 'expo-location';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDERS } from '../constants/styles';
import EmergencyButton from '../components/EmergencyButton';
import { emergenciesAPI, websocketService } from '../services/api';
import { reverseGeocode, getCurrentLocation } from '../services/location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log, warn, error } from '../services/logging';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const HomeScreen = ({ navigation }) => {
  const { width, height, aspectRatio } = useResponsiveDimensions();
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [isReporting, setIsReporting] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  useEffect(() => {
    // Check and request location permissions on component mount
    checkLocationPermissions();
    
    // Listen for emergency updates from WebSocket using the new subscribe API
    const unsubscribe = websocketService.subscribe((data) => {
      if (data.type === 'emergency_update' || data.type === 'new-emergency-alert') {
        const emergency = data.emergency || data;
        Alert.alert(
          'Emergency Update',
          `Emergency ${emergency.emergencyId || emergency.id} status updated to: ${emergency.status}`,
          [{ text: 'OK' }]
        );
        
        // Update local state with new emergency data
        setActiveEmergencies(prev => {
          const existingIndex = prev.findIndex(e => (e.emergencyId || e.id) === (emergency.emergencyId || emergency.id));
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = emergency;
            return updated;
          } else {
            return [...prev, emergency];
          }
        });
      }
    });

    // Cleanup listener on component unmount
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const checkLocationPermissions = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      
      if (status !== 'granted') {
        // Request permission if not granted
        await requestLocationPermission();
      }
    } catch (err) {
      error('Error checking location permissions:', { error: err.message });
    }
  };

  const requestLocationPermission = async () => {
    try {
      // Handle location permissions based on platform
      if (Platform.OS === 'web') {
        // For web, we'll use the browser's geolocation API
        return new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  }
                });
              },
              (error) => {
                reject(error);
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
          } else {
            reject(new Error('Geolocation is not supported by this browser'));
          }
        });
      } else {
        // For mobile platforms, use expo-location with highest accuracy
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
        
        if (status !== 'granted') {
          throw new Error('Permission to access location was denied');
        }
        
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy for emergency
          timeout: 15000, // 15 seconds timeout
          maximumAge: 60000 // 1 minute maximum age
        });
        return position;
      }
    } catch (error) {
      warn('Failed to get location permission:', { error: error.message });
      throw error;
    }
  };

  const handleEmergencyAlert = async () => {
    // Check if we have location permission before proceeding
    if (!hasLocationPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to send emergency alerts. Please enable location access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.openSettings() }
          ]
        );
        return;
      }
    }
    
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Alert', 
          style: 'destructive',
          onPress: sendEmergencyAlert
        }
      ]
    );
  };

  const sendEmergencyAlert = async () => {
    try {
      setIsReporting(true);
      
      // Log that we're starting the emergency alert process
      const logMessage = 'Starting emergency alert process...';
      log(logMessage);
      
      // Get current device location with highest accuracy
      let location;
      try {
        const position = await getCurrentLocation(); // Use our enhanced location service
        location = position;
        const locationLog = `Location obtained with high accuracy: ${JSON.stringify(location)}`;
        log(locationLog);
      } catch (error) {
        const errorLog = `Failed to get location, using default Bacolod coordinates: ${error.message}`;
        warn(errorLog);
        // Fallback to Bacolod City coordinates with randomization
        location = {
          latitude: 10.6765 + (Math.random() - 0.5) * 0.1,
          longitude: 122.9509 + (Math.random() - 0.5) * 0.1
        };
        const fallbackLog = `Using fallback location: ${JSON.stringify(location)}`;
        log(fallbackLog);
      }
    
      // Retrieve user data from local storage/session
      const token = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userPhone = await AsyncStorage.getItem('userPhone');
      const userEmail = await AsyncStorage.getItem('userEmail');
    
      const userDataLog = `User data retrieved: ${JSON.stringify({ userId, userName, userPhone, userEmail })}`;
      log(userDataLog);
    
      // Get address from coordinates
      const address = await reverseGeocode(location.latitude, location.longitude);
      const addressLog = `Address obtained: ${address}`;
      log(addressLog);
    
      // Build emergency report payload with precise location data
      const emergencyData = {
        userId: userId,
        contactInfo: {
          name: userName,
          phone: userPhone,
          email: userEmail
        },
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          heading: location.heading,
          speed: location.speed,
          address: address
        },
        emergencyType: "Pet Health Emergency",
        timestamp: new Date().toISOString(),
        additionalDetails: ""
      };
    
      // Log the emergency data being sent for debugging
      const emergencyLog = `Sending emergency alert with coords: ${location.latitude}, ${location.longitude}`;
      log(emergencyLog);
      console.log('Emergency data being sent:', JSON.stringify(emergencyData, null, 2));

      // Send emergency alert via REST API for persistence and broadcasting
      const response = await emergenciesAPI.createEmergencyReport(emergencyData);
      
      if (response.success) {
        const successLog = `Emergency alert sent successfully with ID: ${response.data.emergencyId}`;
        log(successLog);
        Alert.alert(
          'Emergency Alert Sent',
          'Your emergency alert has been sent to all responders. Help is on the way!',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(response.message || 'Failed to send emergency alert');
      }
    } catch (error) {
      error('Error sending emergency alert:', { error: error.message });
      Alert.alert(
        'Error',
        `Failed to send emergency alert: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HAVEN Emergency Response</Text>
        <Text style={styles.subtitle}>Pet Emergency Alert System</Text>
      </View>
      
      <View style={styles.content}>
        <EmergencyButton 
          onPress={handleEmergencyAlert} 
          disabled={isReporting}
        />
        
        {isReporting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Sending emergency alert...</Text>
          </View>
        )}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <Text style={styles.infoText}>
              Press the emergency button when your pet needs immediate help
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <Text style={styles.infoText}>
              Your precise location is captured automatically
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>3</Text>
            </View>
            <Text style={styles.infoText}>
              All nearby responders are instantly notified
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>4</Text>
            </View>
            <Text style={styles.infoText}>
              Help arrives as quickly as possible
            </Text>
          </View>
        </View>
        
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Key Features</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>Real-time location sharing</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureText}>Instant notifications</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏥</Text>
            <Text style={styles.featureText}>24/7 emergency support</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    padding: moderateScale(SPACING.xl),
    backgroundColor: COLORS.secondaryBackground,
    alignItems: 'center',
    borderBottomWidth: BORDERS.width,
    borderBottomColor: BORDERS.color,
  },
  title: {
    fontSize: moderateScale(TYPOGRAPHY.title.fontSize),
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
    marginTop: moderateScale(SPACING.md),
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: moderateScale(SPACING.lg),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(SPACING.lg),
    padding: moderateScale(SPACING.lg),
    backgroundColor: COLORS.cardBackground,
    borderRadius: moderateScale(BORDERS.radius),
    ...SHADOWS.small,
  },
  loadingText: {
    marginLeft: moderateScale(SPACING.md),
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textPrimary,
  },
  infoSection: {
    marginTop: moderateScale(SPACING.xl),
    padding: moderateScale(SPACING.lg),
    backgroundColor: COLORS.cardBackground,
    borderRadius: moderateScale(BORDERS.radius),
    ...SHADOWS.small,
  },
  infoTitle: {
    fontSize: moderateScale(TYPOGRAPHY.subtitle.fontSize),
    fontWeight: TYPOGRAPHY.subtitle.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: moderateScale(SPACING.lg),
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateScale(SPACING.md),
  },
  infoNumber: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: COLORS.accentRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(SPACING.md),
    marginTop: scale(2),
  },
  infoNumberText: {
    color: COLORS.primaryBackground,
    fontSize: moderateScale(TYPOGRAPHY.secondary.fontSize),
    fontWeight: '600',
  },
  infoText: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
    flex: 1,
  },
  featuresSection: {
    marginTop: moderateScale(SPACING.xl),
    padding: moderateScale(SPACING.lg),
    backgroundColor: COLORS.cardBackground,
    borderRadius: moderateScale(BORDERS.radius),
    ...SHADOWS.small,
  },
  featuresTitle: {
    fontSize: moderateScale(TYPOGRAPHY.subtitle.fontSize),
    fontWeight: TYPOGRAPHY.subtitle.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: moderateScale(SPACING.lg),
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(SPACING.md),
  },
  featureIcon: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(SPACING.md),
  },
  featureText: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;