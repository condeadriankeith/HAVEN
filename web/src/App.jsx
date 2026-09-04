import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import AlertPanel from './components/AlertPanel';
import AnalyticsView from './components/AnalyticsView';
import UsersView from './components/UsersView';
import { socketService } from './services/socket';
import {
  fetchAllUsers,
  fetchActiveEmergencies,
  updateEmergencyStatus,
  calculateShortestPath,
} from './services/api';
import './App.css';

const DEFAULT_VET_LAT = 10.6765;
const DEFAULT_VET_LNG = 122.9509;

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [isConnected, setIsConnected] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [users, setUsers] = useState([]);

  // Analytics counters
  const [totalReports, setTotalReports] = useState(0);
  const [resolvedReports, setResolvedReports] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);

  // Helper to extract location lat/lng
  const extractCoordinates = (data) => {
    let lat = DEFAULT_VET_LAT;
    let lng = DEFAULT_VET_LNG;

    if (data.location && data.location.latitude !== undefined && data.location.longitude !== undefined) {
      lat = parseFloat(data.location.latitude);
      lng = parseFloat(data.location.longitude);
    } else if (data.latitude !== undefined && data.longitude !== undefined) {
      lat = parseFloat(data.latitude);
      lng = parseFloat(data.longitude);
    } else if (data.emergency && data.emergency.location) {
      lat = parseFloat(data.emergency.location.latitude);
      lng = parseFloat(data.emergency.location.longitude);
    }

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      lat = DEFAULT_VET_LAT;
      lng = DEFAULT_VET_LNG;
    }

    return { lat, lng };
  };

  // Process raw emergency data into uniform structure
  const formatEmergency = (raw) => {
    const coords = extractCoordinates(raw);
    const id = raw.emergencyId || raw.id || `EMG-${Date.now().toString().slice(-4)}`;
    const title = raw.emergencyType || raw.type || 'Pet Emergency';
    const description = raw.notes || raw.additionalDetails || raw.description || 'Emergency reported by owner';
    const owner = raw.userName || (raw.contactInfo && raw.contactInfo.name) || 'Pet Owner';
    const contactInfo = raw.userPhone
      ? raw.userEmail ? `${raw.userPhone} / ${raw.userEmail}` : raw.userPhone
      : raw.userEmail || '';
    const pets = raw.userPets || raw.pets || '[]';
    const status = raw.status || 'ACTIVE';

    // Calculate approximate fee based on Euclidean distance for demo
    const dist = Math.sqrt(Math.pow(coords.lat - DEFAULT_VET_LAT, 2) + Math.pow(coords.lng - DEFAULT_VET_LNG, 2)) * 111;
    const emergencyFee = Math.round(dist * 50) + 100;

    return {
      id,
      title,
      description,
      owner,
      contactInfo,
      pets,
      lat: coords.lat,
      lng: coords.lng,
      status,
      emergencyFee: emergencyFee > 0 ? emergencyFee : 150,
      raw,
    };
  };

  // Handle new incoming emergency
  const handleNewEmergency = useCallback((rawEmergency) => {
    const formatted = formatEmergency(rawEmergency);
    setEmergencies((prev) => {
      // Avoid duplicate emergencies
      const exists = prev.some((e) => e.id === formatted.id);
      if (exists) return prev;
      return [formatted, ...prev];
    });
    setTotalReports((prev) => prev + 1);
  }, []);

  // Handle status update
  const handleStatusChange = useCallback((rawEmergency) => {
    const updated = formatEmergency(rawEmergency);
    if (updated.status === 'RESPONDED' || updated.status === 'RESOLVED') {
      setEmergencies((prev) => prev.filter((e) => e.id !== updated.id));
      setSelectedEmergency((prev) => (prev && prev.id === updated.id ? null : prev));
      setRouteCoordinates([]);
      setResolvedReports((prev) => prev + 1);
      setTotalResponseTime((prev) => prev + 180); // add 3 mins
    }
  }, []);

  // Fetch initial data
  const loadInitialData = async () => {
    const activeData = await fetchActiveEmergencies();
    if (Array.isArray(activeData)) {
      const formattedList = activeData.map(formatEmergency);
      setEmergencies(formattedList);
      setTotalReports(formattedList.length);
    }

    const userData = await fetchAllUsers();
    setUsers(userData);
  };

  useEffect(() => {
    loadInitialData();

    socketService.connect((connected) => {
      setIsConnected(connected);
    });

    socketService.onNewEmergency((data) => {
      handleNewEmergency(data);
    });

    socketService.onStatusChange((data) => {
      handleStatusChange(data);
    });

    return () => {
      socketService.disconnect();
    };
  }, [handleNewEmergency, handleStatusChange]);

  // Handle selecting an emergency to calculate route
  const handleSelectEmergency = async (emergency) => {
    if (selectedEmergency && selectedEmergency.id === emergency.id) {
      setSelectedEmergency(null);
      setRouteCoordinates([]);
      return;
    }

    setSelectedEmergency(emergency);
    setRouteCoordinates([]);

    // Calculate route from Vet HQ to emergency
    const routeRes = await calculateShortestPath(
      DEFAULT_VET_LAT,
      DEFAULT_VET_LNG,
      emergency.lat,
      emergency.lng
    );

    if (routeRes && routeRes.route) {
      // Decode or build route polyline points
      if (Array.isArray(routeRes.route)) {
        setRouteCoordinates(routeRes.route);
      } else {
        // Simple direct line fallback if encoded polyline
        setRouteCoordinates([
          [DEFAULT_VET_LAT, DEFAULT_VET_LNG],
          [emergency.lat, emergency.lng],
        ]);
      }
    } else {
      // Fallback straight line
      setRouteCoordinates([
        [DEFAULT_VET_LAT, DEFAULT_VET_LNG],
        [emergency.lat, emergency.lng],
      ]);
    }
  };

  // Mark emergency as responded
  const handleMarkResponded = async (emergency) => {
    await updateEmergencyStatus(emergency.id, 'RESPONDED');
    socketService.emitStatusUpdate(emergency.id, 'RESPONDED');

    setEmergencies((prev) => prev.filter((e) => e.id !== emergency.id));
    if (selectedEmergency && selectedEmergency.id === emergency.id) {
      setSelectedEmergency(null);
      setRouteCoordinates([]);
    }
    setResolvedReports((prev) => prev + 1);
    setTotalResponseTime((prev) => prev + 180);
  };

  const avgResponseSeconds =
    resolvedReports > 0 ? Math.round(totalResponseTime / resolvedReports) : 0;

  return (
    <div className="haven-app-layout">
      <Header isConnected={isConnected} />

      <div className="haven-main-body">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="haven-content-area">
          {activeTab === 'map' && (
            <div className="map-page-layout">
              <MapView
                emergencies={emergencies}
                selectedEmergency={selectedEmergency}
                routeCoordinates={routeCoordinates}
                onSelectEmergency={handleSelectEmergency}
              />
              <AlertPanel
                emergencies={emergencies}
                selectedEmergency={selectedEmergency}
                onSelectEmergency={handleSelectEmergency}
                onMarkResponded={handleMarkResponded}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              totalReports={totalReports}
              activeReports={emergencies.length}
              resolvedReports={resolvedReports}
              avgResponseSeconds={avgResponseSeconds}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              users={users}
              onRefresh={async () => {
                const refreshed = await fetchAllUsers();
                setUsers(refreshed);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
