import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    petName: '',
    petBreed: '',
    petAge: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      
      if (response.data) {
        // Parse pet information if it exists
        let petName = '';
        let petBreed = '';
        let petAge = '';
        
        if (response.data.pets && response.data.pets.length > 0) {
          const pet = response.data.pets[0]; // Take the first pet for simplicity
          petName = pet.name || '';
          petBreed = pet.breed || '';
          petAge = pet.age || '';
        }
        
        setUserData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          petName: petName,
          petBreed: petBreed,
          petAge: petAge
        });
        
        // Store user data in AsyncStorage for quick access
        await AsyncStorage.setItem('userName', `${response.data.firstName} ${response.data.lastName}`);
        await AsyncStorage.setItem('userPhone', response.data.phone || '');
        await AsyncStorage.setItem('userEmail', response.data.email || '');
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      // Load from AsyncStorage as fallback
      loadFromStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromStorage = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName') || '';
      const lastName = await AsyncStorage.getItem('lastName') || '';
      const email = await AsyncStorage.getItem('userEmail') || '';
      const phone = await AsyncStorage.getItem('userPhone') || '';
      
      setUserData(prev => ({
        ...prev,
        firstName,
        lastName,
        email,
        phone
      }));
    } catch (err) {
      console.error('Error loading from storage:', err);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare pet data
      const pets = [];
      if (userData.petName || userData.petBreed || userData.petAge) {
        pets.push({
          name: userData.petName,
          breed: userData.petBreed,
          age: userData.petAge,
          type: 'Pet' // Default type
        });
      }
      
      // Update profile with pet information
      const profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        pets: pets
      };
      
      // In a real app, this would save to the API
      // For now, we'll just save to AsyncStorage
      await AsyncStorage.setItem('firstName', userData.firstName);
      await AsyncStorage.setItem('lastName', userData.lastName);
      await AsyncStorage.setItem('userEmail', userData.email);
      await AsyncStorage.setItem('userPhone', userData.phone);
      
      // Save pet information
      await AsyncStorage.setItem('userPets', JSON.stringify(pets));
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to save profile data');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // In a real app, this would clear auth tokens and redirect to login
          Alert.alert('Logged Out', 'You have been successfully logged out');
        }}
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentRed} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
          </Text>
        </View>
        <Text style={styles.profileName}>{userData.firstName} {userData.lastName}</Text>
        <Text style={styles.profileEmail}>{userData.email}</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.firstName}
              onChangeText={(text) => setUserData({...userData, firstName: text})}
            />
          ) : (
            <Text style={styles.value}>{userData.firstName}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.lastName}
              onChangeText={(text) => setUserData({...userData, lastName: text})}
            />
          ) : (
            <Text style={styles.value}>{userData.lastName}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({...userData, email: text})}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.value}>{userData.email}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData({...userData, phone: text})}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{userData.phone}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.address}
              onChangeText={(text) => setUserData({...userData, address: text})}
            />
          ) : (
            <Text style={styles.value}>{userData.address}</Text>
          )}
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pet Information</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pet Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.petName}
              onChangeText={(text) => setUserData({...userData, petName: text})}
            />
          ) : (
            <Text style={styles.value}>{userData.petName}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Breed</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.petBreed}
              onChangeText={(text) => setUserData({...userData, petBreed: text})}
            />
          ) : (
            <Text style={styles.value}>{userData.petBreed}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Age</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.petAge}
              onChangeText={(text) => setUserData({...userData, petAge: text})}
            />
          ) : (
            <Text style={styles.value}>{userData.petAge}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.accentRed,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  profileName: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.xl,
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
  input: {
    height: 50,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  value: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
  },
  sectionHeader: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.subtitle.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  actions: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  editButton: {
    backgroundColor: COLORS.secondaryBackground,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  editButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  saveButton: {
    backgroundColor: COLORS.accentRed,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accentRed,
  },
  logoutButtonText: {
    color: COLORS.accentRed,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
});

export default ProfileScreen;