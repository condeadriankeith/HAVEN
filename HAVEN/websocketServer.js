const WebSocket = require('ws');
const { readCSV, appendToCSV } = require('./csvHandler');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'haven_secret_key';

// Store all connected clients (both authenticated and unauthenticated)
const allClients = new Map();
const authenticatedClients = new Map();

/**
 * Initialize WebSocket server
 * @param {http.Server} server - HTTP server instance
 */
function initializeWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');
    
    // Assign a temporary ID to the client
    const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    allClients.set(clientId, ws);
    
    // Handle authentication
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication
        if (data.type === 'authenticate') {
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET);
            ws.userId = decoded.userId;
            // Move client from allClients to authenticatedClients
            allClients.delete(clientId);
            authenticatedClients.set(ws.userId, ws);
            ws.send(JSON.stringify({ type: 'authenticated', success: true }));
            console.log(`User ${ws.userId} authenticated`);
          } catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
            ws.close();
          }
        }
        // Handle emergency updates
        else if (data.type === 'emergency_update' && ws.userId) {
          // Broadcast emergency update to all connected clients
          broadcastEmergencyUpdate(data.emergency);
        }
        // Handle emergency alerts
        else if (data.type === 'new-emergency-alert') { // Allow unauthenticated emergency alerts for prototype
          // Process emergency data to ensure consistent structure
          let emergencyData = data.emergency || data;
          
          // Generate a unique emergency ID if not provided
          if (!emergencyData.emergencyId) {
            emergencyData.emergencyId = 'EMG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
          }
          
          // Set timestamp if not provided
          if (!emergencyData.timestamp) {
            emergencyData.timestamp = new Date().toISOString();
          }
          
          // Set default status if not provided
          if (!emergencyData.status) {
            emergencyData.status = 'ACTIVE';
          }
          
          // Set default emergency type if not provided
          if (!emergencyData.emergencyType) {
            emergencyData.emergencyType = 'Pet Health Emergency';
          }
          
          // Preserve the nested location object structure for consistency with mobile app
          // Only flatten if the location data is at the top level (which shouldn't be the case from mobile app)
          if (emergencyData.latitude !== undefined && emergencyData.longitude !== undefined && !emergencyData.location) {
            // Create nested location object if flat structure is detected
            emergencyData.location = {
              latitude: emergencyData.latitude,
              longitude: emergencyData.longitude
            };
            
            // Copy other location properties if they exist
            if (emergencyData.accuracy !== undefined) emergencyData.location.accuracy = emergencyData.accuracy;
            if (emergencyData.altitude !== undefined) emergencyData.location.altitude = emergencyData.altitude;
            if (emergencyData.heading !== undefined) emergencyData.location.heading = emergencyData.heading;
            if (emergencyData.speed !== undefined) emergencyData.location.speed = emergencyData.speed;
            if (emergencyData.address !== undefined) emergencyData.location.address = emergencyData.address;
            
            // Remove flat location properties
            delete emergencyData.latitude;
            delete emergencyData.longitude;
            delete emergencyData.accuracy;
            delete emergencyData.altitude;
            delete emergencyData.heading;
            delete emergencyData.speed;
            delete emergencyData.address;
          }
          
          // If we still don't have location data, ensure we have minimum required data
          if (!emergencyData.location) {
            emergencyData.location = {
              latitude: 10.6765,
              longitude: 122.9509
            };
          }
          
          // Validate coordinates are within reasonable bounds
          if (emergencyData.location.latitude < -90 || emergencyData.location.latitude > 90 ||
              emergencyData.location.longitude < -180 || emergencyData.location.longitude > 180) {
            console.warn("Invalid coordinates detected:", emergencyData.location.latitude, emergencyData.location.longitude);
            emergencyData.location.latitude = 10.6765;
            emergencyData.location.longitude = 122.9509;
          }
          
          // If userId is not provided but client is authenticated, use client's userId
          if (!emergencyData.userId && ws.userId) {
            emergencyData.userId = ws.userId;
          }
          
          console.log("Emergency data with validated coordinates:", emergencyData);
          
          // Broadcast emergency alert to all connected clients with consistent structure
          broadcastEmergencyUpdate(emergencyData);
        }
        // Handle subscription to emergency alerts
        else if (data.type === 'subscribe-emergency-alerts') { // Allow unauthenticated subscriptions for prototype
          // Add client to emergency alerts room
          if (!ws.rooms) ws.rooms = new Set();
          ws.rooms.add('emergency-alerts');
          
          // Store subscription info on the WebSocket object
          ws.subscribedToAlerts = true;
          
          ws.send(JSON.stringify({ type: 'subscription-ack', success: true }));
          console.log(`Client subscribed to emergency alerts`);
        }
        // Handle emergency status updates
        else if (data.type === 'emergency-status-update' && ws.userId) {
          // Forward status update to all clients
          broadcastEmergencyUpdate(data.emergency);
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      // Remove from both maps
      allClients.delete(clientId);
      if (ws.userId) {
        authenticatedClients.delete(ws.userId);
        console.log(`User ${ws.userId} disconnected`);
      } else {
        console.log(`Client ${clientId} disconnected`);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  console.log('WebSocket server initialized');
}

/**
 * Broadcast emergency update to all connected clients
 * @param {Object} emergency - Emergency data to broadcast
 */
function broadcastEmergencyUpdate(emergency) {
  const message = JSON.stringify({
    type: 'new-emergency-alert',
    emergency
  });
  
  // Send to all connected clients (both authenticated and unauthenticated)
  allClients.forEach((client, clientId) => {
    // Check if client is subscribed to emergency alerts
    if (client.readyState === WebSocket.OPEN && client.subscribedToAlerts) {
      client.send(message);
    }
  });
  
  authenticatedClients.forEach((client, userId) => {
    // Check if client is subscribed to emergency alerts
    if (client.readyState === WebSocket.OPEN && client.subscribedToAlerts) {
      client.send(message);
    }
  });
  
  console.log('Emergency update broadcasted to all clients');
}

/**
 * Notify specific user about an update
 * @param {string} userId - User ID to notify
 * @param {Object} data - Data to send
 */
function notifyUser(userId, data) {
  const client = authenticatedClients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
}

module.exports = {
  initializeWebSocketServer,
  broadcastEmergencyUpdate,
  notifyUser
};