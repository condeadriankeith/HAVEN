import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 667;

/**
 * Scale size based on screen width
 * @param {number} size - Size to scale
 * @returns {number} Scaled size
 */
export const scale = size => (width / guidelineBaseWidth) * size;

/**
 * Scale size based on screen height
 * @param {number} size - Size to scale vertically
 * @returns {number} Vertically scaled size
 */
export const verticalScale = size => (height / guidelineBaseHeight) * size;

/**
 * Scale size with a moderation factor for subtle scaling
 * @param {number} size - Size to scale
 * @param {number} factor - Moderation factor (0-1, default 0.5)
 * @returns {number} Moderately scaled size
 */
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * Screen dimensions object
 */
export const screen = {
  width,
  height,
  aspectRatio: width / height,
};