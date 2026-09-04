import React, { useState, useEffect } from 'react';
import { ShieldAlert, Wifi, WifiOff, Volume2, VolumeX, Send, MapPin, Clock } from 'lucide-react';

const Header = ({ isConnected, soundEnabled, onToggleSound, onOpenSimulateModal }) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds} PST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="haven-header">
      <div className="header-left">
        <div className="brand-icon-wrap">
          <ShieldAlert size={22} />
          <div className="brand-ping" />
        </div>
        <div className="brand-text">
          <div className="brand-title">
            HAVEN <span className="brand-badge">Command Center</span>
          </div>
          <span className="brand-subtitle">Pet Emergency Rapid Response System</span>
        </div>
      </div>

      <div className="header-right">
        {/* Trigger test SOS alert directly from browser */}
        <button
          className="btn-simulate-sos"
          onClick={onOpenSimulateModal}
          title="Open SOS Dispatch Simulator"
        >
          <Send size={15} />
          <span>Simulate Mobile SOS</span>
        </button>

        {/* Audio Siren Toggle */}
        <button
          className={`btn-icon-toggle ${soundEnabled ? 'active' : ''}`}
          onClick={onToggleSound}
          title={soundEnabled ? 'Audio Siren Enabled (Click to Mute)' : 'Audio Siren Muted (Click to Enable)'}
          aria-label="Toggle Siren"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Live Telemetry Bar */}
        <div className="header-telemetry">
          <div className="telemetry-item">
            <MapPin size={13} />
            <span>Bacolod City</span>
          </div>
          <div className="telemetry-divider" />
          <div className="telemetry-item">
            <Clock size={13} />
            <span className="clock-val">{timeString}</span>
          </div>
        </div>

        {/* Connection Status Pill */}
        <div className={`connection-pill ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isConnected ? 'Telemetry Online' : 'Connecting...'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
