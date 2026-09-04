import React, { useState, useEffect } from 'react';
import { X, Send, AlertOctagon, MapPin, PawPrint, User, Phone, CheckCircle2, Compass, CircleDollarSign } from 'lucide-react';
import { createEmergencyAlert } from '../services/api';
import { playClickFeedback, playEmergencyAlarm } from '../utils/sound';
import { DEFAULT_VET_LAT, DEFAULT_VET_LNG } from '../hooks/useEmergencies';

const HOTSPOT_PRESETS = [
  { name: 'Bacolod City Plaza', lat: 10.6812, lng: 122.9550, address: 'Bacolod Public Plaza, Downtown' },
  { name: 'Capitol Lagoon Park', lat: 10.6758, lng: 122.9515, address: 'Lacson St, Capitol Lagoon Park' },
  { name: 'SM City Bacolod', lat: 10.6698, lng: 122.9431, address: 'Rizal St, Reclamation Area' },
  { name: 'Riverside Medical Center', lat: 10.6853, lng: 122.9610, address: 'BS Aquino Drive, Bacolod' },
  { name: 'Mansilingan Junction', lat: 10.6380, lng: 122.9810, address: 'Mansilingan Main Highway' },
];

const EMERGENCY_TYPES = [
  'Pet Respiratory Distress / Choking',
  'Severe Heatstroke / Hyperthermia',
  'Vehicle Collision Trauma / Fractures',
  'Toxic Plant / Chemical Ingestion',
  'Severe Bleeding / Open Laceration',
  'Seizures & Neurological Shock',
];

const PET_PRESETS = [
  { name: 'Max', breed: 'Golden Retriever', type: 'Dog' },
  { name: 'Luna', breed: 'Siamese Cat', type: 'Cat' },
  { name: 'Rocky', breed: 'German Shepherd', type: 'Dog' },
  { name: 'Mochi', breed: 'French Bulldog', type: 'Dog' },
  { name: 'Cleo', breed: 'Persian Cat', type: 'Cat' },
];

const SimulateAlertModal = ({ isOpen, onClose, onAlertDispatched, customLocation = null }) => {
  const [selectedType, setSelectedType] = useState(EMERGENCY_TYPES[0]);
  const [selectedHotspot, setSelectedHotspot] = useState(HOTSPOT_PRESETS[0]);
  const [prevCustomLoc, setPrevCustomLoc] = useState(customLocation);
  const [selectedPet, setSelectedPet] = useState(PET_PRESETS[0]);
  const [ownerName, setOwnerName] = useState('Adrian Keith');
  const [ownerPhone, setOwnerPhone] = useState('+63 917 555 0199');
  const [notes, setNotes] = useState('Pet is unresponsive and experiencing difficulty breathing.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);

  if (customLocation && customLocation !== prevCustomLoc) {
    setPrevCustomLoc(customLocation);
    setSelectedHotspot({
      name: 'Custom Map Location',
      lat: customLocation.lat,
      lng: customLocation.lng,
      address: `Selected GPS (${customLocation.lat.toFixed(4)}, ${customLocation.lng.toFixed(4)})`,
    });
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate live preview distance and fee
  const distKm = Math.sqrt(
    Math.pow((selectedHotspot.lat - DEFAULT_VET_LAT) * 111, 2) +
    Math.pow((selectedHotspot.lng - DEFAULT_VET_LNG) * 111 * Math.cos(selectedHotspot.lat * (Math.PI / 180)), 2)
  );
  const estFee = Math.max(150, Math.round(distKm * 60) + 120);

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickFeedback();
    setIsSubmitting(true);

    try {
      const payload = {
        location: {
          latitude: selectedHotspot.lat,
          longitude: selectedHotspot.lng,
          address: selectedHotspot.address,
        },
        emergencyType: selectedType,
        additionalDetails: `${notes} [Pet: ${selectedPet.name} - ${selectedPet.breed} (${selectedPet.type})]`,
        contactInfo: {
          name: ownerName,
          phone: ownerPhone,
          email: 'responder-sim@haven.local',
        },
      };

      const result = await createEmergencyAlert(payload);
      setSuccessState(true);
      playEmergencyAlarm();

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessState(false);
        if (onAlertDispatched) {
          onAlertDispatched(result?.emergency);
        }
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to dispatch simulated alert:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertOctagon className="text-red" size={24} />
              <h3>Simulate Mobile SOS Emergency Alert</h3>
            </div>
            <p className="modal-subtitle">
              Dispatches a live pet emergency to test real-time Socket.IO synchronization, map routing, and alerts
            </p>
          </div>
          <button className="btn-icon-tactile" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {successState ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={52} className="text-emerald" />
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>SOS Alert Broadcasted!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              All connected responder consoles have received this emergency dispatch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-field">
              <label>Emergency Classification</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-input-ctrl"
              >
                {EMERGENCY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>
                <MapPin size={13} className="text-cyan" /> Select Hotspot (Bacolod Jurisdiction)
              </label>
              <div className="hotspot-chip-grid">
                {HOTSPOT_PRESETS.map((h) => (
                  <button
                    type="button"
                    key={h.name}
                    className={`hotspot-card ${selectedHotspot.name === h.name ? 'active' : ''}`}
                    onClick={() => {
                      playClickFeedback();
                      setSelectedHotspot(h);
                    }}
                  >
                    <strong>{h.name}</strong>
                    <span>{h.lat.toFixed(4)}, {h.lng.toFixed(4)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label><PawPrint size={13} className="text-cyan" /> Pet Profile</label>
                <select
                  value={selectedPet.name}
                  onChange={(e) => {
                    const found = PET_PRESETS.find((p) => p.name === e.target.value);
                    if (found) setSelectedPet(found);
                  }}
                  className="form-input-ctrl"
                >
                  {PET_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>{p.name} ({p.breed})</option>
                  ))}
                </select>
              </div>

              <div className="form-field" style={{ flex: 1 }}>
                <label><User size={13} className="text-cyan" /> Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="form-input-ctrl"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label><Phone size={13} className="text-cyan" /> Owner Phone Number</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="form-input-ctrl"
                  required
                />
              </div>

              {/* Dynamic Telemetry Calculation Preview */}
              <div className="form-field" style={{ flex: 1 }}>
                <label>Calculated Telemetry Preview</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--accent-amber)' }}>
                    <Compass size={13} />
                    <strong>{distKm.toFixed(1)} km</strong>
                  </div>
                  <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                    <CircleDollarSign size={13} />
                    <strong>₱{estFee}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Incident Notes / Medical Symptoms</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input-ctrl"
                rows={2}
                required
              />
            </div>

            <div className="modal-footer-btns">
              <button
                type="button"
                className="btn-ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-transmit-sos"
                disabled={isSubmitting}
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Broadcasting SOS...' : 'Transmit Live Emergency SOS'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SimulateAlertModal;
