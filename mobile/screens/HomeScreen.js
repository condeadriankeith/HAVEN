import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import EmergencyButton from '../components/EmergencyButton';
import { emergenciesAPI, websocketService } from '../services/api';
import { getCurrentLocation, reverseGeocode } from '../services/location';

const HomeScreen = ({ navigation }) => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);

  useEffect(() => {
    // Listen for emergency updates from WebSocket
    const handleEmergencyUpdate = (emergency) => {
      Alert.alert(
        'Emergency Update',
        `Emergency ${emergency.id} status updated to: ${emergency.status}`,
        [{ text: 'OK' }]
      );
      
      // Update local state with new emergency data
      setActiveEmergencies(prev => {
        const existingIndex = prev.findIndex(e => e.id === emergency.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = emergency;
          return updated;
        } else {
          return [...prev, emergency];
        }
      });
    };

    // Add event listener
    websocketService.on('emergency_update', handleEmergencyUpdate);

    // Cleanup listener on component unmount
    return () => {
      websocketService.off('emergency_update', handleEmergencyUpdate);
    };
  }, []);

  const handleEmergencyAlert = async () => {
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
      // Get current location
      const location = await getCurrentLocation();
      
      // Get address from coordinates
      const address = await reverseGeocode(location.latitude, location.longitude);
      
      // Prepare emergency data
      const emergencyData = {
        type: 'Emergency Alert',
        description: 'User requested immediate assistance',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address
        }
      };

      // Send to server
      const response = await emergenciesAPI.createAlert(emergencyData);
      
      if (response.status === 201) {
        Alert.alert(
          'Alert Sent', 
          `Emergency alert sent successfully. A responder is on the way.\nEstimated response time: ${response.data.estimatedResponseTime}`,
          [{ text: 'OK' }]
        );
        
        // Optionally navigate to the map screen to track the emergency
        // navigation.navigate('Map');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert('Error', `Failed to send emergency alert: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HAVEN</Text>
        <Text style={styles.subtitle}>Pet Emergency Response System</Text>
      </View>
      
      <View style={styles.content}>
        <EmergencyButton onPress={handleEmergencyAlert} />
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => navigation.navigate('ReportForm')}
        >
          <Text style={styles.reportButtonText}>Report Incident</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Help is on the way</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.medium,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.large,
    marginBottom: SPACING.large * 2,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButton: {
    marginTop: SPACING.large * 2,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  reportButtonText: {
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
    color: COLORS.textPrimary,
  },
  footer: {
    alignItems: 'center',
    padding: SPACING.medium,
  },
  footerText: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;