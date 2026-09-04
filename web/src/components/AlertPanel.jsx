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
import { playClickFeedback } from '../utils/sound';

const AlertPanel = ({
  emergencies = [],
  selectedEmergency = null,
  onSelectEmergency,
  onMarkResponded,
}) => {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    playClickFeedback();
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
            <span key={idx} className="pet-tag">
              {name} ({breed})
            </span>
          );
        });
      }
    } catch {
      if (typeof petsJson === 'string' && petsJson.trim().length > 0) {
        return <span className="pet-tag">{petsJson}</span>;
      }
    }
    return null;
  };

  return (
    <aside className="haven-alert-panel" aria-label="Incoming Emergency Incidents">
      <div className="panel-top-bar">
        <div className="panel-title-group">
          <AlertTriangle size={18} className="text-red" />
          <h2>Emergency Stream</h2>
        </div>
        <div className="badge-live-count">
          <span className="ticker-dot" style={{ width: 5, height: 5 }} />
          <span>{emergencies.length} Active Incidents</span>
        </div>
      </div>

      <div className="alert-cards-scroll">
        {emergencies.length === 0 ? (
          <div className="empty-alerts">
            <CheckCircle2 size={46} className="text-emerald" style={{ marginBottom: 14 }} />
            <h3>Sector All Clear</h3>
            <p>No active emergencies reported across Bacolod City jurisdiction.</p>
          </div>
        ) : (
          emergencies.map((alert, idx) => {
            const isSelected = selectedEmergency && selectedEmergency.id === alert.id;
            const isExpanded = !!expandedIds[alert.id];
            const petsElements = parsePets(alert.pets);
            const severityClass = alert.severity === 'CRITICAL' ? 'critical' : 'urgent';

            return (
              <article
                key={alert.id}
                className={`incident-card ${isSelected ? 'selected' : ''}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
                onClick={() => onSelectEmergency(alert)}
                role="button"
                tabIndex={0}
              >
                <div className="card-heading-row">
                  <div className="card-title-meta">
                    <h3>{alert.title}</h3>
                    <div className="card-tags">
                      <span className="badge-id">{alert.id}</span>
                      <span className={`badge-severity ${severityClass}`}>
                        {alert.severity}
                      </span>
                      <span className="badge-id" style={{ color: 'var(--accent-amber)', background: 'rgba(255, 179, 0, 0.1)' }}>
                        <Compass size={10} style={{ display: 'inline', marginRight: 3 }} />
                        {alert.distanceKm} km
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-icon-tactile"
                    style={{ width: 28, height: 28 }}
                    onClick={(e) => toggleExpand(alert.id, e)}
                    title={isExpanded ? 'Collapse' : 'Expand Details'}
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                <p className="card-synopsis">
                  {isExpanded || (alert.description && alert.description.length <= 85)
                    ? alert.description
                    : `${(alert.description || '').substring(0, 85)}...`}
                </p>

                <div className="card-data-grid">
                  <div className="data-row">
                    <User size={13} className="text-cyan" />
                    <span>Caller: <strong>{alert.owner}</strong></span>
                  </div>

                  {alert.phone && (
                    <div className="data-row">
                      <Phone size={13} className="text-cyan" />
                      <a href={`tel:${alert.phone}`} onClick={(e) => e.stopPropagation()}>
                        {alert.phone}
                      </a>
                    </div>
                  )}

                  {petsElements && (
                    <div className="data-row" style={{ flexWrap: 'wrap', gap: 4 }}>
                      <PawPrint size={13} className="text-cyan" />
                      <span style={{ marginRight: 4 }}>Pets:</span>
                      {petsElements}
                    </div>
                  )}

                  <div className="data-row">
                    <MapPin size={13} className="text-cyan" />
                    <span>GPS: {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                  </div>

                  {alert.emergencyFee > 0 && (
                    <div className="data-row">
                      <CircleDollarSign size={13} className="text-emerald" />
                      <span className="fee-highlight">Est. Fee: ₱{alert.emergencyFee}</span>
                    </div>
                  )}
                </div>

                <button
                  className="btn-dispatch-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkResponded(alert);
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Acknowledge & Dispatch Units</span>
                </button>
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default AlertPanel;
