const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'haven_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in a real implementation, this would be Firebase or a real database)
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    phone: '123-456-7890',
    firstName: 'Admin',
    lastName: 'User',
    address: '123 Main St',
    role: 'admin',
    password: '$2a$10$XrC4B8CGu97y4QqIg5b3X.wO/bh.BMbixWWpjhgW2s9uFCYDXOFMG' // admin123
  }
];

const emergencies = [];

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

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      email,
      phone,
      firstName,
      lastName,
      address,
      role: 'pet_owner',
      password: hashedPassword
    };

    users.push(newUser);

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
app.get('/api/v1/users/profile', authenticateToken, (req, res) => {
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
app.post('/api/v1/emergencies/alert', authenticateToken, (req, res) => {
  try {
    const { type, severity, description, location } = req.body;

    // Create new emergency
    const newEmergency = {
      id: String(emergencies.length + 1),
      userId: req.user.userId,
      type,
      severity: severity || 'moderate',
      location: location || { latitude: 0, longitude: 0 },
      address: location?.address || '',
      status: 'new',
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    emergencies.push(newEmergency);

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
app.get('/api/v1/emergencies/active', authenticateToken, (req, res) => {
  // Return all emergencies for now (in a real implementation, filter by location/proximity)
  res.json({
    emergencies: emergencies.filter(e => e.status !== 'resolved'),
    total: emergencies.filter(e => e.status !== 'resolved').length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`HAVEN API Server running on port ${PORT}`);
});