// Color Palette from PRD
export const COLORS = {
  primaryBackground: '#FFFFFF',
  secondaryBackground: '#F9F9F9',
  cardBackground: '#FFFFFF',
  accentRed: '#D32F2F',
  accentGray: '#B0B0B0',
  textPrimary: '#1C1C1C',
  textSecondary: '#5A5A5A',
  success: '#4CAF50',
  primary: '#D32F2F',
};

// Typography from PRD
export const TYPOGRAPHY = {
  fontFamily: 'Inter',
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  secondary: {
    fontSize: 13,
    fontWeight: 'normal',
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};

// Spacing
export const SPACING = {
  small: 8,
  medium: 16,
  large: 24,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
};

// Borders
export const BORDERS = {
  width: 1,
  color: '#E0E0E0',
  radius: 8,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDERS,
};