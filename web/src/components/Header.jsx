import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Send,
  MapPin,
  Clock,
  Box,
  CloudSun,
} from 'lucide-react';
import { playClickFeedback } from '../utils/sound';

export default function Header({
  isConnected = false,
  soundEnabled = true,
  activeCount = 0,
  onToggleSound,
  onOpenSimulateModal,
}) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="haven-glass-header">
      {/* Left Operations Title */}
      <div className="header-brand-group">
        <div className="brand-symbol-box">
          <ShieldAlert size={20} className="text-red" />
          <span className="brand-pulse-ring" />
        </div>
        <div className="brand-title-group">
          <div className="brand-main-text">
            <span>HAVEN</span>
            <span className="brand-ops-tag">OPS CONSOLE</span>
          </div>
          <span className="brand-subtext">Bacolod Metropolitan Dispatch Network</span>
        </div>
      </div>

      {/* Center Frosted Glass Pills matching Reference 3 ("ShotScope") */}
      <div className="header-frosted-pills-bar">
        {/* Active Alert Count Pill */}
        <div className="frosted-pill">
          <ShieldAlert size={13} className="text-red" />
          <span>{activeCount} Active SOS</span>
        </div>

        {/* Region Pill */}
        <div className="frosted-pill">
          <MapPin size={13} className="text-cyan" />
          <span>Bacolod Central Command</span>
        </div>

        {/* 3D City Engine Active Pill */}
        <div className="frosted-pill mode-active-pill">
          <Box size={13} className="text-mint" />
          <span>3D City Space • Active</span>
        </div>

        {/* Live Weather & Telemetry */}
        <div className="frosted-pill weather-pill">
          <CloudSun size={14} className="text-amber" />
          <span>28°C Clear</span>
        </div>

        {/* Live Clock */}
        <div className="frosted-pill clock-pill">
          <Clock size={13} className="text-muted" />
          <span className="time-mono">{timeString}</span>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="header-action-group">
        {/* Connection status indicator */}
        <div className={`connection-pill ${isConnected ? 'connected' : 'offline'}`}>
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? 'ONLINE 14ms' : 'CONNECTING...'}</span>
        </div>

        {/* Audio Siren Toggle */}
        <button
          className={`header-tool-btn ${soundEnabled ? 'active' : 'muted'}`}
          onClick={() => {
            playClickFeedback();
            onToggleSound();
          }}
          title={soundEnabled ? 'Audio alerts active (click to mute)' : 'Audio muted (click to unmute)'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* SOS Dispatch Simulator Modal Trigger */}
        <button
          className="header-simulate-btn"
          onClick={() => {
            playClickFeedback();
            onOpenSimulateModal();
          }}
        >
          <Send size={14} />
          <span>Simulate SOS</span>
        </button>
      </div>
    </header>
  );
}
