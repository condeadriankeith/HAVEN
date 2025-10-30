import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { emergenciesAPI } from '../services/api';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveEmergencies();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your position on the map');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  const loadActiveEmergencies = async () => {
    try {
      const response = await emergenciesAPI.getActiveEmergencies();
      setEmergencies(response.data.emergencies);
      setLoading(false);
    } catch (error) {
      console.error('Error loading emergencies:', error);
      Alert.alert('Error', 'Failed to load emergency data');
      setLoading(false);
    }
  };

  // Generate HTML for the map with Leaflet.js
  const generateMapHTML = () => {
    const centerLat = userLocation ? userLocation.latitude : 51.505;
    const centerLng = userLocation ? userLocation.longitude : -0.09;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>HAVEN Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          #map { 
            height: 100vh; 
            width: 100%;
          }
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize the map
          const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Add user location marker if available
          ${userLocation ? `
          const userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}]).addTo(map)
            .bindPopup('Your Location')
            .openPopup();
          ` : ''}
          
          // Add emergency markers
          const emergencies = ${JSON.stringify(emergencies)};
          
          emergencies.forEach(emergency => {
            if (emergency.location && emergency.location.latitude && emergency.location.longitude) {
              const marker = L.marker([
                emergency.location.latitude, 
                emergency.location.longitude
              ]).addTo(map)
                .bindPopup(\`<b>\${emergency.type}</b><br>\${emergency.description || 'No description'}<br><small>\${emergency.address || ''}</small>\`);
            }
          });
          
          // Add legend
          const legend = L.control({ position: 'bottomright' });
          legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = \`
              <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 15px rgba(0,0,0,0.2);">
                <h4 style="margin: 0 0 10px;">Map Legend</h4>
                <div><span style="color: blue;">●</span> Your Location</div>
                <div><span style="color: red;">●</span> Emergency</div>
                <div><span style="color: green;">●</span> Responder</div>
              </div>
            \`;
            return div;
          };
          legend.addTo(map);
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Emergency Map</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading map...</Text>
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: generateMapHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accentGray,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;