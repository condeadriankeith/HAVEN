# HAVEN Mobile App

A React Native mobile application for the HAVEN Pet Emergency Response System.

## Features

- One-click emergency reporting
- Real-time location tracking
- Live map view with OpenStreetMap integration
- Emergency report history
- Push notifications
- User profile management

## Technology Stack

- React Native with Expo
- React Navigation for routing
- Axios for API communication
- Expo Location for geolocation services
- Leaflet.js for map rendering (via WebView)
- AsyncStorage for local data storage

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code with Expo Go app or use an emulator

## Project Structure

```
mobile/
├── assets/          # Images and static assets
├── components/      # Reusable UI components
├── constants/       # App constants (colors, styles, etc.)
├── screens/         # Screen components
├── services/        # API and utility services
├── App.js           # Main app component
└── app.json         # Expo configuration
```

## Development

To run on Android:
```bash
npx expo start --android
```

To run on iOS:
```bash
npx expo start --ios
```

To run on Web:
```bash
npx expo start --web
```