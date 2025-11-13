import { w3cwebsocket as W3CWebSocket } from 'websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config';

// Get WebSocket URL based on platform and environment variables
const getWebSocketUrl = () => {
  // Try to get from config first
  if (CONFIG.WEBSOCKET_URL) {
    return CONFIG.WEBSOCKET_URL;
  }
  
  if (__DEV__) {
    // Check if running on web or mobile
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      // For mobile devices, use localhost as fallback
      return 'ws://localhost:3000';
    } else {
      // For web browser, use localhost
      return 'ws://localhost:3000';
    }
  } else {
    // Production URL
    return 'ws://your-production-api-url.com';
  }
};

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = {};
    this.reconnectInterval = 5000; // 5 seconds
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.token = null;
    this.subscribers = new Set(); // For the new subscribe API
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT authentication token
   */
  connect(token) {
    // Store token for reconnection
    this.token = token;
    
    // Close existing connection if any
    if (this.client) {
      this.client.close();
    }

    // Create WebSocket connection
    this.client = new W3CWebSocket(getWebSocketUrl());

    this.client.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      
      // Authenticate with token
      this.sendMessage({
        type: 'authenticate',
        token: token
      });
      
      // Subscribe to emergency alerts after authentication
      setTimeout(() => {
        this.sendMessage({
          type: 'subscribe-emergency-alerts'
        });
      }, 1000);
    };

    this.client.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        this.handleMessage(data);
        
        // Forward to subscribers for the new API
        this.subscribers.forEach(cb => {
          try { cb(data); } catch (e) { console.error('subscriber cb error', e); }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.client.onclose = () => {
      console.log('WebSocket connection closed');
      this.handleDisconnect();
    };

    this.client.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnect();
    };
  }

  /**
   * Handle incoming messages
   * @param {Object} data - Message data
   */
  handleMessage(data) {
    switch (data.type) {
      case 'authenticated':
        console.log('WebSocket authenticated successfully');
        this.emit('authenticated', data);
        break;
        
      case 'emergency_update':
        console.log('Emergency update received:', data.emergency);
        this.emit('emergency_update', data.emergency);
        break;
        
      case 'new-emergency-alert':
        console.log('New emergency alert received:', data.emergency);
        this.emit('emergency_update', data.emergency);
        break;
        
      case 'subscription-ack':
        console.log('Subscribed to emergency alerts successfully');
        this.emit('subscription-ack', data);
        break;
        
      case 'error':
        console.error('WebSocket error:', data.message);
        this.emit('error', data);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  /**
   * Handle disconnection and attempt reconnection
   */
  handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token);
        } else {
          AsyncStorage.getItem('authToken')
            .then(token => {
              if (token) {
                this.token = token;
                this.connect(token);
              }
            })
            .catch(error => {
              console.error('Error retrieving auth token for reconnection:', error);
            });
        }
      }, this.reconnectInterval);
    } else {
      console.log('Max reconnection attempts reached');
      this.emit('disconnected', { reason: 'Max reconnection attempts reached' });
    }
  }

  /**
   * Send message through WebSocket
   * @param {Object} message - Message to send
   */
  sendMessage(message) {
    if (this.client && this.client.readyState === this.client.OPEN) {
      this.client.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  /**
   * Send emergency update
   * @param {Object} emergency - Emergency data to send
   */
  sendEmergencyUpdate(emergency) {
    // Ensure the emergency data has proper structure for the desktop app
    const emergencyData = {
      type: 'new-emergency-alert',
      emergency: {
        ...emergency,
        // Ensure location data is properly structured
        location: emergency.location || {
          latitude: emergency.latitude,
          longitude: emergency.longitude,
          accuracy: emergency.accuracy || 0,
          altitude: emergency.altitude || 0,
          heading: emergency.heading || 0,
          speed: emergency.speed || 0,
          address: emergency.address || ''
        }
      }
    };
    
    // Remove flat location properties if they exist since we're using nested structure
    if (emergencyData.emergency.latitude !== undefined) delete emergencyData.emergency.latitude;
    if (emergencyData.emergency.longitude !== undefined) delete emergencyData.emergency.longitude;
    if (emergencyData.emergency.accuracy !== undefined) delete emergencyData.emergency.accuracy;
    if (emergencyData.emergency.altitude !== undefined) delete emergencyData.emergency.altitude;
    if (emergencyData.emergency.heading !== undefined) delete emergencyData.emergency.heading;
    if (emergencyData.emergency.speed !== undefined) delete emergencyData.emergency.speed;
    if (emergencyData.emergency.address !== undefined) delete emergencyData.emergency.address;
    
    this.sendMessage(emergencyData);
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {any} data - Data to pass to listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.listeners = {};
    this.token = null;
    this.subscribers.clear();
  }
  
  /**
   * Subscribe to all WebSocket messages (new API)
   * @param {Function} callback - Function to call when messages arrive
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

// Export singleton instance
export default new WebSocketService();