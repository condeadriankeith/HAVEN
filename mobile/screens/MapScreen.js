import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, RefreshControl, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDERS } from '../constants/styles';
import { emergenciesAPI } from '../services/api';
import * as Location from 'expo-location';
import WebSocketService from '../services/websocket';
import { FontAwesome } from '@expo/vector-icons';

// Safe Dimensions access with fallback
const getWindowDimensions = () => {
  try {
    const dims = Dimensions.get('window');
    return {
      width: dims?.width || 375,
      height: dims?.height || 667,
      aspectRatio: (dims?.width || 375) / (dims?.height || 667)
    };
  } catch (error) {
    console.warn('Error getting window dimensions, using fallback values:', error);
    return {
      width: 375,
      height: 667,
      aspectRatio: 375 / 667
    };
  }
};

const MapScreen = () => {
  const [dimensions, setDimensions] = useState(getWindowDimensions());
  const [emergencies, setEmergencies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapView, setMapView] = useState(null);

  // Update dimensions on screen rotation
  useEffect(() => {
    const onChange = () => {
      setDimensions(getWindowDimensions());
    };
    
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

  useEffect(() => {
    loadActiveEmergencies();
    getCurrentLocation();
    
    // Subscribe to WebSocket emergency updates
    const handleEmergencyUpdate = (emergency) => {
      // Update the emergencies list with the updated emergency
      setEmergencies(prevEmergencies => {
        // Check if emergency already exists
        const existingIndex = prevEmergencies.findIndex(e => e.emergencyId === emergency.emergencyId);
        if (existingIndex >= 0) {
          // Update existing emergency
          const updated = [...prevEmergencies];
          updated[existingIndex] = emergency;
          return updated;
        } else {
          // Add new emergency
          return [...prevEmergencies, emergency];
        }
      });
      
      // Refresh the map to show updated markers
      refreshMap();
    };

    const handleNewEmergencyAlert = (emergency) => {
      // Add new emergency to the list
      setEmergencies(prevEmergencies => {
        // Check if emergency already exists
        const existingIndex = prevEmergencies.findIndex(e => e.emergencyId === emergency.emergencyId);
        if (existingIndex >= 0) {
          // Update existing emergency
          const updated = [...prevEmergencies];
          updated[existingIndex] = emergency;
          return updated;
        } else {
          // Add new emergency
          return [...prevEmergencies, emergency];
        }
      });
      
      // Refresh the map to show new markers
      refreshMap();
    };

    WebSocketService.on('emergency_update', handleEmergencyUpdate);
    WebSocketService.on('new-emergency-alert', handleNewEmergencyAlert);
    
    // Cleanup listener on unmount
    return () => {
      WebSocketService.off('emergency_update', handleEmergencyUpdate);
      WebSocketService.off('new-emergency-alert', handleNewEmergencyAlert);
    };
  }, []);

  const refreshMap = () => {
    // Force the WebView to reload with updated data
    if (mapView) {
      mapView.reload();
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your position on the map');
        return;
      }

      // Get high accuracy location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000 // 5 minutes maximum age
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  const loadActiveEmergencies = async () => {
    try {
      const response = await emergenciesAPI.getActiveEmergencies();
      setEmergencies(response.data.emergencies || []);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading emergencies:', error);
      Alert.alert('Error', 'Failed to load emergency data');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate HTML for the map with Leaflet.js
  const generateMapHTML = () => {
    const centerLat = userLocation ? userLocation.latitude : 10.6765;
    const centerLng = userLocation ? userLocation.longitude : 122.9509;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>HAVEN Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          #map { 
            height: 100vh; 
            width: 100%;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .user-marker {
            background-color: #2196F3;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
          }
          .emergency-marker {
            background-color: #ff4d4d;
            width: 34px;
            height: 34px;
            border-radius: 17px;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .emergency-icon {
            color: white;
            font-size: 16px;
          }
          .emergency-pulse {
            position: absolute;
            width: 80px;
            height: 80px;
            border-radius: 40px;
            background-color: rgba(255,77,77,0.12);
            z-index: -1;
            animation: pulse 2s infinite ease-out;
          }
          @keyframes pulse {
            0% {
                transform: scale(0.9);
                opacity: 0.9;
            }
            70% {
                transform: scale(1.1);
                opacity: 0.7;
            }
            100% {
                transform: scale(0.9);
                opacity: 0.9;
            }
          }
          .legend {
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            line-height: 1.8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .legend h4 {
            margin: 0 0 10px;
            font-weight: bold;
            color: #222;
            font-size: 16px;
          }
          .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          .legend-item:last-child {
            margin-bottom: 0;
          }
          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 8px;
            border: 2px solid white;
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
          }
          .user-color {
            background-color: #2196F3;
          }
          .emergency-color {
            background-color: #ff4d4d;
          }
          .emergency-popup {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 14px;
            min-width: 200px;
          }
          .emergency-id {
            font-weight: bold;
            color: #D32F2F;
            font-size: 12px;
          }
          .emergency-type {
            font-weight: bold;
            margin-bottom: 4px;
            color: #222;
            font-size: 16px;
          }
          .emergency-description {
            margin: 4px 0;
            color: #5A5A5A;
            font-size: 14px;
          }
          .emergency-address {
            font-size: 12px;
            color: #8A8A8A;
            margin-top: 4px;
            font-style: italic;
          }
          .emergency-timestamp {
            font-size: 11px;
            color: #8A8A8A;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize the map
          const map = L.map('map').setView([${centerLat}, ${centerLng}], 15);
          
          // Add OpenStreetMap tiles with enhanced styling
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);
          
          // Add user location marker if available
          ${userLocation ? `
          const userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
            icon: L.divIcon({
              className: 'user-marker',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(map)
            .bindPopup('<b>Your Location</b>')
            .openPopup();
          ` : ''}
          
          // Add emergency markers
          const emergencies = ${JSON.stringify(emergencies)};
          
          emergencies.forEach(emergency => {
            // Handle both possible location structures
            let lat, lng;
            if (emergency.location && emergency.location.latitude && emergency.location.longitude) {
              lat = emergency.location.latitude;
              lng = emergency.location.longitude;
            } else if (emergency.latitude && emergency.longitude) {
              lat = emergency.latitude;
              lng = emergency.longitude;
            } else {
              return; // Skip if no valid location
            }
            
            // Format timestamp
            let timestamp = '';
            if (emergency.timestamp) {
              const date = new Date(emergency.timestamp);
              timestamp = date.toLocaleString();
            }
            
            // Create popup content with consistent formatting
            const popupContent = \`
              <div class="emergency-popup">
                <div class="emergency-type">\${emergency.emergencyType || emergency.type || 'Emergency'}</div>
                <div class="emergency-description">\${emergency.description || 'No description provided'}</div>
                <div class="emergency-id">ID: \${emergency.emergencyId || 'N/A'}</div>
                \${emergency.location && emergency.location.address ? \`<div class="emergency-address">\${emergency.location.address}</div>\` : ''}
                \${timestamp ? \`<div class="emergency-timestamp">\${timestamp}</div>\` : ''}
              </div>
            \`;
            
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'emergency-marker',
                iconSize: [34, 34],
                iconAnchor: [17, 17],
                html: '<div class="emergency-pulse"></div><div class="emergency-icon">⚠</div>'
              })
            }).addTo(map)
              .bindPopup(popupContent);
          });
          
          // Add legend
          const legend = L.control({ position: 'bottomright' });
          legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = \`
              <h4>Map Legend</h4>
              <div class="legend-item">
                <div class="legend-color user-color"></div>
                <span>Your Location</span>
              </div>
              <div class="legend-item">
                <div class="legend-color emergency-color"></div>
                <span>Emergency</span>
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
        <Text style={styles.subtitle}>Real-time alerts from the community</Text>
      </View>
      
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : (
          <>
            <WebView
              ref={ref => setMapView(ref)}
              originWhitelist={['*']}
              source={{ html: generateMapHTML() }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                  setRefreshing(true);
                  loadActiveEmergencies();
                }} />
              }
            />
            <TouchableOpacity style={styles.refreshButton} onPress={refreshMap}>
              <FontAwesome name="refresh" size={20} color={COLORS.primaryBackground} />
            </TouchableOpacity>
            
            {/* Center on user FAB */}
            <TouchableOpacity style={styles.centerFab} onPress={getCurrentLocation}>
              <FontAwesome name="location-arrow" size={20} color="white" />
            </TouchableOpacity>
            
            {/* Floating list button */}
            <TouchableOpacity style={styles.listFab}>
              <FontAwesome name="list-alt" size={20} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {/* Top overlay card */}
      <View style={styles.topCard}>
        <Text style={styles.topTitle}>HAVEN — Map</Text>
        <Text style={styles.topSubtitle}>
          {emergencies.length} active alert{emergencies.length !== 1 ? 's' : ''} • {userLocation ? 'Live' : 'No GPS'}
        </Text>
      </View>
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
    backgroundColor: COLORS.secondaryBackground,
    marginBottom: SPACING.small,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: BORDERS.color,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    fontWeight: TYPOGRAPHY.secondary.fontWeight,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
  map: {
    flex: 1,
  },
  refreshButton: {
    position: 'absolute',
    right: SPACING.large,
    top: SPACING.large,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  topCard: {
    position: 'absolute',
    top: 42,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    zIndex: 10,
  },
  topTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#222' 
  },
  topSubtitle: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
  centerFab: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2a81f7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 10,
  },
  listFab: {
    position: 'absolute',
    left: 16,
    bottom: 120,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 10,
  },
});

export default MapScreen;