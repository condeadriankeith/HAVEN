const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import CSV handler
const { readCSV, writeCSV, appendToCSV } = require('./csvHandler');

// Import WebSocket server
const { initializeWebSocketServer, broadcastEmergencyUpdate, broadcastEmergencyStatusUpdate } = require('./websocketServer');

// Define the database directory
const DATABASE_DIR = path.join(__dirname, 'database');

// Function to ensure default admin user exists
async function ensureAdminUser() {
  try {
    const users = await readCSV('users.csv');
    const adminUser = users.find(user => user.email === 'admin@example.com');
    
    if (!adminUser) {
      // Create default admin user
      const defaultAdmin = {
        id: 'USR-0001',
        email: 'admin@example.com',
        phone: '123-456-7890',
        firstName: 'Admin',
        lastName: 'User',
        address: 'Default Admin Address',
        role: 'admin',
        password: '$2a$10$G54sq85aYb484xKVawJfSOo5Lbop8/NywuR4ODvM9YKuo.HCaKQ8y' // bcrypt hash for "admin123"
      };
      
      // Add to existing users or create new array
      const updatedUsers = [...users, defaultAdmin];
      const headers = ['id', 'email', 'phone', 'firstName', 'lastName', 'address', 'role', 'password'];
      await writeCSV('users.csv', updatedUsers, headers);
      
      console.log('Default admin user created.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
}

// Function to clear CSV files
async function clearCSVFiles() {
  try {
    // Clear emergencies.csv
    const emergenciesHeaders = ['emergencyId', 'userId', 'userName', 'userPhone', 'userEmail', 'userPets', 'latitude', 'longitude', 'address', 'emergencyType', 'status', 'reportedAt', 'respondedAt', 'resolvedAt', 'assignedResponderId', 'notes', 'createdAt', 'updatedAt'];
    await writeCSV('emergencies.csv', [], emergenciesHeaders);
    
    // Clear responders.csv
    const respondersHeaders = ['id', 'name', 'organization', 'phone', 'email', 'specialty', 'latitude', 'longitude', 'status', 'lastActive'];
    await writeCSV('responders.csv', [], respondersHeaders);
    
    // Clear users.csv but preserve the default admin user
    const usersHeaders = ['id', 'email', 'phone', 'firstName', 'lastName', 'address', 'role', 'password'];
    const users = await readCSV('users.csv');
    const adminUser = users.find(user => user.email === 'admin@example.com');
    
    // If admin user exists, preserve it; otherwise create a new one
    let usersToKeep = [];
    if (adminUser) {
      usersToKeep = [adminUser];
    } else {
      // Create default admin user
      const defaultAdmin = {
        id: 'USR-0001',
        email: 'admin@example.com',
        phone: '123-456-7890',
        firstName: 'Admin',
        lastName: 'User',
        address: 'Default Admin Address',
        role: 'admin',
        password: '$2a$10$G54sq85aYb484xKVawJfSOo5Lbop8/NywuR4ODvM9YKuo.HCaKQ8y' // bcrypt hash for "admin123"
      };
      usersToKeep = [defaultAdmin];
    }
    
    await writeCSV('users.csv', usersToKeep, usersHeaders);
    
    console.log('CSV files cleared successfully. Only admin user preserved.');
  } catch (error) {
    console.error('Error clearing CSV files:', error);
  }
}

const app = express();
const DEFAULT_PORT = process.env.PORT || 3000;
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Rate limiting - removed for testing

// Apply rate limiting to all requests - removed for testing

// Middleware
app.use(cors());
app.use(express.json());

// Clear CSV files on server startup
(async () => {
  await clearCSVFiles();
  
  // Create HTTP server
  const server = http.createServer(app);
  
  // Initialize Socket.IO server
  const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:8080", "http://localhost:19006"], // Desktop and mobile app origins
      methods: ["GET", "POST"]
    }
  });
  
  // Store connected clients
  const connectedClients = new Map();
  
  // Make io available globally
  global.io = io;
  
  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Handle authentication
    socket.on('authenticate', async (data) => {
      try {
        const { token } = data;
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        connectedClients.set(socket.id, { userId: decoded.userId, role: decoded.role });
        
        console.log(`User ${decoded.userId} authenticated with role ${decoded.role}`);
        socket.emit('authenticated', { type: 'authenticated', success: true });
        
        // Join emergency alerts room
        socket.join('emergency-alerts');
        
        // Send current active emergencies to newly connected desktop clients
        if (decoded.role === 'admin' || decoded.role === 'responder') {
          const activeEmergencies = await getActiveEmergencies();
          socket.emit('current-emergencies', { type: 'current-emergencies', emergencies: activeEmergencies });
        }
      } catch (err) {
        console.error('Authentication error:', err);
        socket.emit('error', { type: 'error', message: 'Authentication failed' });
        socket.disconnect();
      }
    });
    
    // Handle subscription to emergency alerts
    socket.on('subscribe-emergency-alerts', (data) => {
      if (socket.userId) {
        socket.join('emergency-alerts');
        socket.emit('subscription-ack', { type: 'subscription-ack', success: true });
        console.log(`Client ${socket.userId} subscribed to emergency alerts`);
      } else {
        socket.emit('error', { type: 'error', message: 'Not authenticated' });
      }
    });
    
    // Handle emergency status update
    socket.on('emergency-status-update', async (data) => {
      try {
        const { emergencyId, newStatus, responderId } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }
        
        // Validate emergency ID exists
        const emergencies = await readCSV('emergencies.csv');
        const emergencyIndex = emergencies.findIndex(e => e.emergencyId === emergencyId);
        
        if (emergencyIndex === -1) {
          socket.emit('error', { message: 'Emergency not found' });
          return;
        }
        
        // Update emergency status
        const now = new Date().toISOString();
        emergencies[emergencyIndex].status = newStatus;
        emergencies[emergencyIndex].updatedAt = now;
        
        if (newStatus === 'RESPONDING' && responderId) {
          emergencies[emergencyIndex].assignedResponderId = responderId;
          emergencies[emergencyIndex].respondedAt = now;
        } else if (newStatus === 'RESOLVED') {
          emergencies[emergencyIndex].resolvedAt = now;
        }
        
        // Save updated emergencies to CSV
        const headers = ['emergencyId', 'userId', 'userName', 'userPhone', 'userEmail', 'userPets', 'latitude', 'longitude', 'address', 'emergencyType', 'status', 'reportedAt', 'respondedAt', 'resolvedAt', 'assignedResponderId', 'notes', 'createdAt', 'updatedAt'];
        await writeCSV('emergencies.csv', emergencies, headers);
        
        // Broadcast status change to all clients using the new function
        const updatedEmergency = emergencies[emergencyIndex];
        broadcastEmergencyStatusUpdate(updatedEmergency);
        
        socket.emit('status-update-ack', { success: true, emergency: updatedEmergency });
        console.log(`Emergency ${emergencyId} status updated to ${newStatus}`);
      } catch (error) {
        console.error('Error updating emergency status:', error);
        socket.emit('error', { message: 'Failed to update emergency status' });
      }
    });
    
    // Handle new emergency alert from mobile app
    socket.on('new-emergency-alert', async (data) => {
      try {
        console.log('Received new emergency alert via WebSocket:', data);
        
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }
        
        const { emergency } = data;
        
        // Validate emergency data
        if (!emergency || (!emergency.userId && !socket.userId) || !emergency.latitude || !emergency.longitude) {
          socket.emit('error', { message: 'Invalid emergency data' });
          return;
        }
        
        // Use emergency userId or socket userId
        const userId = emergency.userId || socket.userId;
        
        // Validate user
        const user = await getUserById(userId);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }
        
        // Parse user pets
        let userPets = [];
        if (user.pets) {
          try {
            userPets = JSON.parse(user.pets);
          } catch (e) {
            console.error('Error parsing user pets:', e);
            userPets = [];
          }
        }
        
        // Generate emergency ID if not provided
        const emergencyId = emergency.emergencyId || await generateEmergencyId();
        
        // Create emergency record
        const emergencyData = {
          emergencyId,
          userId: userId,
          userName: emergency.contactInfo?.name || `${user.firstName} ${user.lastName}`,
          userPhone: emergency.contactInfo?.phone || user.phone,
          userEmail: emergency.contactInfo?.email || user.email,
          userPets: JSON.stringify(userPets), // Include user's pets in the emergency record
          latitude: emergency.latitude,
          longitude: emergency.longitude,
          address: emergency.address || `Approximate location: ${emergency.latitude.toFixed(6)}, ${emergency.longitude.toFixed(6)}`,
          emergencyType: emergency.emergencyType || 'Pet Health Emergency',
          status: 'ACTIVE',
          reportedAt: emergency.timestamp || new Date().toISOString(),
          respondedAt: '',
          resolvedAt: '',
          assignedResponderId: '',
          notes: emergency.additionalDetails || '',
          createdAt: emergency.timestamp || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('Emergency data to save via WebSocket:', emergencyData);
        
        // Save emergency record to database
        const headers = ['emergencyId', 'userId', 'userName', 'userPhone', 'userEmail', 'userPets', 'latitude', 'longitude', 'address', 'emergencyType', 'status', 'reportedAt', 'respondedAt', 'resolvedAt', 'assignedResponderId', 'notes', 'createdAt', 'updatedAt'];
        await appendToCSV('emergencies.csv', emergencyData);
        
        // Broadcast emergency to all connected clients through both mechanisms
        // Via Socket.IO
        io.to('emergency-alerts').emit('new-emergency-alert', {
          type: 'new-emergency-alert',
          emergency: emergencyData
        });
        
        // Via WebSocket server
        broadcastEmergencyUpdate(emergencyData);
        
        socket.emit('emergency-ack', { success: true, emergencyId });
        console.log(`New emergency alert created: ${emergencyId}`);
      } catch (error) {
        console.error('Error creating emergency alert via WebSocket:', error);
        socket.emit('error', { message: 'Failed to create emergency alert' });
      }
    });
    
    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedClients.delete(socket.id);
    });
  });
  
  // Start server with fallback mechanism
  startServer(server, parseInt(DEFAULT_PORT));
})();

// Helper function to generate user IDs in USR-XXXX format
async function generateUserId() {
  const users = await readCSV('users.csv');
  // Find the highest existing user ID number
  let maxId = 1;
  users.forEach(user => {
    if (user.id && user.id.startsWith('USR-')) {
      const numPart = parseInt(user.id.substring(4));
      if (!isNaN(numPart) && numPart > maxId) {
        maxId = numPart;
      }
    }
  });
  
  // Return the next ID in the sequence
  return `USR-${String(maxId + 1).padStart(4, '0')}`;
}

// Helper function to generate emergency IDs in EMG-XXXX format
async function generateEmergencyId() {
  const emergencies = await readCSV('emergencies.csv');
  // Find the highest existing emergency ID
  let maxId = 0;
  emergencies.forEach(emergency => {
    if (emergency.emergencyId && emergency.emergencyId.startsWith('EMG-')) {
      const numPart = parseInt(emergency.emergencyId.substring(4));
      if (!isNaN(numPart) && numPart > maxId) {
        maxId = numPart;
      }
    }
  });
  
  // Return the next ID in the sequence
  return `EMG-${String(maxId + 1).padStart(4, '0')}`;
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Socket.IO connection handling
// This will be initialized inside the async function

// Function to broadcast emergency to all connected clients
function broadcastEmergency(emergencyData) {
  // Broadcast via Socket.IO
  global.io.to('emergency-alerts').emit('new-emergency-alert', {
    type: 'new-emergency-alert',
    emergency: emergencyData
  });
  
  // Broadcast via WebSocket
  broadcastEmergencyUpdate(emergencyData);
  
  console.log('Emergency broadcasted to all clients:', emergencyData.emergencyId);
}

// Function to get active emergencies
async function getActiveEmergencies() {
  const allEmergencies = await readCSV('emergencies.csv');
  return allEmergencies.filter(e => e.status === 'ACTIVE');
}

// Function to get user by ID
async function getUserById(userId) {
  const users = await readCSV('users.csv');
  return users.find(u => u.id === userId);
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'HAVEN Pet Emergency Response System API' });
});

// Log endpoint for mobile app debugging
app.post('/api/v1/logs', (req, res) => {
  try {
    const { level, message, metadata, timestamp, userAgent, platform } = req.body;
    
    // Log the message to the server console with a prefix to distinguish mobile logs
    const logPrefix = `[MOBILE-APP-${platform.toUpperCase()}]`;
    const formattedLog = `${logPrefix} [${level.toUpperCase()}] ${timestamp} - ${message}`;
    
    // Log to server console
    if (level === 'error') {
      console.error(formattedLog, metadata);
    } else if (level === 'warn') {
      console.warn(formattedLog, metadata);
    } else {
      console.log(formattedLog, metadata);
    }
    
    // Return success response
    res.status(200).json({ success: true, message: 'Log received' });
  } catch (error) {
    console.error('Error processing mobile app log:', error);
    res.status(500).json({ success: false, error: 'Failed to process log' });
  }
});

// User registration
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, address, pets } = req.body;

    // Read users from CSV
    const users = await readCSV('users.csv');
    
    // Check if user already exists (but exclude the default admin)
    const existingUser = users.find(u => 
      (u.email === email || u.phone === phone) && 
      u.email !== 'admin@example.com' // Allow re-registration with admin email for testing
    );
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or phone number' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with formatted ID
    const newUser = {
      id: await generateUserId(),
      email,
      phone,
      firstName,
      lastName,
      address: address || '',
      role: 'pet_owner',
      password: hashedPassword,
      pets: pets ? JSON.stringify(pets) : '[]' // Store pets as JSON string
    };

    // Save user to CSV
    await appendToCSV('users.csv', newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      userId: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// User login
app.all('/api/v1/auth/login', async (req, res) => {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST for login.' });
  }
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Read users from CSV
    const users = await readCSV('users.csv');
    console.log('Users in database:', users.length);
    
    // Find user
    const user = users.find(u => u.email === email);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User email from CSV:', user.email);
    console.log('User password from CSV:', user.password);
    console.log('Provided password:', password);

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/v1/users/profile', authenticateToken, async (req, res) => {
  // Read users from CSV
  const users = await readCSV('users.csv');
  
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Parse pets JSON if it exists
  let pets = [];
  if (user.pets) {
    try {
      pets = JSON.parse(user.pets);
    } catch (e) {
      console.error('Error parsing pets JSON:', e);
      pets = [];
    }
  }

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    role: user.role,
    pets: pets
  });
});

// Create emergency report API endpoint
app.post('/api/v1/emergencies/alert', authenticateToken, async (req, res) => {
  try {
    console.log('Received emergency alert request:', req.body);
    
    // Handle both nested and flat structures for location data
    let { contactInfo, location, emergencyType, timestamp, additionalDetails } = req.body;
    
    // If location is not provided but latitude/longitude are at top level, create location object
    if (!location && (req.body.latitude || req.body.longitude)) {
      location = {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        accuracy: req.body.accuracy,
        altitude: req.body.altitude,
        heading: req.body.heading,
        speed: req.body.speed,
        address: req.body.address
      };
    }
    
    // If location is provided as an object but latitude/longitude are at top level, merge them
    if (!location) {
      location = {};
    }
    
    if (req.body.latitude !== undefined) location.latitude = req.body.latitude;
    if (req.body.longitude !== undefined) location.longitude = req.body.longitude;
    if (req.body.accuracy !== undefined) location.accuracy = req.body.accuracy;
    if (req.body.altitude !== undefined) location.altitude = req.body.altitude;
    if (req.body.heading !== undefined) location.heading = req.body.heading;
    if (req.body.speed !== undefined) location.speed = req.body.speed;
    if (req.body.address !== undefined) location.address = req.body.address;

    // Use the authenticated user's ID
    const userId = req.user.userId;

    // Validate latitude/longitude ranges
    if (location.latitude < -90 || location.latitude > 90) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid latitude value', 
        code: 'INVALID_LATITUDE' 
      });
    }

    if (location.longitude < -180 || location.longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid longitude value', 
        code: 'INVALID_LONGITUDE' 
      });
    }

    // Validate required fields
    if (!userId || !location.latitude || !location.longitude) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields', 
        code: 'MISSING_FIELDS' 
      });
    }

    // Get user data including pets
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found', 
        code: 'USER_NOT_FOUND' 
      });
    }

    // Parse user pets
    let userPets = [];
    if (user.pets) {
      try {
        userPets = JSON.parse(user.pets);
      } catch (e) {
        console.error('Error parsing user pets:', e);
        userPets = [];
      }
    }

    // Create emergency record with user information including pets
    const emergencyData = {
      emergencyId: await generateEmergencyId(),
      userId: userId,
      userName: `${user.firstName} ${user.lastName}`,
      userPhone: user.phone || '',
      userEmail: user.email || '',
      userPets: JSON.stringify(userPets), // Include user's pets in the emergency record
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || `Approximate location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      emergencyType: emergencyType || 'Pet Health Emergency',
      status: 'ACTIVE',
      reportedAt: timestamp || new Date().toISOString(),
      respondedAt: '',
      resolvedAt: '',
      assignedResponderId: '',
      notes: additionalDetails || '',
      createdAt: timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Emergency data to save:', emergencyData);
    
    // Save emergency record to database
    const headers = ['emergencyId', 'userId', 'userName', 'userPhone', 'userEmail', 'userPets', 'latitude', 'longitude', 'address', 'emergencyType', 'status', 'reportedAt', 'respondedAt', 'resolvedAt', 'assignedResponderId', 'notes', 'createdAt', 'updatedAt'];
    await appendToCSV('emergencies.csv', emergencyData);
    
    // Broadcast emergency to all connected clients through both mechanisms
    // Via Socket.IO
    io.to('emergency-alerts').emit('new-emergency-alert', {
      type: 'new-emergency-alert',
      emergency: emergencyData
    });
    
    // Via WebSocket server
    broadcastEmergencyUpdate(emergencyData);
    
    res.status(201).json({
      success: true,
      emergency: emergencyData,
      message: 'Emergency alert created successfully'
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

// Get active emergencies
app.get('/api/v1/emergencies/active', authenticateToken, async (req, res) => {
  // Read emergencies from CSV
  const allEmergencies = await readCSV('emergencies.csv');
  
  // Return all emergencies for now (in a real implementation, filter by location/proximity)
  const activeEmergencies = allEmergencies.filter(e => e.status === 'ACTIVE');
  
  res.json({
    emergencies: activeEmergencies,
    total: activeEmergencies.length
  });
});

// Get all users (admin only)
app.get('/api/v1/users', authenticateToken, async (req, res) => {
  // Only allow admin users to fetch all users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  
  // Read users from CSV
  const users = await readCSV('users.csv');
  
  // Return users without passwords and with parsed pets
  const usersWithoutPasswords = users.map(user => {
    const { password, pets, ...userWithoutPassword } = user;
    
    // Parse pets JSON if it exists
    let parsedPets = [];
    if (pets) {
      try {
        parsedPets = JSON.parse(pets);
      } catch (e) {
        console.error('Error parsing pets JSON for user:', user.id, e);
        parsedPets = [];
      }
    }
    
    return {
      ...userWithoutPassword,
      pets: parsedPets
    };
  });
  
  res.json({
    users: usersWithoutPasswords,
    total: usersWithoutPasswords.length
  });
});

// Update emergency status
app.put('/api/v1/emergencies/:emergencyId', authenticateToken, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { status } = req.body;
    
    // Read emergencies from CSV
    let emergencies = await readCSV('emergencies.csv');
    
    // Find the emergency
    const emergencyIndex = emergencies.findIndex(e => e.emergencyId === emergencyId);
    if (emergencyIndex === -1) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    
    // Update emergency status
    emergencies[emergencyIndex].status = status;
    emergencies[emergencyIndex].updatedAt = new Date().toISOString();
    
    // Write updated emergencies back to CSV
    const headers = ['emergencyId', 'userId', 'userName', 'userPhone', 'userEmail', 'userPets', 'latitude', 'longitude', 'address', 'emergencyType', 'status', 'reportedAt', 'respondedAt', 'resolvedAt', 'assignedResponderId', 'notes', 'createdAt', 'updatedAt'];
    await writeCSV('emergencies.csv', emergencies, headers);
    
    // Broadcast emergency update via WebSocket
    broadcastEmergencyUpdate(emergencies[emergencyIndex]);
    
    res.json({
      message: 'Emergency status updated successfully',
      emergency: emergencies[emergencyIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get emergency statistics (admin only)
app.get('/api/v1/emergencies/statistics', authenticateToken, async (req, res) => {
  // Only allow admin users to fetch statistics
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  
  try {
    // Read emergencies from CSV
    const emergencies = await readCSV('emergencies.csv');
    
    // Calculate statistics
    const totalReports = emergencies.length;
    const activeReports = emergencies.filter(e => e.status === 'ACTIVE').length;
    const processedReports = emergencies.filter(e => e.status === 'RESPONDING' || e.status === 'RESOLVED').length;
    
    // Calculate average response time
    let totalResponseTime = 0;
    let validResponseCount = 0;
    
    emergencies.forEach(emergency => {
      if (emergency.reportedAt && emergency.respondedAt) {
        const reportedTime = new Date(emergency.reportedAt);
        const respondedTime = new Date(emergency.respondedAt);
        const responseTime = (respondedTime - reportedTime) / 1000; // in seconds
        
        if (responseTime >= 0) {
          totalResponseTime += responseTime;
          validResponseCount++;
        }
      }
    });
    
    const averageResponseTime = validResponseCount > 0 ? totalResponseTime / validResponseCount : 0;
    
    res.json({
      totalReports,
      activeReports,
      processedReports,
      averageResponseTime: Math.round(averageResponseTime), // in seconds
      statisticsCalculatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating emergency statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this after the other imports
const https = require('https');

// Add OpenRouteService API key from environment variables
const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY || "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjhlMGM5ZWEyNzdmNTRmMWZhN2I2ODk3YmQ3MGZjOTEyIiwiaCI6Im11cm11cjY0In0="; // Default API key
const DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

// Route to calculate shortest path using OpenRouteService
app.post('/api/v1/routes/shortest-path', async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.body;
    
    // Validate coordinates
    if (startLat === undefined || startLng === undefined || endLat === undefined || endLng === undefined) {
      return res.status(400).json({ error: 'Missing required coordinates' });
    }
    
    // Validate coordinate ranges
    if (startLat < -90 || startLat > 90 || endLat < -90 || endLat > 90 ||
        startLng < -180 || startLng > 180 || endLng < -180 || endLng > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    // Create the request body for OpenRouteService
    const requestBody = {
      coordinates: [
        [startLng, startLat], // longitude first for OpenRouteService
        [endLng, endLat]      // longitude first for OpenRouteService
      ],
      geometry: true,
      instructions: false,
      units: "km"
    };
    
    // Convert to JSON string
    const requestBodyString = JSON.stringify(requestBody);
    
    // Set up the request options
    const options = {
      method: 'POST',
      headers: {
        'Authorization': OPENROUTESERVICE_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBodyString)
      }
    };
    
    // Make the request to OpenRouteService
    const request = https.request(DIRECTIONS_URL, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            const jsonResponse = JSON.parse(data);
            
            // Extract routes from the response
            if (jsonResponse.routes && jsonResponse.routes.length > 0) {
              const route = jsonResponse.routes[0];
              
              // Extract geometry (encoded polyline)
              if (route.geometry) {
                // Return the encoded polyline - the mobile app will decode it
                res.json({
                  success: true,
                  route: route.geometry,
                  distance: route.summary?.distance,
                  duration: route.summary?.duration
                });
              } else {
                res.status(500).json({ error: 'No geometry found in the route' });
              }
            } else {
              res.status(500).json({ error: 'No routes found in the response' });
            }
          } catch (parseError) {
            console.error('Error parsing OpenRouteService response:', parseError);
            res.status(500).json({ error: 'Error parsing route data' });
          }
        } else {
          console.error('OpenRouteService request failed with status:', response.statusCode);
          console.error('Response body:', data);
          res.status(response.statusCode).json({ error: 'Route calculation failed' });
        }
      });
    });
    
    request.on('error', (error) => {
      console.error('Error making request to OpenRouteService:', error);
      res.status(500).json({ error: 'Error calculating route' });
    });
    
    // Write the request body
    request.write(requestBodyString);
    request.end();
    
  } catch (error) {
    console.error('Error calculating shortest path:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to start server with port fallback
function startServer(server, port, retries = 5) {
  // Bind to all network interfaces to accept connections from other devices
  server.listen(port, '0.0.0.0', () => {
    console.log(`HAVEN API Server running on port ${port}`);
    console.log(`Server accessible from other devices on the network`);
    // Initialize WebSocket server on the same server instance
    initializeWebSocketServer(server);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (retries > 0) {
        const nextPort = port + 1;
        console.log(`Port ${port} is already in use, trying ${nextPort}...`);
        // Try the next port
        startServer(server, nextPort, retries - 1);
      } else {
        console.error('Unable to find an available port after 5 attempts');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

