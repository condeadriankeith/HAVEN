import React from 'react';
import { Radar, BarChart3, Users } from 'lucide-react';
import { playClickFeedback } from '../utils/sound';

const Sidebar = ({ activeTab, setActiveTab, activeAlertCount = 0 }) => {
  const handleTabClick = (tab) => {
    playClickFeedback();
    setActiveTab(tab);
  };

  return (
    <nav className="haven-sidebar" aria-label="Main Navigation">
      <div className="sidebar-menu">
        <button
          className={`sidebar-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => handleTabClick('map')}
          title="Live Incident Radar & Map"
        >
          <Radar size={22} />
          {activeAlertCount > 0 && (
            <span className="sidebar-badge">
              {activeAlertCount}
            </span>
          )}
          <span className="btn-caption">Radar</span>
        </button>

        <button
          className={`sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabClick('analytics')}
          title="Operational Telemetry & Performance"
        >
          <BarChart3 size={22} />
          <span className="btn-caption">Analytics</span>
        </button>

        <button
          className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabClick('users')}
          title="Responder & Pet Owner Directory"
        >
          <Users size={22} />
          <span className="btn-caption">Directory</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
