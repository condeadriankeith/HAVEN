import React from 'react';
import { BarChart2, Activity, Clock, FileText } from 'lucide-react';

const AnalyticsView = ({ totalReports, activeReports, resolvedReports, avgResponseSeconds }) => {
  const formatAvgTime = (seconds) => {
    if (!seconds || seconds <= 0) return '--';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="analytics-view-container">
      <div className="analytics-header">
        <BarChart2 size={24} className="header-icon" />
        <h2>Analytics Dashboard</h2>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap total">
            <FileText size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Reports</span>
            <span className="stat-value">{totalReports}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap active">
            <Activity size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Reports</span>
            <span className="stat-value">{activeReports}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap time">
            <Clock size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg. Response Time</span>
            <span className="stat-value">{formatAvgTime(avgResponseSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
