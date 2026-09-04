import React, { useState } from 'react';
import { Users, RefreshCw, PawPrint, Mail, Phone, Shield } from 'lucide-react';

const UsersView = ({ users, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const parsePets = (petsData) => {
    if (!petsData) return 'No pets';
    try {
      const pets = typeof petsData === 'string' ? JSON.parse(petsData) : petsData;
      if (!Array.isArray(pets) || pets.length === 0) return 'No pets';
      return pets
        .map((p) => {
          const name = p.name || 'Unknown';
          const breed = p.breed ? ` (${p.breed} ${p.type || ''})` : ` (${p.type || 'Pet'})`;
          return `${name}${breed}`;
        })
        .join(', ');
    } catch (e) {
      return typeof petsData === 'string' ? petsData : 'No pets';
    }
  };

  const filteredUsers = activeTab === 'all'
    ? users
    : users.filter((u) => u.role === 'admin' || u.role === 'responder');

  return (
    <div className="users-view-container">
      <div className="users-header">
        <div className="users-title-wrap">
          <Users size={24} className="header-icon" />
          <h2>Users Directory ({users.length})</h2>
        </div>

        <button
          className={`btn-refresh ${isRefreshing ? 'spinning' : ''}`}
          onClick={handleRefreshClick}
        >
          <RefreshCw size={16} />
          <span>Refresh Users</span>
        </button>
      </div>

      <div className="users-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'online' ? 'active' : ''}`}
          onClick={() => setActiveTab('online')}
        >
          Responders & Admins ({users.filter((u) => u.role === 'admin' || u.role === 'responder').length})
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
                <td colSpan="5" className="empty-table-cell">
                  No user records found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id || user.email}>
                  <td className="user-id-cell">{user.id || 'N/A'}</td>
                  <td className="user-name-cell">
                    <strong>{user.firstName} {user.lastName}</strong>
                  </td>
                  <td className="user-contact-cell">
                    <div className="contact-line">
                      <Mail size={12} /> {user.email}
                    </div>
                    {user.phone && (
                      <div className="contact-line">
                        <Phone size={12} /> {user.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`role-badge ${user.role || 'pet_owner'}`}>
                      <Shield size={12} /> {user.role || 'pet_owner'}
                    </span>
                  </td>
                  <td className="pets-cell">
                    <div className="pets-line">
                      <PawPrint size={14} />
                      <span>{parsePets(user.pets)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersView;
