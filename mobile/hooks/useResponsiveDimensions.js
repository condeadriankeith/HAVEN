import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

/**
 * Get window dimensions with fallback values
 * @returns {Object} Dimensions object with width, height, and aspectRatio
 */
const getWindowDimensions = () => {
  try {
    const dims = Dimensions.get('window');
    return {
      width: dims?.width || 375,
      height: dims?.height || 667,
      aspectRatio: (dims?.width || 375) / (dims?.height || 667),
    };
  } catch (error) {
    console.warn('Error getting window dimensions, using fallback values:', error);
    return {
      width: 375,
      height: 667,
      aspectRatio: 375 / 667,
    };
  }
};

/**
 * Hook to get responsive dimensions that update on screen rotation
 * @returns {Object} Current dimensions { width, height, aspectRatio }
 */
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    const onChange = () => setDimensions(getWindowDimensions());
    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      } else {
        // Fallback for older React Native versions
        Dimensions.removeEventListener('change', onChange);
      }
    };
  }, []);

  return dimensions;
};