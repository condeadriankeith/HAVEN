/**
 * Test script for user registration flow
 * This script can be used to verify the registration functionality
 */

import { authAPI } from './services/api';

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'testpassword123'
};

// Function to test registration
export const testRegistration = async () => {
  try {
    console.log('Testing user registration flow...');
    
    // Attempt to register a new user
    const response = await authAPI.register(testUser);
    
    if (response.status === 201) {
      console.log('✓ Registration successful');
      console.log('Response:', response.data);
      return true;
    } else {
      console.log('✗ Registration failed with status:', response.status);
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('✗ Registration error:', error.message);
    return false;
  }
};

// Function to test login after registration
export const testLogin = async () => {
  try {
    console.log('Testing user login flow...');
    
    // Attempt to login with the test user
    const response = await authAPI.login({
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.status === 200) {
      console.log('✓ Login successful');
      console.log('Response:', response.data);
      return true;
    } else {
      console.log('✗ Login failed with status:', response.status);
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('✗ Login error:', error.message);
    return false;
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      // Test registration
      const registrationSuccess = await testRegistration();
      
      if (registrationSuccess) {
        // Test login
        await testLogin();
      }
    } catch (error) {
      console.error('Test execution error:', error);
    }
  })();
}

export default { testRegistration, testLogin };