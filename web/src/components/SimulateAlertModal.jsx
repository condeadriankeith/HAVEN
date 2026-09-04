import React, { useState } from 'react';
import { X, Send, AlertOctagon, MapPin, PawPrint, User, Phone, CheckCircle2 } from 'lucide-react';
import { createEmergencyAlert } from '../services/api';

const HOTSPOT_PRESETS = [
  { name: 'Bacolod City Plaza', lat: 10.6812, lng: 122.9550, address: 'Bacolod Public Plaza, Downtown' },
  { name: 'Capitol Lagoon Park', lat: 10.6758, lng: 122.9515, address: 'Lacson St, Capitol Lagoon Park' },
  { name: 'SM City Bacolod', lat: 10.6698, lng: 122.9431, address: 'Rizal St, Reclamation Area' },
  { name: 'Riverside Medical Center', lat: 10.6853, lng: 122.9610, address: 'BS Aquino Drive, Bacolod' },
  { name: 'Mansilingan Junction', lat: 10.6380, lng: 122.9810, address: 'Mansilingan Main Highway' },
];

const EMERGENCY_TYPES = [
  'Pet Respiratory Distress',
  'Severe Heatstroke / Hyperthermia',
  'Vehicle Collision Trauma',
  'Toxic Plant / Chemical Ingestion',
  'Severe Bleeding / Open Wound',
  'Seizures / Neurological Shock',
];

const PET_PRESETS = [
  { name: 'Max', breed: 'Golden Retriever', type: 'Dog' },
  { name: 'Luna', breed: 'Siamese Cat', type: 'Cat' },
  { name: 'Rocky', breed: 'German Shepherd', type: 'Dog' },
  { name: 'Mochi', breed: 'French Bulldog', type: 'Dog' },
];

const SimulateAlertModal = ({ isOpen, onClose, onAlertDispatched }) => {
  const [selectedType, setSelectedType] = useState(EMERGENCY_TYPES[0]);
  const [selectedHotspot, setSelectedHotspot] = useState(HOTSPOT_PRESETS[0]);
  const [selectedPet, setSelectedPet] = useState(PET_PRESETS[0]);
  const [ownerName, setOwnerName] = useState('Adrian Keith');
  const [ownerPhone, setOwnerPhone] = useState('+63 917 555 0199');
  const [notes, setNotes] = useState('Pet is unresponsive and experiencing difficulty breathing.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

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
      setSuccessMessage('Alert successfully dispatched to HAVEN Network!');

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage('');
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
          <div className="modal-title-wrap">
            <AlertOctagon className="modal-icon text-red" size={24} />
            <div>
              <h3>Simulate Mobile SOS Emergency Alert</h3>
              <p className="modal-subtitle">Trigger a live pet emergency dispatch to test real-time alerts & routing</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {successMessage ? (
          <div className="modal-success-state">
            <CheckCircle2 size={48} className="text-emerald" />
            <h4>SOS Alert Broadcasted!</h4>
            <p>{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Emergency Incident Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
              >
                {EMERGENCY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label><MapPin size={14} /> Location Hotspot (Bacolod City)</label>
              <div className="hotspot-grid">
                {HOTSPOT_PRESETS.map((h) => (
                  <button
                    type="button"
                    key={h.name}
                    className={`hotspot-chip ${selectedHotspot.name === h.name ? 'active' : ''}`}
                    onClick={() => setSelectedHotspot(h)}
                  >
                    <strong>{h.name}</strong>
                    <span>{h.lat.toFixed(4)}, {h.lng.toFixed(4)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label><PawPrint size={14} /> Affected Pet</label>
                <select
                  value={selectedPet.name}
                  onChange={(e) => {
                    const found = PET_PRESETS.find((p) => p.name === e.target.value);
                    if (found) setSelectedPet(found);
                  }}
                  className="form-select"
                >
                  {PET_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>{p.name} - {p.breed} ({p.type})</option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label><User size={14} /> Pet Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label><Phone size={14} /> Emergency Contact Phone</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Incident Details / Field Symptoms</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                rows={2}
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-dispatch-sos" disabled={isSubmitting}>
                <Send size={16} />
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
