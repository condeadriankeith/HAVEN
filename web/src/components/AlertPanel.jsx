import React, { useState, useMemo } from 'react';
import {
  Search,
  PawPrint,
  MapPin,
  X,
} from 'lucide-react';
import { playClickFeedback } from '../utils/sound';

export default function AlertPanel({
  emergencies = [],
  selectedEmergency = null,
  onSelectEmergency,
  _onMarkResponded,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEAREST');

  // Filter and sort items
  const filteredEmergencies = useMemo(() => {
    return emergencies
      .filter((e) => {
        // Status filter
        if (statusFilter === 'ACTIVE' && e.status !== 'ACTIVE') return false;
        if (statusFilter === 'RESPONDED' && e.status !== 'RESPONDED') return false;
        if (statusFilter === 'RESOLVED' && e.status !== 'RESOLVED') return false;

        // Search term filter
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase();
        return (
          e.title?.toLowerCase().includes(query) ||
          e.owner?.toLowerCase().includes(query) ||
          e.petName?.toLowerCase().includes(query) ||
          e.address?.toLowerCase().includes(query) ||
          e.notes?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'CRITICAL') {
          const pA = a.priority === 'CRITICAL' ? 2 : a.priority === 'URGENT' ? 1 : 0;
          const pB = b.priority === 'CRITICAL' ? 2 : b.priority === 'URGENT' ? 1 : 0;
          return pB - pA;
        }
        if (sortBy === 'NEWEST') {
          return new Date(b.time || 0) - new Date(a.time || 0);
        }
        // Default nearest / active
        return 0;
      });
  }, [emergencies, statusFilter, sortBy, searchTerm]);

  const activeCount = emergencies.filter((e) => e.status === 'ACTIVE').length;

  return (
    <div className="incident-directory-panel">
      {/* Brand Header matching Reference 2 ("outletbuddy" style) */}
      <div className="directory-brand-header">
        <div className="brand-pill-avatar">
          <PawPrint size={18} className="text-cyan" />
        </div>
        <div className="brand-text">
          <h2 className="brand-title">HAVEN Console</h2>
          <span className="brand-subtitle">Emergency Dispatch Grid</span>
        </div>
        <div className="live-counter-pill">
          <span className="live-dot" />
          <span>{activeCount} Active</span>
        </div>
      </div>

      {/* Rounded Search Bar */}
      <div className="directory-search-wrapper">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          className="directory-search-input"
          placeholder="Search emergencies, pets, streets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter Pills Row matching Reference 2 */}
      <div className="directory-filters-row">
        <div className="filter-pill-select-group">
          <label className="filter-pill-label">Show:</label>
          <select
            className="filter-pill-select"
            value={statusFilter}
            onChange={(e) => {
              playClickFeedback();
              setStatusFilter(e.target.value);
            }}
          >
            <option value="ALL">All Cases</option>
            <option value="ACTIVE">Active Now</option>
            <option value="RESPONDED">Dispatched</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="filter-pill-select-group">
          <label className="filter-pill-label">Sort:</label>
          <select
            className="filter-pill-select"
            value={sortBy}
            onChange={(e) => {
              playClickFeedback();
              setSortBy(e.target.value);
            }}
          >
            <option value="NEAREST">Nearest</option>
            <option value="CRITICAL">Critical First</option>
            <option value="NEWEST">Newest</option>
          </select>
        </div>
      </div>

      {/* Incident List Items matching Reference 2 */}
      <div className="directory-list-scroll">
        {filteredEmergencies.length === 0 ? (
          <div className="empty-directory-state">
            <PawPrint size={36} className="empty-icon" />
            <p>No emergencies match current filters</p>
          </div>
        ) : (
          filteredEmergencies.map((e) => {
            const isSelected = selectedEmergency && selectedEmergency.id === e.id;
            const petInitial = e.petName ? e.petName.charAt(0).toUpperCase() : '🐾';
            const petBreed = e.petBreed || e.breed || 'Companion';
            const isCritical = e.priority === 'CRITICAL';

            return (
              <div
                key={e.id}
                className={`directory-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  playClickFeedback();
                  onSelectEmergency(e);
                }}
              >
                {/* Left circular avatar with status ring */}
                <div className="item-avatar-wrapper">
                  <div className={`item-avatar-circle ${isCritical ? 'critical' : ''}`}>
                    <span>{petInitial}</span>
                  </div>
                  <span className={`item-status-indicator status-${e.status.toLowerCase()}`} />
                </div>

                {/* Central Info Column */}
                <div className="item-info-col">
                  <div className="item-title-row">
                    <strong className="item-name">{e.petName || e.title}</strong>
                    <span className="item-breed"> • {petBreed}</span>
                  </div>
                  <div className="item-address-row">
                    <MapPin size={11} className="text-muted" />
                    <span className="item-address-text">{e.address || 'Bacolod City'}</span>
                  </div>
                </div>

                {/* Right Severity Score Badge matching Reference 2 */}
                <div className="item-score-badge">
                  <span className={`score-tag ${isCritical ? 'tag-critical' : 'tag-urgent'}`}>
                    {isCritical ? '🚨 98%' : '⚠️ 80%'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
