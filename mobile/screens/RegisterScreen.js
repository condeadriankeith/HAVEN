import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { authAPI } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pets, setPets] = useState([{ id: Date.now(), type: '', breed: '', name: '' }]);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Validate pet information
    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i];
      if ((pet.type || pet.breed || pet.name) && (!pet.type || !pet.breed || !pet.name)) {
        Alert.alert('Error', `Please fill in all fields for pet #${i + 1} or leave all fields empty`);
        return;
      }
    }

    setLoading(true);

    try {
      // Filter out empty pet entries
      const validPets = pets.filter(pet => pet.type && pet.breed && pet.name);

      const userData = {
        firstName,
        lastName,
        email,
        phone,
        password,
        pets: validPets
      };

      const response = await authAPI.register(userData);

      if (response.status === 201) {
        Alert.alert(
          'Success',
          'Account created successfully. You can now log in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        throw new Error(response.data?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      // Use the more specific error message if available
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addPet = () => {
    setPets([...pets, { id: Date.now(), type: '', breed: '', name: '' }]);
  };

  const removePet = (id) => {
    if (pets.length > 1) {
      setPets(pets.filter(pet => pet.id !== id));
    }
  };

  const updatePet = (id, field, value) => {
    setPets(pets.map(pet => 
      pet.id === id ? { ...pet, [field]: value } : pet
    ));
  };

  const renderPetForm = ({ item, index }) => (
    <View style={styles.petContainer}>
      <View style={styles.petHeader}>
        <Text style={styles.petTitle}>Pet #{index + 1}</Text>
        {pets.length > 1 && (
          <TouchableOpacity onPress={() => removePet(item.id)}>
            <Text style={styles.removePetButton}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pet Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., dog, cat, rabbit"
          value={item.type}
          onChangeText={(text) => updatePet(item.id, 'type', text)}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Golden Retriever, Siamese"
          value={item.breed}
          onChangeText={(text) => updatePet(item.id, 'breed', text)}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Pet's name"
          value={item.name}
          onChangeText={(text) => updatePet(item.id, 'name', text)}
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join HAVEN Emergency Response</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.formRow}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
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
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pet Information</Text>
          <Text style={styles.sectionSubtitle}>Add information about your pets</Text>
        </View>
        
        <FlatList
          data={pets}
          renderItem={renderPetForm}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
        
        <TouchableOpacity style={styles.addPetButton} onPress={addPet}>
          <Text style={styles.addPetButtonText}>+ Add Another Pet</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.secondaryBackground,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accentRed,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  form: {
    padding: SPACING.lg,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  halfWidth: {
    width: '48%',
  },
  formGroup: {
    marginBottom: SPACING.md,
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
  sectionHeader: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  petContainer: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  petTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  removePetButton: {
    color: COLORS.accentRed,
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '600',
  },
  addPetButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addPetButtonText: {
    color: COLORS.accentRed,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: COLORS.accentRed,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.accentGray,
  },
  registerButtonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  loginLink: {
    color: COLORS.accentRed,
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
});

export default RegisterScreen;