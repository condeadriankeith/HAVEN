import { w3cwebsocket as W3CWebSocket } from 'websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = {};
    this.reconnectInterval = 5000; // 5 seconds
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT authentication token
   */
  connect(token) {
    // Close existing connection if any
    if (this.client) {
      this.client.close();
    }

    // Create WebSocket connection
    this.client = new W3CWebSocket(`ws://localhost:3000`);

    this.client.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      
      // Authenticate with token
      this.sendMessage({
        type: 'authenticate',
        token: token
      });
    };

    this.client.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        this.handleMessage(data);
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
        AsyncStorage.getItem('authToken')
          .then(token => {
            if (token) {
              this.connect(token);
            }
          })
          .catch(error => {
            console.error('Error retrieving auth token for reconnection:', error);
          });
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
    this.sendMessage({
      type: 'emergency_update',
      emergency: emergency
    });
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
  }
}

// Export singleton instance
export default new WebSocketService();