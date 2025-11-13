import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Location service for getting user's current position with highest accuracy

export const getCurrentLocation = async () => {
  try {
    // Handle location permissions based on platform
    if (Platform.OS === 'web') {
      // For web, we'll use the browser's geolocation API
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
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
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      // Get current position with highest accuracy for emergency reporting
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy for emergency
        timeout: 15000, // 15 seconds timeout
        maximumAge: 60000 // 1 minute maximum age
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };
    }
  } catch (error) {
    // Fallback to last known location if current location fails
    try {
      if (Platform.OS !== 'web') {
        const lastLocation = await Location.getLastKnownPositionAsync({
          maxAge: 60000, // 1 minute
          requiredAccuracy: 100 // 100 meters
        });
        if (lastLocation) {
          return {
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude,
            accuracy: lastLocation.coords.accuracy,
            altitude: lastLocation.coords.altitude,
            heading: lastLocation.coords.heading,
            speed: lastLocation.coords.speed,
          };
        }
      }
    } catch (fallbackError) {
      console.log('Fallback to last known location failed:', fallbackError);
    }
    
    throw new Error(`Failed to get location: ${error.message}`);
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    if (Platform.OS === 'web') {
      // For web, we'll use a simple format since reverse geocoding might not be available
      return `Approximate location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } else {
      // For mobile platforms, use expo-location reverse geocoding
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const address = geocode[0];
        return `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
      }
      return `Approximate location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  } catch (error) {
    return `Approximate location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

export default {
  getCurrentLocation,
  reverseGeocode,
};