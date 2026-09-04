import React from 'react';
import { CornerUpLeft, Clock, Gauge, MapPin } from 'lucide-react';

/**
 * RouteTimelineHUD - Directly modeled after Reference 1
 * Features vertical dotted waypoint line, glowing rings, turn instructions, speed & ETA
 */
export default function RouteTimelineHUD({ selectedEmergency, routeInfo }) {
  if (!selectedEmergency || !routeInfo) return null;

  const distanceKm = routeInfo.distanceKm || '2.4';
  const durationMin = routeInfo.durationMin || '8';
  const destinationName = selectedEmergency.petName 
    ? `${selectedEmergency.petName} (${selectedEmergency.title})`
    : selectedEmergency.title;

  return (
    <div className="route-timeline-hud-card">
      <div className="hud-timeline-track">
        {/* Top Node: Destination */}
        <div className="timeline-node destination-node">
          <div className="node-glow-ring">
            <div className="node-dot" />
          </div>
          <div className="node-content">
            <span className="node-label">Destination</span>
            <span className="node-title">{destinationName}</span>
          </div>
        </div>

        {/* Vertical Dotted Trail */}
        <div className="dotted-trail" />

        {/* Active Node: Turn Navigation */}
        <div className="timeline-node active-turn-node">
          <div className="node-glow-ring active">
            <div className="node-dot active" />
          </div>
          <div className="turn-instruction-block">
            <CornerUpLeft size={16} className="turn-icon" />
            <div className="turn-text-group">
              <strong className="turn-action">Turn left in 300M</strong>
              <span className="turn-street">Lacson Street, Bacolod</span>
            </div>
          </div>
        </div>

        {/* Vertical Dotted Trail */}
        <div className="dotted-trail" />

        {/* Speed Telemetry Node */}
        <div className="timeline-node speed-node">
          <div className="node-dot mini" />
          <div className="speed-badge">
            <Gauge size={13} className="speed-icon" />
            <span>56 km/h</span>
          </div>
        </div>

        {/* Vertical Dotted Trail */}
        <div className="dotted-trail dim" />

        {/* Origin / Base Node */}
        <div className="timeline-node base-node">
          <div className="node-dot dim" />
          <div className="node-content">
            <span className="node-dim-text">HAVEN Vet Command Center</span>
          </div>
        </div>
      </div>

      {/* Bottom Duration & Distance Metric */}
      <div className="hud-metric-footer">
        <div className="eta-block">
          <Clock size={15} className="eta-icon" />
          <div className="eta-values">
            <span className="eta-number">{durationMin}</span>
            <span className="eta-unit">minutes</span>
          </div>
        </div>
        <div className="distance-block">
          <MapPin size={13} className="distance-icon" />
          <span>{distanceKm} km</span>
        </div>
      </div>
    </div>
  );
}
