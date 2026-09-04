import React from 'react';
import { Map, BarChart3, Users } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="haven-sidebar">
      <div className="sidebar-menu">
        <button
          className={`sidebar-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
          title="Map View"
        >
          <Map size={24} />
          <span className="btn-label">Map</span>
        </button>

        <button
          className={`sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          title="Analytics"
        >
          <BarChart3 size={24} />
          <span className="btn-label">Analytics</span>
        </button>

        <button
          className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          title="Users Directory"
        >
          <Users size={24} />
          <span className="btn-label">Users</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
