import React from 'react';
import { Radar, BarChart3, Users } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, activeAlertCount }) => {
  return (
    <nav className="haven-sidebar" aria-label="Main Navigation">
      <div className="sidebar-menu">
        <button
          className={`sidebar-nav-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
          title="Live Incident Radar & Map"
        >
          <Radar size={22} />
          {activeAlertCount > 0 && (
            <span className="brand-badge" style={{ position: 'absolute', top: 4, right: 4, fontSize: '0.6rem', padding: '1px 4px' }}>
              {activeAlertCount}
            </span>
          )}
          <span className="nav-label">Radar</span>
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          title="Operational Analytics & Response Metrics"
        >
          <BarChart3 size={22} />
          <span className="nav-label">Analytics</span>
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          title="Directory of Pet Owners & Responders"
        >
          <Users size={22} />
          <span className="nav-label">Directory</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
