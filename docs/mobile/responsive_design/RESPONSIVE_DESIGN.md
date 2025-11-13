# HAVEN Mobile App - Responsive Design Implementation

This document outlines the responsive design system implemented for the HAVEN mobile application to ensure consistent UI across different device sizes and orientations.

## 1. Responsive Utilities

### Location
`/mobile/utils/responsive.js`

### Functions
- `scale(size)`: Scales size based on screen width
- `verticalScale(size)`: Scales size based on screen height
- `moderateScale(size, factor)`: Scales size with moderation factor (0-1)
- `screen`: Object containing current screen dimensions and aspect ratio

### Usage Example
```javascript
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const styles = StyleSheet.create({
  button: {
    width: scale(150),
    height: verticalScale(45),
    borderRadius: moderateScale(10),
  },
  text: {
    fontSize: moderateScale(16),
  },
});
```

## 2. Responsive Dimensions Hook

### Location
`/mobile/hooks/useResponsiveDimensions.js`

### Features
- Automatically updates on screen rotation
- Provides safe fallback values
- Returns width, height, and aspect ratio

### Usage Example
```javascript
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';

const MyScreen = () => {
  const { width, height, aspectRatio } = useResponsiveDimensions();
  const isLandscape = width > height;
  
  return (
    <View style={isLandscape ? styles.landscape : styles.portrait}>
      {/* Content */}
    </View>
  );
};
```

## 3. Design System Constants

### Location
`/mobile/constants/styles.js`

### Updated Constants
- **SPACING**: Extended with xs, sm, md, lg, xl, xxl values
- **TYPOGRAPHY**: Enhanced with caption and overline styles
- **COLORS**: Existing color palette from PRD

## 4. Safe Area Wrapper

### Location
`/mobile/components/SafeAreaWrapper.js`

### Features
- Handles safe areas for notches and system bars
- Consistent background color
- Reusable across all screens

### Usage Example
```javascript
import SafeAreaWrapper from './components/SafeAreaWrapper';

const App = () => {
  return (
    <SafeAreaWrapper>
      <NavigationContainer>
        {/* App content */}
      </NavigationContainer>
    </SafeAreaWrapper>
  );
};
```

## 5. Implementation Guidelines

### Orientation Support
- App.json configured with `"orientation": "default"`
- Components adapt to both portrait and landscape modes
- Use aspect ratio to determine layout adjustments

### Responsive Styling
1. Replace hardcoded sizes with scaling functions
2. Use SPACING constants for margins and padding
3. Apply TYPOGRAPHY styles consistently
4. Test on multiple device sizes

### Best Practices
- Use flexbox for layout instead of fixed dimensions
- Prefer percentage-based widths when appropriate
- Ensure touch targets are at least 44x44 points
- Test on various screen sizes and densities

## 6. Testing Responsiveness

### Recommended Devices for Testing
- Small phones (e.g., iPhone SE)
- Large phones (e.g., iPhone 15 Pro Max)
- Tablets (e.g., iPad)
- Android devices with different DPIs

### Testing Scenarios
- Portrait and landscape orientations
- Dynamic screen rotation
- Various text sizes (accessibility)
- Split-screen mode (tablets)

## 7. Example Implementation

Refer to the following updated screens for implementation examples:
- `MapScreen.js`: Full responsive implementation with scaling
- `HomeScreen.js`: Partial responsive implementation
- `ResponsiveDemo.js`: Complete demonstration component

## 8. Future Considerations

- Implement responsive images with different resolutions
- Add dark mode support with responsive color schemes
- Extend responsive utilities to tablet-specific layouts
- Add responsive animation timing