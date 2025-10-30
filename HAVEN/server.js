const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

// Import CSV handler
const { readCSV, writeCSV, appendToCSV } = require('./csvHandler');

// Import WebSocket server
const { initializeWebSocketServer, broadcastEmergencyUpdate } = require('./websocketServer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'haven_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

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

// Helper function to generate emergency IDs
async function generateEmergencyId() {
  const emergencies = await readCSV('emergencies.csv');
  // Find the highest existing emergency ID
  let maxId = 0;
  emergencies.forEach(emergency => {
    const numPart = parseInt(emergency.id);
    if (!isNaN(numPart) && numPart > maxId) {
      maxId = numPart;
    }
  });
  
  // Return the next ID
  return String(maxId + 1);
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

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'HAVEN Pet Emergency Response System API' });
});

// User registration
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, address } = req.body;

    // Read users from CSV
    const users = await readCSV('users.csv');
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
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
      address,
      role: 'pet_owner',
      password: hashedPassword
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Read users from CSV
    const users = await readCSV('users.csv');
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
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

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    role: user.role
  });
});

// Create emergency alert
app.post('/api/v1/emergencies/alert', authenticateToken, async (req, res) => {
  try {
    const { type, severity, description, location } = req.body;

    // Create new emergency
    const newEmergency = {
      id: await generateEmergencyId(),
      userId: req.user.userId,
      type,
      severity: severity || 'moderate',
      description,
      status: 'new',
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      address: location?.address || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save emergency to CSV
    await appendToCSV('emergencies.csv', newEmergency);
    
    // Broadcast emergency update via WebSocket
    broadcastEmergencyUpdate(newEmergency);

    res.status(201).json({
      emergencyId: newEmergency.id,
      status: newEmergency.status,
      estimatedResponseTime: '5-10 minutes'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active emergencies
app.get('/api/v1/emergencies/active', authenticateToken, async (req, res) => {
  // Read emergencies from CSV
  const allEmergencies = await readCSV('emergencies.csv');
  
  // Return all emergencies for now (in a real implementation, filter by location/proximity)
  const activeEmergencies = allEmergencies.filter(e => e.status !== 'resolved');
  
  res.json({
    emergencies: activeEmergencies,
    total: activeEmergencies.length
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
    const emergencyIndex = emergencies.findIndex(e => e.id === emergencyId);
    if (emergencyIndex === -1) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    
    // Update emergency status
    emergencies[emergencyIndex].status = status;
    emergencies[emergencyIndex].updatedAt = new Date().toISOString();
    
    // Write updated emergencies back to CSV
    const headers = ['id', 'userId', 'type', 'severity', 'description', 'status', 'latitude', 'longitude', 'address', 'createdAt', 'updatedAt'];
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

// Start server
server.listen(PORT, () => {
  console.log(`HAVEN API Server running on port ${PORT}`);
  // Initialize WebSocket server
  initializeWebSocketServer(server);
});