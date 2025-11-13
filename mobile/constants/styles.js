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
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  secondary: {
    fontSize: 13,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
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