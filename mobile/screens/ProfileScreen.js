import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';

const ProfileScreen = () => {
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    petName: 'Buddy',
    petBreed: 'Golden Retriever',
    petAge: '3 years'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to the API
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.medium,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.large,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.large * 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.medium,
  },
  avatarText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.large,
  },
  formGroup: {
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 4,
    paddingHorizontal: SPACING.small,
    fontSize: TYPOGRAPHY.body.fontSize,
  },
  value: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.small,
  },
  sectionHeader: {
    marginTop: SPACING.large,
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  actions: {
    marginTop: SPACING.large,
  },
  editButton: {
    backgroundColor: COLORS.secondaryBackground,
    paddingVertical: SPACING.medium,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  editButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  saveButton: {
    backgroundColor: COLORS.accentRed,
    paddingVertical: SPACING.medium,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  saveButtonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.medium,
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.accentRed,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
});

export default ProfileScreen;