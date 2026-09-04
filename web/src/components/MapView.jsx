import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Clock, Compass } from 'lucide-react';
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

// Custom Emergency Animated Radar Pin
const createEmergencyIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-emergency-icon',
    html: `
      <div class="pin-pulse-wrapper ${isSelected ? 'selected' : ''}">
        <div class="pin-pulse"></div>
        <div class="pin-marker">🚨</div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

// Custom Vet HQ Pin
const vetHubIcon = L.divIcon({
  className: 'custom-vethub-icon',
  html: `
    <div class="vethub-marker" title="HAVEN Veterinary Dispatch HQ">
      🏥
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

// Smooth Camera Controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

const DEFAULT_CENTER = [DEFAULT_VET_LAT, DEFAULT_VET_LNG];

const MapView = ({
  emergencies = [],
  selectedEmergency = null,
  routeCoordinates = [],
  routeInfo = null,
  onSelectEmergency,
}) => {
  const mapCenter = selectedEmergency
    ? [selectedEmergency.lat, selectedEmergency.lng]
    : DEFAULT_CENTER;

  return (
    <div className="map-view-container">
      {/* Route Navigation HUD Overlay */}
      {selectedEmergency && routeInfo && (
        <div className="route-hud-overlay">
          <div className="hud-metric">
            <span className="hud-label">Incident Target</span>
            <span className="hud-target">{selectedEmergency.title}</span>
          </div>
          <div className="hud-divider" />
          <div className="hud-metric">
            <span className="hud-label"><Compass size={11} /> Distance</span>
            <span className="hud-val">{routeInfo.distanceKm} km</span>
          </div>
          <div className="hud-divider" />
          <div className="hud-metric">
            <span className="hud-label"><Clock size={11} /> Estimated ETA</span>
            <span className="hud-val">~{routeInfo.durationMin} min</span>
          </div>
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        {/* CartoDB Dark Matter Tiles for Command Center Look */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={mapCenter} zoom={selectedEmergency ? 15 : 13} />

        {/* HAVEN Vet Dispatch HQ Center */}
        <Marker position={DEFAULT_CENTER} icon={vetHubIcon}>
          <Popup>
            <div className="popup-content">
              <h4>🏥 HAVEN Vet Dispatch HQ</h4>
              <p>Bacolod Central Veterinary Hub</p>
              <p>Coordinates: {DEFAULT_VET_LAT}, {DEFAULT_VET_LNG}</p>
            </div>
          </Popup>
        </Marker>

        {/* Active Emergency Pins */}
        {emergencies.map((e) => {
          const isSelected = selectedEmergency && selectedEmergency.id === e.id;
          return (
            <Marker
              key={e.id}
              position={[e.lat, e.lng]}
              icon={createEmergencyIcon(isSelected)}
              eventHandlers={{
                click: () => onSelectEmergency(e),
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h4>🚨 {e.title}</h4>
                  <p><strong>ID:</strong> {e.id}</p>
                  <p><strong>Owner:</strong> {e.owner}</p>
                  <p><strong>Phone:</strong> {e.phone || 'N/A'}</p>
                  <p><strong>Location:</strong> {e.lat.toFixed(4)}, {e.lng.toFixed(4)}</p>
                  {e.emergencyFee > 0 && (
                    <p className="fee-text"><strong>Est. Response Fee:</strong> ₱{e.emergencyFee}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Street Route Polyline with Glow */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <>
            {/* Outer glow line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#ff334b', weight: 8, opacity: 0.35 }}
            />
            {/* Inner precise road line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#ff334b', weight: 4, opacity: 0.95 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
