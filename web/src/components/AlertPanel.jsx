import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Phone, User, PawPrint, MapPin, DollarSign } from 'lucide-react';

const AlertPanel = ({ emergencies, selectedEmergency, onSelectEmergency, onMarkResponded }) => {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const parsePets = (petsJson) => {
    if (!petsJson || petsJson === '[]') return null;
    try {
      const parsed = typeof petsJson === 'string' ? JSON.parse(petsJson) : petsJson;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((p) => {
            const name = p.name || 'Unknown';
            const breed = p.breed ? ` (${p.breed} ${p.type || ''})` : ` (${p.type || 'Pet'})`;
            return `${name}${breed}`;
          })
          .join(', ');
      }
    } catch (err) {
      if (typeof petsJson === 'string' && petsJson.trim().length > 0) return petsJson;
    }
    return null;
  };

  return (
    <aside className="haven-alert-panel">
      <div className="alert-panel-header">
        <div className="alert-title-wrap">
          <AlertTriangle size={20} className="alert-icon" />
          <h2>Recent Emergency Alerts</h2>
        </div>
        <span className="badge-count">{emergencies.length} Active</span>
      </div>

      <div className="alert-list-scroll">
        {emergencies.length === 0 ? (
          <div className="empty-alerts">
            <CheckCircle size={40} className="empty-icon" />
            <p>No active emergencies reported.</p>
            <small>New incoming SOS alerts will appear here in real time.</small>
          </div>
        ) : (
          emergencies.map((alert) => {
            const isSelected = selectedEmergency && selectedEmergency.id === alert.id;
            const isExpanded = !!expandedIds[alert.id];
            const petsDisplay = parsePets(alert.pets);

            return (
              <div
                key={alert.id}
                className={`alert-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectEmergency(alert)}
              >
                <div className="card-top">
                  <div className="card-header-main">
                    <h3 className="card-title">{alert.title || alert.emergencyType}</h3>
                    <span className="alert-id">{alert.id}</span>
                  </div>
                  <button
                    className="btn-icon expand-btn"
                    onClick={(e) => toggleExpand(alert.id, e)}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                <p className="card-description">
                  {isExpanded || (alert.description && alert.description.length <= 80)
                    ? alert.description
                    : `${(alert.description || '').substring(0, 80)}...`}
                </p>

                <div className="card-details">
                  <div className="detail-item">
                    <User size={14} />
                    <span>Reported by: <strong>{alert.owner || alert.userName || 'Anonymous'}</strong></span>
                  </div>

                  {alert.contactInfo && (
                    <div className="detail-item">
                      <Phone size={14} />
                      <span>{alert.contactInfo}</span>
                    </div>
                  )}

                  {petsDisplay && (
                    <div className="detail-item pets-item">
                      <PawPrint size={14} />
                      <span>Pets: <strong>{petsDisplay}</strong></span>
                    </div>
                  )}

                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>Location: {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                  </div>

                  {alert.emergencyFee > 0 && (
                    <div className="detail-item fee-item">
                      <DollarSign size={14} />
                      <span>Emergency Fee: <strong>₱{alert.emergencyFee}</strong></span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="btn-respond"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkResponded(alert);
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Mark Responded</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default AlertPanel;
