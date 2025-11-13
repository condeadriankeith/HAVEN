import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDERS } from '../constants/styles';
import { emergenciesAPI } from '../services/api';
import * as Location from 'expo-location';
import WebSocketService from '../services/websocket';
import { FontAwesome } from '@expo/vector-icons';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const MapScreen = () => {
  const { width, height, aspectRatio } = useResponsiveDimensions();
  const [emergencies, setEmergencies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(null);
  const [mapError, setMapError] = useState(null);
  const webViewRef = useRef(null);



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
      
      // Remove refreshMap call since we don't need refresh buttons
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
      
      // Remove refreshMap call since we don't need refresh buttons
    };

    WebSocketService.on('emergency_update', handleEmergencyUpdate);
    WebSocketService.on('new-emergency-alert', handleNewEmergencyAlert);
    
    // Cleanup listener on unmount
    return () => {
      WebSocketService.off('emergency_update', handleEmergencyUpdate);
      WebSocketService.off('new-emergency-alert', handleNewEmergencyAlert);
    };
  }, []);

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
      setMapError(null);
    } catch (error) {
      console.error('Error loading emergencies:', error);
      setMapError('Failed to load emergency data. Please check your connection.');
      setLoading(false);
    }
  };

  // Generate HTML for the map with Leaflet.js - simplified version similar to desktop
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
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
          }
          #map { 
            height: 100vh; 
            width: 100%;
          }
          .pulse-circle {
            width: 20px;
            height: 20px;
            background-color: #ff3b30;
            border-radius: 50%;
            position: relative;
            animation: pulse 1.5s infinite ease-out;
            margin: 10px;
          }
          @keyframes pulse {
            0% {
              transform: scale(0.8);
              opacity: 0.8;
              box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7);
            }
            70% {
              transform: scale(1.2);
              opacity: 0.5;
              box-shadow: 0 0 0 15px rgba(255, 59, 48, 0);
            }
            100% {
              transform: scale(0.8);
              opacity: 0.8;
              box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
            }
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
            width: 40px;
            height: 40px;
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
            background-color: #ff3b30;
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
          .emergency-reporter {
            font-size: 12px;
            color: #4A4A4A;
            font-style: italic;
            margin: 4px 0;
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
          
          // Add OpenStreetMap tiles
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
            // Format timestamp for display
            let displayTimestamp = '';
            if (emergency.timestamp) {
              const now = new Date();
              const date = new Date(emergency.timestamp);
              const diffInSeconds = Math.floor((now - date) / 1000);
                          
              if (diffInSeconds < 60) {
                displayTimestamp = 'Just now - ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                displayTimestamp = minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago - ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                displayTimestamp = hours + ' hour' + (hours > 1 ? 's' : '') + ' ago - ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else {
                const days = Math.floor(diffInSeconds / 86400);
                displayTimestamp = days + ' day' + (days > 1 ? 's' : '') + ' ago - ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            }
                        
            // Get reporter name
            const reporterName = emergency.userName || (emergency.contactInfo && emergency.contactInfo.name) || 'User';
                        
            // Escape HTML special characters
            const escapeHtml = (text) => {
              return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            };
                        
            const emergencyType = escapeHtml(emergency.emergencyType || emergency.type || 'Emergency');
            const description = escapeHtml(emergency.description || 'No description provided');
            const emergencyId = escapeHtml(emergency.emergencyId || 'N/A');
            const address = emergency.location && emergency.location.address ? escapeHtml(emergency.location.address) : '';
            const reporter = escapeHtml(reporterName);
                        
            // Build popup content using string concatenation to avoid template literal issues
            let popupContent = '<div class="emergency-popup">' +
              '<div class="emergency-type">' + emergencyType + '</div>' +
              '<div class="emergency-description">' + description + '</div>' +
              '<div class="emergency-id">ID: ' + emergencyId + '</div>' +
              '<div class="emergency-reporter">Reported by ' + reporter + '</div>';
                          
            if (address) {
              popupContent += '<div class="emergency-address">' + address + '</div>';
            }
                        
            if (displayTimestamp) {
              popupContent += '<div class="emergency-timestamp">' + displayTimestamp + '</div>';
            }
                        
            popupContent += '</div>';
                        
            // Log for debugging
            console.log('Popup content:', popupContent);
            
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'emergency-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                html: '<div class="pulse-circle"></div>'
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

  const onWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setMapError('Failed to load map. Please check your internet connection.');
    setLoading(false);
  };

  const onWebViewLoad = () => {
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Emergency Map</Text>
        <Text style={styles.subtitle}>Real-time alerts from the community</Text>
      </View>
      
      <View style={styles.mapContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        
        {mapError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{mapError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => {
              setMapError(null);
              setLoading(true);
              loadActiveEmergencies();
            }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: generateMapHTML() }}
              style={[styles.map, loading && { display: 'none' }]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onError={onWebViewError}
              onLoad={onWebViewLoad}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading map...</Text>
                </View>
              )}
            />
            {/* Remove the refresh button since the system is supposed to be constantly refreshing for real-time updates */}
            
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
    padding: moderateScale(SPACING.lg),
    backgroundColor: COLORS.secondaryBackground,
    marginBottom: moderateScale(SPACING.md),
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(TYPOGRAPHY.title.fontSize),
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
    marginTop: moderateScale(SPACING.sm),
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: moderateScale(SPACING.lg),
  },
  errorText: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: moderateScale(SPACING.lg),
  },
  retryButton: {
    backgroundColor: COLORS.accentRed,
    paddingHorizontal: moderateScale(SPACING.xl),
    paddingVertical: moderateScale(SPACING.md),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: COLORS.primaryBackground,
    fontWeight: '600',
    fontSize: moderateScale(TYPOGRAPHY.button.fontSize),
  },
  loadingText: {
    fontSize: moderateScale(TYPOGRAPHY.body.fontSize),
    color: COLORS.textSecondary,
    marginTop: moderateScale(SPACING.md),
  },
  map: {
    flex: 1,
  },
  topCard: {
    position: 'absolute',
    top: verticalScale(42),
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(12),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    zIndex: 10,
  },
  topTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: '700', 
    color: '#222' 
  },
  topSubtitle: { 
    fontSize: moderateScale(12), 
    color: '#666', 
    marginTop: moderateScale(2) 
  },
  centerFab: {
    position: 'absolute',
    right: moderateScale(16),
    bottom: verticalScale(120),
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: '#2a81f7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 10,
  },
  listFab: {
    position: 'absolute',
    left: moderateScale(16),
    bottom: verticalScale(120),
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 10,
  },
});

export default MapScreen;