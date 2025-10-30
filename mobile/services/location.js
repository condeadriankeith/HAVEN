import * as Location from 'expo-location';

// Location service for getting user's current position

export const getCurrentLocation = async () => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    throw new Error(`Failed to get location: ${error.message}`);
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (geocode.length > 0) {
      const address = geocode[0];
      return `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
    }
    return `Approximate location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    return `Approximate location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

export default {
  getCurrentLocation,
  reverseGeocode,
};