# HAVEN Technical Specification Document

## 1. Core Application Architecture

### 1.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HAVEN System Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Mobile App Layer          API Gateway        Desktop App Layer│
│  ┌─────────────────┐       ┌────────────┐     ┌────────────────┐│
│  │ React Native    │◄──────┤ REST API   ├────►│ Java Swing     ││
│  │ (Expo Go)       │       │ Server     │     │ Desktop App    ││
│  └────────┬────────┘       └─────┬──────┘     └────────┬───────┘│
│           │                      │                      │      │
│           ▼                      ▼                      ▼      │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    Firebase Cloud Platform                 ││
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  ││
│  │  │Authentication│  │Real-time DB  │  │Cloud Functions   │  ││
│  │  │(Firebase Auth)│  │(Firestore)   │  │(Serverless)      │  ││
│  │  └─────────────┘  └──────────────┘  └──────────────────┘  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│  External Services:                                             │
│  - Google Maps API / Mapbox                                    │
│  - Firebase Cloud Messaging                                    │
│  - VoIP/Telephony Services                                     │
│  - Email/SMS Services                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Specification

#### Frontend Technologies
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| Mobile App | React Native (Expo) | SDK 49+ | Cross-platform development, rapid prototyping |
| Desktop App | Java Swing | Java SE 17 | Mature UI framework, enterprise-ready |
| UI Framework | Material-UI / Native Base | Latest | Consistent design system |
| State Management | React Context / Redux | Latest | Scalable state management |

#### Backend Technologies
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| API Server | Node.js / Express | 18.x | High performance, large ecosystem |
| Real-time Database | Firebase Firestore | Latest | Real-time synchronization |
| Authentication | Firebase Auth | Latest | Secure, multi-provider support |
| Cloud Functions | Firebase Functions | Latest | Serverless architecture |

#### Infrastructure & DevOps
| Component | Technology | Configuration |
|-----------|------------|---------------|
| Cloud Platform | Firebase / Google Cloud | Multi-region deployment |
| CI/CD | GitHub Actions | Automated testing & deployment |
| Monitoring | Firebase Analytics | User behavior tracking |
| Error Tracking | Sentry | Real-time error monitoring |

### 1.3 Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HAVEN Microservices                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐│
│  │ Alert Service   │    │ User Service    │    │ Map Service││
│  │ - Emergency     │    │ - Registration  │    │ - Location ││
│  │   alerts        │    │ - Profile       │    │ - Routing  ││
│  │ - Notifications │    │ - Auth          │    │ - Geocoding││
│  └────────┬────────┘    └────────┬────────┘    └─────┬──────┘│
│           │                      │                  │      │
│           ▼                      ▼                  ▼      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Message Queue (Firebase)                 ││
│  └─────────────────────────────────────────────────────────┘│
│           │                      │                  │      │
│           ▼                      ▼                  ▼      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐│
│  │ Analytics       │    │ Communication   │    │ Admin    ││
│  │ Service         │    │ Service         │    │ Service  ││
│  │ - Metrics       │    │ - VoIP/SMS      │    │ - User   ││
│  │ - Reports       │    │ - Email         │    │   Mgmt   ││
│  │ - Dashboard     │    │ - Push          │    │ - Roles  ││
│  └─────────────────┘    └─────────────────┘    └──────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 2. Database Schema Design

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │      PETS       │    │   EMERGENCIES   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ user_id (PK)    │◄───┤ pet_id (PK)     │◄───┤ emergency_id   │
│ email           │    │ user_id (FK)    │    │ user_id (FK)    │
│ phone           │    │ name            │    │ pet_id (FK)     │
│ first_name      │    │ species         │    │ type            │
│ last_name       │    │ breed           │    │ severity        │
│ address         │    │ age             │    │ location        │
│ coordinates     │    │ color           │    │ status          │
│ role            │    │ medical_notes   │    │ description     │
│ verified        │    │ photo_url       │    │ created_at      │
│ created_at      │    │ created_at      │    │ updated_at      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                       │                       │
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  RESPONSE_UNITS │    │   INCIDENTS     │    │   RESPONSES     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ unit_id (PK)    │    │ incident_id     │    │ response_id     │
│ name            │    │ emergency_id    │    │ emergency_id    │
│ type            │    │ unit_id (FK)    │    │ unit_id (FK)    │
│ contact_person  │    │ assigned_at     │    │ responder_id    │
│ phone           │    │ status          │    │ status          │
│ email           │    │ notes           │    │ notes           │
│ coverage_area   │    │ resolved_at     │    │ arrived_at      │
│ coordinates     │    │ created_at      │    │ created_at      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Table Structures

#### Users Table
```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT,
    coordinates POINT,
    role ENUM('pet_owner', 'responder', 'admin') DEFAULT 'pet_owner',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_coordinates (coordinates),
    INDEX idx_role_verified (role, verified)
);
```

#### Pets Table
```sql
CREATE TABLE pets (
    pet_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    species ENUM('dog', 'cat', 'bird', 'rabbit', 'other') NOT NULL,
    breed VARCHAR(100),
    age INT,
    color VARCHAR(50),
    medical_notes TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_species (species),
    INDEX idx_user_species (user_id, species)
);
```

#### Emergencies Table
```sql
CREATE TABLE emergencies (
    emergency_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    pet_id VARCHAR(50),
    type ENUM('injury', 'illness', 'lost', 'rescue', 'distress', 'other') NOT NULL,
    severity ENUM('critical', 'urgent', 'moderate', 'low') DEFAULT 'moderate',
    location POINT NOT NULL,
    address TEXT,
    status ENUM('new', 'acknowledged', 'dispatched', 'in_progress', 'resolved', 'cancelled') DEFAULT 'new',
    description TEXT,
    photo_urls JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_type_severity (type, severity),
    INDEX idx_location (location),
    INDEX idx_created_at (created_at),
    INDEX idx_status_created (status, created_at)
);
```

### 2.3 Indexes and Constraints

#### Performance Indexes
```sql
-- Spatial index for location-based queries
CREATE SPATIAL INDEX idx_emergencies_location ON emergencies(location);

-- Composite indexes for common queries
CREATE INDEX idx_emergencies_active ON emergencies(status, created_at) WHERE status IN ('new', 'acknowledged', 'dispatched', 'in_progress');

-- Full-text search index
CREATE FULLTEXT INDEX idx_emergencies_description ON emergencies(description);
```

#### Data Integrity Constraints
```sql
-- Ensure valid coordinate ranges
ALTER TABLE users ADD CONSTRAINT chk_coordinates CHECK (
    ST_X(coordinates) BETWEEN -180 AND 180 AND 
    ST_Y(coordinates) BETWEEN -90 AND 90
);

-- Ensure emergency locations are valid
ALTER TABLE emergencies ADD CONSTRAINT chk_emergency_location CHECK (
    ST_X(location) BETWEEN -180 AND 180 AND 
    ST_Y(location) BETWEEN -90 AND 90
);
```

### 2.4 Data Migration Strategy

#### Phase 1: Schema Migration
1. Create new schema with proper indexing
2. Migrate existing user data with data validation
3. Set up real-time sync between old and new systems
4. Validate data integrity post-migration

#### Phase 2: Application Migration
1. Deploy new API endpoints alongside existing ones
2. Gradually redirect traffic to new endpoints
3. Monitor performance and error rates
4. Complete cutover once stability is confirmed

## 3. API Endpoints Specification

### 3.1 RESTful API Documentation

#### Authentication Endpoints
```http
### User Registration
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St, City, State"
}

Response: 201 Created
{
  "userId": "usr_123456789",
  "email": "user@example.com",
  "verificationRequired": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

```http
### User Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "userId": "usr_123456789",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_123...",
  "expiresIn": 3600,
  "role": "pet_owner"
}
```

#### Emergency Alert Endpoints
```http
### Send Emergency Alert
POST /api/v1/emergencies/alert
Authorization: Bearer {token}
Content-Type: application/json

{
  "petId": "pet_123456789",
  "type": "injury",
  "severity": "critical",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "description": "Dog hit by car, bleeding heavily"
}

Response: 201 Created
{
  "emergencyId": "emr_987654321",
  "status": "new",
  "estimatedResponseTime": "5-10 minutes",
  "trackingCode": "HVN-2024-001234"
}
```

```http
### Get Active Emergencies
GET /api/v1/emergencies/active?radius=10&lat=14.5995&lng=120.9842
Authorization: Bearer {token}

Response: 200 OK
{
  "emergencies": [
    {
      "emergencyId": "emr_987654321",
      "type": "injury",
      "severity": "critical",
      "location": {
        "latitude": 14.5995,
        "longitude": 120.9842
      },
      "status": "dispatched",
      "createdAt": "2024-01-15T10:30:00Z",
      "distance": 2.3
    }
  ],
  "total": 1
}
```

### 3.2 Rate Limiting Specifications

#### Rate Limiting Rules
| Endpoint | Rate Limit | Window | Burst Allowance |
|----------|------------|---------|-----------------|
| Authentication | 5 requests/min | 60s | 10 requests |
| Emergency Alert | 3 requests/hour | 3600s | 5 requests |
| General API | 100 requests/min | 60s | 200 requests |
| File Upload | 10 requests/min | 60s | 20 requests |

#### Throttling Implementation
```javascript
// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const emergencyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'Emergency alert limit exceeded',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 3.3 Authentication Requirements

#### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "usr_123456789",
    "email": "user@example.com",
    "role": "pet_owner",
    "permissions": ["read:emergencies", "create:emergency", "update:profile"],
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

#### Role-Based Access Control
| Role | Permissions |
|------|-------------|
| pet_owner | Create emergencies, view own history, update profile |
| responder | View all emergencies, update emergency status, contact users |
| admin | Full system access, user management, analytics, system configuration |

## 4. UI/UX Component Breakdown

### 4.1 Component Hierarchy

```
Mobile App Component Tree:
┌─────────────────────────────────────────────────────────────┐
│                         App                                 │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐│
│ │                    NavigationContainer                 ││
│ └─────────────────────┬──────────────────────────────────┘│
│                       │                                   │
│ ┌─────────────────────▼──────────────────────────────────┐│
│ │                    TabNavigator                        ││
│ └─────┬──────────┬──────────┬──────────┬────────────────┘│
│       │          │          │          │                 │
│ ┌─────▼──┐ ┌───▼────┐ ┌───▼────┐ ┌──▼────┐ ┌────▼────┐│
│ │Home    │ │Report  │ │Map     │ │History│ │Profile  ││
│ │Screen  │ │Screen  │ │Screen  │ │Screen │ │Screen  ││
│ └─────┬──┘ └───┬────┘ └───┬────┘ └──┬────┘ └────┬────┘│
│       │        │          │         │           │       │
│ ┌─────▼──┐ ┌───▼────┐ ┌───▼────┐ ┌──▼────┐ ┌────▼────┐│
│ │Emergency│ │Incident│ │MapView │ │Incident│ │UserInfo ││
│ │Button   │ │Form    │ │        │ │List   │ │        ││
│ └────────┘ └────────┘ └────────┘ └───────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Design System Documentation

#### Color Palette
```css
:root {
  /* Primary Colors */
  --emergency-red: #FF3B30;
  --emergency-red-dark: #D32F2F;
  --emergency-red-light: #FF5252;
  
  /* Secondary Colors */
  --system-blue: #2D9CDB;
  --system-green: #27AE60;
  --system-yellow: #F2C94C;
  
  /* Neutral Colors */
  --background-dark: #121212;
  --background-light: #FFFFFF;
  --text-primary: #212121;
  --text-secondary: #757575;
  --divider: #E0E0E0;
  
  /* Status Colors */
  --status-critical: #FF3B30;
  --status-urgent: #FF9800;
  --status-moderate: #FFC107;
  --status-low: #4CAF50;
  --status-resolved: #8BC34A;
}
```

#### Typography System
```css
/* Font Families */
--font-header: 'Montserrat', sans-serif;
--font-body: 'Inter', sans-serif;

/* Font Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;

/* Font Weights */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

#### Spacing System
```css
/* Base spacing unit: 8px */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 40px;
--space-6: 48px;
--space-8: 64px;
--space-10: 80px;
```

### 4.3 Responsive Behavior Specifications

#### Mobile Breakpoints
```css
/* Mobile First Approach */
/* Base styles for mobile devices */
@media (min-width: 320px) { /* Small phones */ }
@media (min-width: 375px) { /* Large phones */ }
@media (min-width: 414px) { /* Extra large phones */ }
@media (min-width: 768px) { /* Tablets */ }
@media (min-width: 1024px) { /* Small desktops */ }
```

#### Component Responsive Behavior
| Component | Mobile (< 768px) | Tablet (768px - 1024px) | Desktop (> 1024px) |
|-----------|------------------|-------------------------|-------------------|
| Emergency Button | Full width, 80px height | 300px width, 100px height | 350px width, 120px height |
| Map Container | Full screen, 300px height | 70% width, 400px height | 800px width, 600px height |
| Form Fields | 100% width | 80% width | 60% width |
| Navigation | Bottom tab bar | Bottom tab bar | Side navigation |

### 4.4 Component Props and State Requirements

#### EmergencyButton Component
```typescript
interface EmergencyButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  animationDuration?: number;
}

interface EmergencyButtonState {
  isPressed: boolean;
  isAnimating: boolean;
  pressDuration: number;
  confirmationVisible: boolean;
}
```

#### MapView Component
```typescript
interface MapViewProps {
  initialRegion: Region;
  emergencies: Emergency[];
  userLocation: Coordinate;
  showUserLocation?: boolean;
  onEmergencyPress?: (emergency: Emergency) => void;
  onRegionChange?: (region: Region) => void;
  clusteringEnabled?: boolean;
  maxZoomLevel?: number;
}

interface MapViewState {
  region: Region;
  selectedEmergency: Emergency | null;
  isLoading: boolean;
  mapType: 'standard' | 'satellite' | 'hybrid';
  userTrackingMode: 'none' | 'follow' | 'followWithHeading';
}
```