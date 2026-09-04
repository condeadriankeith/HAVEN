import React from 'react';
import { X, ShieldAlert, Clock, CreditCard, Navigation, Phone, User, CheckCircle2 } from 'lucide-react';

/**
 * FloatingIncidentCard - Directly modeled after Reference 2 ("outletbuddy")
 * Anchored card displaying entity avatar, metrics pills, case summary, and primary dispatch CTA
 */
export default function FloatingIncidentCard({
  emergency,
  routeInfo,
  onClose,
  onRespond,
  isResponding = false,
}) {
  if (!emergency) return null;

  const isResolved = emergency.status === 'RESOLVED';
  const isResponded = emergency.status === 'RESPONDED';

  // Pet avatar placeholder / icon
  const petInitial = emergency.petName ? emergency.petName.charAt(0).toUpperCase() : '🐾';
  const petBreed = emergency.petBreed || emergency.breed || 'Companion Pet';
  const ownerName = emergency.owner || emergency.userName || 'Adrian Keith';
  const contactPhone = emergency.phone || emergency.userPhone || '+63 917 555 0199';
  const fee = emergency.emergencyFee || (routeInfo?.distanceKm ? Math.round(routeInfo.distanceKm * 45 + 200) : 250);

  return (
    <div className="floating-incident-card animate-fade-in-spring">
      {/* Top Header Row */}
      <div className="card-top-row">
        <div className="entity-avatar-box">
          <div className="entity-avatar-circle">
            <span className="avatar-char">{petInitial}</span>
          </div>
          <span className="avatar-status-badge" />
        </div>

        <div className="entity-title-meta">
          <h3 className="entity-name">
            {emergency.petName || 'Rescue Case'}
            <span className="entity-breed"> • {petBreed}</span>
          </h3>
          <div className="entity-subtitle">
            <span className="distance-tag">{routeInfo?.distanceKm ? `${routeInfo.distanceKm} km` : '0.8 km'}</span>
            <span className="bullet-sep">•</span>
            <span className={`status-pill status-${emergency.status.toLowerCase()}`}>
              {emergency.status}
            </span>
          </div>
        </div>

        <button className="card-close-btn" onClick={onClose} aria-label="Close card">
          <X size={16} />
        </button>
      </div>

      {/* Metrics Pills Row matching Reference 2 */}
      <div className="metrics-pill-row">
        <div className="metric-pill severity-pill">
          <ShieldAlert size={12} className="text-red" />
          <span>{emergency.priority === 'CRITICAL' ? '98% Urgent' : '82% High'}</span>
        </div>

        <div className="metric-pill time-pill">
          <Clock size={12} className="text-cyan" />
          <span>ETA ~{routeInfo?.durationMin || '8'}m</span>
        </div>

        <div className="metric-pill fee-pill">
          <CreditCard size={12} className="text-emerald" />
          <span>₱{fee} fee</span>
        </div>
      </div>

      {/* Case Description Body */}
      <div className="incident-narrative">
        <p className="narrative-headline">
          <strong>{emergency.title || 'Pet Distress Alert'}</strong>
        </p>
        <p className="narrative-body">
          {emergency.notes ||
            'Patient showing signs of acute respiratory compromise. Mobile rescue unit deployed with oxygen concentrator and rapid trauma vitals.'}
        </p>
        <div className="narrative-location-tag">
          📍 {emergency.address || 'Bacolod City Central'}
        </div>
      </div>

      {/* Owner Contact Quick Actions */}
      <div className="owner-quick-strip">
        <div className="owner-info">
          <User size={13} className="text-muted" />
          <span>{ownerName}</span>
        </div>
        <a href={`tel:${contactPhone}`} className="owner-phone-link">
          <Phone size={12} />
          <span>{contactPhone}</span>
        </a>
      </div>

      {/* Prominent Action Button matching Reference 2 */}
      <div className="card-action-footer">
        {isResolved ? (
          <div className="resolved-banner">
            <CheckCircle2 size={16} />
            <span>Incident Neutralized & Closed</span>
          </div>
        ) : isResponded ? (
          <button
            className="card-primary-cta resolved-step"
            onClick={() => onRespond(emergency.id, 'RESOLVED')}
            disabled={isResponding}
          >
            {isResponding ? 'Resolving...' : 'Complete & Close Case'}
          </button>
        ) : (
          <button
            className="card-primary-cta"
            onClick={() => onRespond(emergency.id, 'RESPONDED')}
            disabled={isResponding}
          >
            <Navigation size={16} />
            <span>{isResponding ? 'Transmitting Dispatch...' : 'Dispatch Responder Team'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
