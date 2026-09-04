import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import AlertPanel from './components/AlertPanel';
import AnalyticsView from './components/AnalyticsView';
import UsersView from './components/UsersView';
import SimulateAlertModal from './components/SimulateAlertModal';
import ToastContainer from './components/ToastContainer';
import { useEmergencies } from './hooks/useEmergencies';
import { fetchAllUsers } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('map');
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

  // Handle map click location pick
  const handleMapLocationPicked = (latlng) => {
    setPickedLocation({ lat: latlng.lat, lng: latlng.lng });
    addToast({
      type: 'info',
      title: 'Target Acquired via Map',
      message: `Selected GPS: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
    });
    setIsSimulateModalOpen(true);
  };

  return (
    <div className="haven-app-layout">
      {/* Tactical Command Center Header */}
      <Header
        isConnected={isConnected}
        soundEnabled={soundEnabled}
        activeCount={emergencies.length}
        onToggleSound={toggleSound}
        onOpenSimulateModal={() => {
          setPickedLocation(null);
          setIsSimulateModalOpen(true);
        }}
      />

      <div className="haven-main-body">
        {/* Left Vertical Navigation Menu */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertCount={emergencies.length}
        />

        {/* Dynamic Center Work Area */}
        <main className="haven-content-area">
          {activeTab === 'map' && (
            <div className="map-page-layout">
              <MapView
                emergencies={emergencies}
                selectedEmergency={selectedEmergency}
                routeCoordinates={routeCoordinates}
                routeInfo={routeInfo}
                onSelectEmergency={selectEmergency}
                onLocationPicked={handleMapLocationPicked}
              />
              <AlertPanel
                emergencies={emergencies}
                selectedEmergency={selectedEmergency}
                onSelectEmergency={selectEmergency}
                onMarkResponded={markResponded}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView stats={stats} />
          )}

          {activeTab === 'users' && (
            <UsersView
              users={users}
              onRefresh={loadUsers}
            />
          )}
        </main>
      </div>

      {/* Interactive Emergency Dispatch Simulator */}
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

      {/* Floating Tactical Toast HUD */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
