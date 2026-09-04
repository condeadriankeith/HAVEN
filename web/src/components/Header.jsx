import React, { useState, useEffect } from 'react';
import { ShieldAlert, Wifi, WifiOff } from 'lucide-react';

const Header = ({ isConnected }) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toISOString().replace('T', ' ').substring(0, 19));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="haven-header">
      <div className="header-left">
        <ShieldAlert className="header-icon" size={28} />
        <h1 className="header-title">HAVEN - Pet Emergency Response System</h1>
      </div>

      <div className="header-right">
        <div className={`connection-status ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{isConnected ? 'System Online' : 'Connecting...'}</span>
        </div>
        <div className="header-info">
          <span className="region-tag">Region: Bacolod City</span>
          <span className="divider">|</span>
          <span className="clock-tag">{timeString}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
