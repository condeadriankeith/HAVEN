import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import AlertPanel from './components/AlertPanel';
import AnalyticsView from './components/AnalyticsView';
import UsersView from './components/UsersView';
import SimulateAlertModal from './components/SimulateAlertModal';
import { useEmergencies } from './hooks/useEmergencies';
import { fetchAllUsers } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [users, setUsers] = useState([]);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  const {
    emergencies,
    selectedEmergency,
    routeCoordinates,
    routeInfo,
    isConnected,
    stats,
    soundEnabled,
    toggleSound,
    selectEmergency,
    markResponded,
    reload,
  } = useEmergencies();

  // Load user directory
  const loadUsers = async () => {
    const userData = await fetchAllUsers();
    setUsers(userData);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="haven-app-layout">
      {/* Command Center Top Navigation */}
      <Header
        isConnected={isConnected}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
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

      {/* SOS Emergency Simulator Modal */}
      <SimulateAlertModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onAlertDispatched={() => {
          reload();
        }}
      />
    </div>
  );
}

export default App;
