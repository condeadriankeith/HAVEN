import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icons in React Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Emergency Pin Icon with pulsing animation
const createEmergencyIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-emergency-icon',
    html: `
      <div className="pin-pulse-wrapper ${isSelected ? 'selected' : ''}">
        <div className="pin-pulse"></div>
        <div className="pin-marker">🚨</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Custom Vet Hub Pin Icon
const vetHubIcon = L.divIcon({
  className: 'custom-vethub-icon',
  html: `
    <div className="vethub-marker" title="HAVEN Veterinary Headquarters">
      🏥
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Helper component to center map smoothly
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

const DEFAULT_CENTER = [10.6765, 122.9509]; // Bacolod City

const MapView = ({ emergencies, selectedEmergency, routeCoordinates, onSelectEmergency }) => {
  const mapCenter = selectedEmergency
    ? [selectedEmergency.lat, selectedEmergency.lng]
    : DEFAULT_CENTER;

  return (
    <div className="map-view-container">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} zoom={selectedEmergency ? 15 : 13} />

        {/* Vet HQ Center Marker */}
        <Marker position={DEFAULT_CENTER} icon={vetHubIcon}>
          <Popup>
            <div className="popup-content">
              <h4>🏥 HAVEN Vet Dispatch HQ</h4>
              <p>Bacolod City Central Command</p>
            </div>
          </Popup>
        </Marker>

        {/* Emergency Markers */}
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
                  <h4>🚨 {e.title || e.emergencyType}</h4>
                  <p><strong>ID:</strong> {e.id}</p>
                  <p><strong>Owner:</strong> {e.owner || e.userName}</p>
                  <p><strong>Location:</strong> {e.lat.toFixed(4)}, {e.lng.toFixed(4)}</p>
                  {e.emergencyFee > 0 && (
                    <p className="fee-text"><strong>Emergency Fee:</strong> ₱{e.emergencyFee}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#ff3b30', weight: 5, opacity: 0.8, dashArray: '8, 8' }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
