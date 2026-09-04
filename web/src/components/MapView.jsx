import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_VET_LAT = 10.6765;
const DEFAULT_VET_LNG = 122.9509;
const DEFAULT_CENTER = [DEFAULT_VET_LAT, DEFAULT_VET_LNG];

// Circular Pin with Pill Badge directly modeled after Reference 2 ("outletbuddy")
const createReference2Pin = (isSelected, emergency) => {
  const isCritical = emergency.priority === 'CRITICAL';
  const score = isCritical ? '98' : '80';
  const icon = emergency.petName ? '🐾' : '🚨';

  return L.divIcon({
    className: 'ref2-pin-leaflet-wrapper',
    html: `
      <div class="ref2-map-pin ${isSelected ? 'selected' : ''} ${isCritical ? 'critical' : ''}">
        <div class="ref2-pin-disc">
          <span class="ref2-pin-symbol">${icon}</span>
        </div>
        <div class="ref2-pin-badge">
          <span class="ref2-badge-score">${score}</span>
        </div>
      </div>
    `,
    iconSize: [44, 54],
    iconAnchor: [22, 52],
    popupAnchor: [0, -50],
  });
};

// Custom Vet HQ Center Pin
const vetHqIcon = L.divIcon({
  className: 'ref2-vethq-leaflet-wrapper',
  html: `
    <div class="ref2-vethq-pin" title="HAVEN Central Veterinary Command">
      🏥
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
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

export default function MapView({
  emergencies = [],
  selectedEmergency = null,
  routeCoordinates = [],
  onSelectEmergency,
  onLocationPicked,
}) {
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

        {/* Reference 2 Map Pins */}
        {emergencies.map((e) => {
          const isSelected = selectedEmergency && selectedEmergency.id === e.id;
          return (
            <Marker
              key={e.id}
              position={[e.lat, e.lng]}
              icon={createReference2Pin(isSelected, e)}
              eventHandlers={{
                click: () => onSelectEmergency(e),
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h4>🚨 {e.title}</h4>
                  <p><strong>Pet:</strong> {e.petName || 'Companion Animal'}</p>
                  <p><strong>Owner:</strong> {e.owner}</p>
                  <p><strong>Contact:</strong> {e.phone || 'N/A'}</p>
                  <p><strong>Telemetry:</strong> {e.lat.toFixed(4)}, {e.lng.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Glowing Mint/Teal Route Lines modeled after Reference 1 & 2 */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <>
            {/* Ambient Cyan Dispersion Tube */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#00e5ff', weight: 10, opacity: 0.3 }}
            />
            {/* Sharp Glowing Mint Route Line */}
            <Polyline
              positions={routeCoordinates}
              className="route-drawing-path"
              pathOptions={{ color: '#00f0a8', weight: 4.5, opacity: 0.95 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
