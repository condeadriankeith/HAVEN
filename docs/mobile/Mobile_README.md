# HAVEN Mobile App

A React Native (Expo) mobile application for the HAVEN emergency response system.

## Features

- Emergency alert system with large SOS button
- Interactive live map showing emergency alerts
- User profile management with edit capabilities
- App settings configuration
- Menu navigation system

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Install Expo CLI (if not already installed):
   ```
   npm install -g expo-cli
   ```

3. Start the development server:
   ```
   npm start
   ```

## Running the App

- **iOS Simulator**: Press `i` in the terminal after starting the dev server
- **Android Emulator**: Press `a` in the terminal after starting the dev server
- **Physical Device**: Scan the QR code with the Expo Go app

## Project Structure

```
haven-app/
│
├── App.js
├── package.json
├── app.json
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── icons/
│
└── src/
    ├── components/
    │   ├── AppHeader.js
    │   ├── BottomNavBar.js
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── HomeScreen.js
    │   ├── SosSentScreen.js
    │   ├── SosMapDetailScreen.js
    │   ├── LiveMapScreen.js
    │   ├── ProfileScreen.js
    │   ├── SettingsScreen.js
    │   ├── MenuScreen.js
    └── data/
        └── mockData.js
```

## Dependencies

- React Native (Expo Managed Workflow)
- React Navigation v6
- React Native Maps
- Expo Vector Icons
- React Native Safe Area Context

## Integration with Desktop App

The mobile app sends emergency alerts to the desktop app via REST API:

```javascript
const handleSosPress = async () => {
  try {
    await fetch('http://localhost:3000/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.email,
        location: USER_COORDINATE,
        timestamp: new Date().toISOString(),
      }),
    });
    navigation.navigate('SosSent');
  } catch (error) {
    console.error('Error sending SOS:', error);
  }
};
```

The desktop app listens for these alerts and displays them on its live map for emergency response units.

## Color Scheme

- Primary Red: #FF3B30
- Background: #FFFFFF
- Text: #000000
- Subtext: #8A8A8E
- Cards: #F2F2F7

## Notes

- Implements mock data for demonstration purposes
- All screens are fully functional with navigation
- Bottom navigation bar for easy access to main features