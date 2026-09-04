import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Phone,
  User,
  PawPrint,
  MapPin,
  CircleDollarSign,
  Compass,
} from 'lucide-react';

const AlertPanel = ({
  emergencies = [],
  selectedEmergency = null,
  onSelectEmergency,
  onMarkResponded,
}) => {
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
        return parsed.map((p, idx) => {
          const name = p.name || 'Pet';
          const breed = p.breed ? `${p.breed}` : `${p.type || 'Unknown'}`;
          return (
            <span key={idx} className="pet-pill">
              {name} ({breed})
            </span>
          );
        });
      }
    } catch {
      if (typeof petsJson === 'string' && petsJson.trim().length > 0) {
        return <span className="pet-pill">{petsJson}</span>;
      }
    }
    return null;
  };

  return (
    <aside className="haven-alert-panel" aria-label="Incoming Emergencies Feed">
      <div className="alert-panel-header">
        <div className="alert-title-wrap">
          <AlertTriangle size={18} className="text-red" />
          <h2>Emergency Incident Feed</h2>
        </div>
        <span className="alert-count-badge">
          {emergencies.length} Active
        </span>
      </div>

      <div className="alert-list-scroll">
        {emergencies.length === 0 ? (
          <div className="empty-alerts">
            <CheckCircle2 size={44} className="empty-icon" />
            <h3>No Active Emergencies</h3>
            <p>All emergency incidents in Bacolod City have been acknowledged and processed.</p>
          </div>
        ) : (
          emergencies.map((alert) => {
            const isSelected = selectedEmergency && selectedEmergency.id === alert.id;
            const isExpanded = !!expandedIds[alert.id];
            const petsElements = parsePets(alert.pets);

            return (
              <article
                key={alert.id}
                className={`alert-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectEmergency(alert)}
                role="button"
                tabIndex={0}
              >
                <div className="card-top">
                  <div className="card-header-main">
                    <h3 className="card-title">{alert.title}</h3>
                    <div className="card-meta-row">
                      <span className="alert-id">{alert.id}</span>
                      <span className="distance-badge">
                        <Compass size={11} style={{ display: 'inline', marginRight: 3 }} />
                        {alert.distanceKm} km
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-icon-toggle"
                    style={{ width: 28, height: 28 }}
                    onClick={(e) => toggleExpand(alert.id, e)}
                    title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                <p className="card-description">
                  {isExpanded || (alert.description && alert.description.length <= 90)
                    ? alert.description
                    : `${(alert.description || '').substring(0, 90)}...`}
                </p>

                <div className="card-details-grid">
                  <div className="detail-item">
                    <User size={13} />
                    <span>Owner: <strong>{alert.owner}</strong></span>
                  </div>

                  {alert.phone && (
                    <div className="detail-item">
                      <Phone size={13} />
                      <a href={`tel:${alert.phone}`} onClick={(e) => e.stopPropagation()}>
                        {alert.phone}
                      </a>
                    </div>
                  )}

                  {petsElements && (
                    <div className="detail-item" style={{ flexWrap: 'wrap', gap: 4 }}>
                      <PawPrint size={13} />
                      <span style={{ marginRight: 4 }}>Pets:</span>
                      {petsElements}
                    </div>
                  )}

                  <div className="detail-item">
                    <MapPin size={13} />
                    <span>{alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                  </div>

                  {alert.emergencyFee > 0 && (
                    <div className="detail-item fee-item">
                      <CircleDollarSign size={13} />
                      <span>Response Fee: <strong>₱{alert.emergencyFee}</strong></span>
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
                    <CheckCircle2 size={15} />
                    <span>Mark Responded & Dispatched</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default AlertPanel;
