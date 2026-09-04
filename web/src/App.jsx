import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import Map3DView from './components/Map3DView';
import AlertPanel from './components/AlertPanel';
import RouteTimelineHUD from './components/RouteTimelineHUD';
import FloatingIncidentCard from './components/FloatingIncidentCard';
import AnalyticsView from './components/AnalyticsView';
import UsersView from './components/UsersView';
import SimulateAlertModal from './components/SimulateAlertModal';
import ToastContainer from './components/ToastContainer';
import { useEmergencies } from './hooks/useEmergencies';
import { fetchAllUsers } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [mapMode, setMapMode] = useState('2D'); // '2D' or '3D'
  const [users, setUsers] = useState([]);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);

  const {
    emergencies,
    selectedEmergency,
    routeCoordinates,
    routeInfo,
    isConnected,
    toasts,
    stats,
    soundEnabled,
    hasUnattendedAlert,
    toggleSound,
    selectEmergency,
    markResponded,
    dismissToast,
    addToast,
    reload,
  } = useEmergencies();

  const loadUsers = useCallback(async () => {
    const userData = await fetchAllUsers();
    if (userData) {
      setUsers(userData);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchAllUsers().then((userData) => {
      if (active && userData) {
        setUsers(userData);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync distress perimeter pulse to root element
  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      if (hasUnattendedAlert) {
        rootEl.classList.add('emergency-distress-active');
      } else {
        rootEl.classList.remove('emergency-distress-active');
      }
    }
  }, [hasUnattendedAlert]);

  // Handle map click location pick from either 2D or 3D view
  const handleMapLocationPicked = (latlng) => {
    setPickedLocation({ lat: latlng.lat, lng: latlng.lng });
    addToast({
      type: 'info',
      title: 'GPS Point Picked',
      message: `Coordinates: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
    });
    setIsSimulateModalOpen(true);
  };

  return (
    <div className="haven-outer-canvas">
      {/* Floating Master Application Window matching Reference 2 ("outletbuddy") */}
      <div className="haven-master-frame">
        {/* Top Header with Frosted Glass Pills (Reference 3) */}
        <Header
          isConnected={isConnected}
          soundEnabled={soundEnabled}
          activeCount={emergencies.length}
          mapMode={mapMode}
          onToggleMapMode={(mode) => setMapMode(mode)}
          onToggleSound={toggleSound}
          onOpenSimulateModal={() => {
            setPickedLocation(null);
            setIsSimulateModalOpen(true);
          }}
        />

        <div className="haven-frame-body">
          {/* Left Mini Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeAlertCount={emergencies.length}
          />

          {/* Main Content Arena */}
          <div className="haven-viewport-content">
            {activeTab === 'map' && (
              <div className="ref2-split-dashboard">
                {/* Left Panel: Incident Directory matching Reference 2 ("outletbuddy") */}
                <AlertPanel
                  emergencies={emergencies}
                  selectedEmergency={selectedEmergency}
                  onSelectEmergency={selectEmergency}
                  onMarkResponded={markResponded}
                />

                {/* Center / Right Map Area */}
                <div className="ref2-map-viewport">
                  {mapMode === '3D' ? (
                    <Map3DView
                      emergencies={emergencies}
                      selectedEmergency={selectedEmergency}
                      routeCoordinates={routeCoordinates}
                      routeInfo={routeInfo}
                      onSelectEmergency={selectEmergency}
                      onLocationPicked={handleMapLocationPicked}
                    />
                  ) : (
                    <MapView
                      emergencies={emergencies}
                      selectedEmergency={selectedEmergency}
                      routeCoordinates={routeCoordinates}
                      routeInfo={routeInfo}
                      onSelectEmergency={selectEmergency}
                      onLocationPicked={handleMapLocationPicked}
                    />
                  )}

                  {/* Reference 1: Turn-by-turn Navigation Route Timeline HUD */}
                  {selectedEmergency && routeInfo && (
                    <RouteTimelineHUD
                      selectedEmergency={selectedEmergency}
                      routeInfo={routeInfo}
                    />
                  )}

                  {/* Reference 2: Floating Incident Detail Card */}
                  {selectedEmergency && (
                    <FloatingIncidentCard
                      emergency={selectedEmergency}
                      routeInfo={routeInfo}
                      onClose={() => selectEmergency(null)}
                      onRespond={markResponded}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && <AnalyticsView stats={stats} />}

            {activeTab === 'users' && <UsersView users={users} onRefresh={loadUsers} />}
          </div>
        </div>
      </div>

      {/* Emergency Dispatch Simulator Modal */}
      <SimulateAlertModal
        isOpen={isSimulateModalOpen}
        customLocation={pickedLocation}
        onClose={() => {
          setIsSimulateModalOpen(false);
          setPickedLocation(null);
        }}
        onAlertDispatched={() => {
          reload();
        }}
      />

      {/* Tactical HUD Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
