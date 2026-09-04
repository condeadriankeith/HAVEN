import React, { useState, useEffect } from 'react';
import { ShieldAlert, Wifi, WifiOff, Volume2, VolumeX, Send, MapPin, Clock, Radio } from 'lucide-react';
import { playClickFeedback } from '../utils/sound';

const Header = ({
  isConnected = false,
  soundEnabled = true,
  activeCount = 0,
  onToggleSound,
  onOpenSimulateModal,
}) => {
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

  const handleSoundToggleClick = () => {
    playClickFeedback();
    onToggleSound();
  };

  const handleSimulateClick = () => {
    playClickFeedback();
    onOpenSimulateModal();
  };

  return (
    <header className="haven-header">
      <div className="header-left">
        <div className="brand-icon-wrap" title="HAVEN Emergency Response Network">
          <ShieldAlert size={22} />
          <div className="brand-ping" />
        </div>

        <div className="brand-text">
          <div className="brand-title">
            HAVEN <span className="brand-badge">Command Center</span>
          </div>
          <span className="brand-subtitle">Pet Emergency Response & Dispatch Hub</span>
        </div>

        {/* Live Incident Activity Ticker */}
        <div className="header-ticker-wrap">
          <span className="ticker-dot" />
          <span>
            {activeCount > 0
              ? `LIVE DISPATCH ACTIVE: ${activeCount} INCIDENT(S) UNDER MONITORING`
              : 'NETWORK QUIET // ALL SECTORS OPTIMAL // 0 ACTIVE INCIDENTS'}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Simulate SOS Trigger */}
        <button
          className="btn-simulate-sos"
          onClick={handleSimulateClick}
          title="Simulate incoming mobile emergency alert"
        >
          <Send size={14} />
          <span>Simulate Mobile SOS</span>
        </button>

        {/* Tactical Siren Audio Toggle */}
        <button
          className={`btn-icon-tactile ${soundEnabled ? 'active' : ''}`}
          onClick={handleSoundToggleClick}
          title={soundEnabled ? 'Audio Siren Active (Click to Mute)' : 'Audio Muted (Click to Unmute)'}
          aria-label="Toggle Siren"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Live Telemetry Bar */}
        <div className="telemetry-bar">
          <div className="telemetry-node">
            <MapPin size={13} className="text-cyan" />
            <span>Bacolod City HQ</span>
          </div>
          <div className="telemetry-sep" />
          <div className="telemetry-node">
            <Radio size={13} className="text-emerald" />
            <span>Ping: <strong>14ms</strong></span>
          </div>
          <div className="telemetry-sep" />
          <div className="telemetry-node">
            <Clock size={13} className="text-amber" />
            <strong>{timeString}</strong>
          </div>
        </div>

        {/* Connection Indicator */}
        <div className={`connection-indicator ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? 'Telemetry Online' : 'Connecting...'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
