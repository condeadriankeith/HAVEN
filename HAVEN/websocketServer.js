const WebSocket = require('ws');
const { readCSV, appendToCSV } = require('./csvHandler');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'haven_secret_key';

// Store connected clients
const clients = new Map();

/**
 * Initialize WebSocket server
 * @param {http.Server} server - HTTP server instance
 */
function initializeWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');
    
    // Handle authentication
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication
        if (data.type === 'authenticate') {
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET);
            ws.userId = decoded.userId;
            clients.set(ws.userId, ws);
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
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`User ${ws.userId} disconnected`);
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
    type: 'emergency_update',
    emergency
  });
  
  // Send to all connected clients
  clients.forEach((client, userId) => {
    if (client.readyState === WebSocket.OPEN) {
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
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
}

module.exports = {
  initializeWebSocketServer,
  broadcastEmergencyUpdate,
  notifyUser
};