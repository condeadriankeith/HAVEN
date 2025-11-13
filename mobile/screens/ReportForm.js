import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Picker, Alert, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { emergenciesAPI } from '../services/api';
import { getCurrentLocation, reverseGeocode } from '../services/location';

const ReportFormScreen = () => {
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const emergencyTypes = [
    { label: 'Select emergency type', value: '' },
    { label: 'Injured Pet', value: 'Injured Pet' },
    { label: 'Stray in Danger', value: 'Stray in Danger' },
    { label: 'Fire', value: 'Fire' },
    { label: 'Natural Disaster', value: 'Natural Disaster' },
    { label: 'Lost Pet', value: 'Lost Pet' },
    { label: 'Other', value: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!emergencyType || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Get current location
      const location = await getCurrentLocation();
      
      // Get address from coordinates
      const address = await reverseGeocode(location.latitude, location.longitude);
      
      // Prepare data for submission
      const reportData = {
        type: emergencyType,
        description,
        contactNumber: contactNumber || undefined,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address
        }
      };

      // Submit to API
      const response = await emergenciesAPI.createAlert(reportData);
      
      if (response.status === 201) {
        Alert.alert(
          'Success', 
          'Emergency report submitted successfully. A responder is on the way.',
          [{ text: 'OK' }]
        );
        
        // Reset form
        setEmergencyType('');
        setDescription('');
        setContactNumber('');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', `Failed to submit emergency report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report Incident</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Emergency Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={emergencyType}
            style={styles.picker}
            onValueChange={(itemValue) => setEmergencyType(itemValue)}
          >
            {emergencyTypes.map((type, index) => (
              <Picker.Item key={index} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Describe the emergency situation..."
          value={description}
          onChangeText={setDescription}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Number (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Your phone number"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  textArea: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body.fontSize,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  submitButton: {
    backgroundColor: COLORS.accentRed,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.accentGray,
  },
  submitButtonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
});

export default ReportFormScreen;