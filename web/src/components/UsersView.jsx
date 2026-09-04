import React, { useState } from 'react';
import { Users, RefreshCw, Search, Mail, Phone, ShieldCheck, UserCheck } from 'lucide-react';

const UsersView = ({ users = [], onRefresh }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const parsePets = (petsData) => {
    if (!petsData) return null;
    try {
      const pets = typeof petsData === 'string' ? JSON.parse(petsData) : petsData;
      if (!Array.isArray(pets) || pets.length === 0) return null;
      return pets.map((p, i) => (
        <span key={i} className="pet-pill">
          {p.name || 'Pet'} ({p.breed || p.type || 'Breed'})
        </span>
      ));
    } catch {
      if (typeof petsData === 'string' && petsData.trim().length > 0) {
        return <span className="pet-pill">{petsData}</span>;
      }
      return null;
    }
  };

  const filteredUsers = users.filter((u) => {
    // Role filter
    if (activeTab === 'responders' && u.role !== 'admin' && u.role !== 'responder') {
      return false;
    }
    if (activeTab === 'owners' && u.role !== 'pet_owner') {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const pets = JSON.stringify(u.pets || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || pets.includes(q);
    }
    return true;
  });

  return (
    <div className="users-view-container">
      <div className="users-header">
        <div className="users-title-wrap">
          <Users size={24} className="text-red" />
          <h2>Personnel & Pet Owner Directory ({users.length})</h2>
        </div>

        <div className="users-controls">
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone, pet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className={`btn-refresh ${isRefreshing ? 'spinning' : ''}`}
            onClick={handleRefreshClick}
            title="Refresh Directory"
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      <div className="users-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Accounts ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'responders' ? 'active' : ''}`}
          onClick={() => setActiveTab('responders')}
        >
          Responders & Admins ({users.filter((u) => u.role === 'admin' || u.role === 'responder').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'owners' ? 'active' : ''}`}
          onClick={() => setActiveTab('owners')}
        >
          Pet Owners ({users.filter((u) => u.role === 'pet_owner').length})
        </button>
      </div>

      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Role</th>
              <th>Registered Pets</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                  No matching user accounts found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const pets = parsePets(user.pets);
                return (
                  <tr key={user.id || user.email}>
                    <td className="user-id-cell">{user.id || 'N/A'}</td>
                    <td>
                      <strong style={{ color: '#fff' }}>
                        {user.firstName} {user.lastName}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Mail size={12} /> {user.email}
                        </span>
                        {user.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-dim)' }}>
                            <Phone size={12} /> {user.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role || 'pet_owner'}`}>
                        {user.role === 'admin' || user.role === 'responder' ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <UserCheck size={12} />
                        )}
                        {user.role ? user.role.replace('_', ' ') : 'pet owner'}
                      </span>
                    </td>
                    <td>
                      {pets ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {pets}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersView;
