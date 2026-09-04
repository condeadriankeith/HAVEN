import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Clock, Compass, Crosshair } from 'lucide-react';
import { DEFAULT_VET_LAT, DEFAULT_VET_LNG } from '../hooks/useEmergencies';

// Fix Leaflet marker asset references
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Sonar Radar Pin with Multi-Ring Ripple Animation
const createEmergencySonarIcon = (isSelected, type = '') => {
  const isCat = type.toLowerCase().includes('cat') || type.toLowerCase().includes('feline');
  const iconSymbol = isCat ? '🐱' : '🚨';

  return L.divIcon({
    className: 'custom-emergency-pin',
    html: `
      <div class="sonar-pin-container ${isSelected ? 'selected' : ''}">
        <div class="sonar-ripple"></div>
        <div class="sonar-ripple-outer"></div>
        <div class="sonar-core">${iconSymbol}</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

// Custom Vet HQ Center Pin
const vetHqIcon = L.divIcon({
  className: 'custom-vethub-pin',
  html: `
    <div class="vet-hq-pin" title="HAVEN Central Veterinary Command">
      🏥
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

// Smooth Camera Controller with Ease-Out Lerping
function MapCameraController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom || 14, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener for Interactive Point Picking
function MapLocationPicker({ onLocationPicked }) {
  useMapEvents({
    click(e) {
      if (onLocationPicked) {
        onLocationPicked(e.latlng);
      }
    },
  });
  return null;
}

const DEFAULT_CENTER = [DEFAULT_VET_LAT, DEFAULT_VET_LNG];

const MapView = ({
  emergencies = [],
  selectedEmergency = null,
  routeCoordinates = [],
  routeInfo = null,
  onSelectEmergency,
  onLocationPicked,
}) => {
  const mapCenter = selectedEmergency
    ? [selectedEmergency.lat, selectedEmergency.lng]
    : DEFAULT_CENTER;

  return (
    <div className="map-view-container">
      {/* Floating Tactical Route HUD */}
      {selectedEmergency && routeInfo && (
        <div className="tactical-route-hud">
          <div className="hud-stat">
            <span className="hud-stat-label">
              <Crosshair size={11} className="text-cyan" /> Incident Target
            </span>
            <span className="hud-destination">{selectedEmergency.title}</span>
          </div>

          <div className="hud-divider-line" />

          <div className="hud-stat">
            <span className="hud-stat-label">
              <Compass size={11} className="text-amber" /> Distance
            </span>
            <span className="hud-stat-value">{routeInfo.distanceKm} km</span>
          </div>

          <div className="hud-divider-line" />

          <div className="hud-stat">
            <span className="hud-stat-label">
              <Clock size={11} className="text-emerald" /> Est. ETA
            </span>
            <span className="hud-stat-value" style={{ color: 'var(--accent-emerald)' }}>
              ~{routeInfo.durationMin} min
            </span>
          </div>
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapCameraController center={mapCenter} zoom={selectedEmergency ? 15 : 13} />
        <MapLocationPicker onLocationPicked={onLocationPicked} />

        {/* Central Vet Dispatch Command Center */}
        <Marker position={DEFAULT_CENTER} icon={vetHqIcon}>
          <Popup>
            <div className="popup-content">
              <h4>🏥 HAVEN Vet Dispatch HQ</h4>
              <p>Bacolod Central Command Operations</p>
              <p>Coordinates: {DEFAULT_VET_LAT}, {DEFAULT_VET_LNG}</p>
            </div>
          </Popup>
        </Marker>

        {/* Sonar Emergency Pins */}
        {emergencies.map((e) => {
          const isSelected = selectedEmergency && selectedEmergency.id === e.id;
          return (
            <Marker
              key={e.id}
              position={[e.lat, e.lng]}
              icon={createEmergencySonarIcon(isSelected, e.title)}
              eventHandlers={{
                click: () => onSelectEmergency(e),
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h4>🚨 {e.title}</h4>
                  <p><strong>ID:</strong> {e.id}</p>
                  <p><strong>Owner:</strong> {e.owner}</p>
                  <p><strong>Contact:</strong> {e.phone || 'N/A'}</p>
                  <p><strong>Telemetry:</strong> {e.lat.toFixed(4)}, {e.lng.toFixed(4)}</p>
                  {e.emergencyFee > 0 && (
                    <p className="fee-text">
                      <strong>Est. Response Fee:</strong> ₱{e.emergencyFee}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Animated Street Route Flowing Line */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <>
            {/* Outer neon dispersion glow */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#00e5ff', weight: 8, opacity: 0.35 }}
            />
            {/* Inner dynamic animated dashed street line */}
            <Polyline
              positions={routeCoordinates}
              className="route-drawing-path"
              pathOptions={{ color: '#ff2a44', weight: 4.5, opacity: 0.95 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
