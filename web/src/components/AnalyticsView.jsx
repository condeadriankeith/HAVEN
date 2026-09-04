import React from 'react';
import { BarChart3, Activity, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

const AnalyticsView = ({ stats }) => {
  const { totalReports, activeReports, resolvedReports, avgResponseSeconds } = stats;

  const formatAvgTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0m 00s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    return `${mins}m ${String(remSecs).padStart(2, '0')}s`;
  };

  const resolutionRate = totalReports > 0
    ? Math.round((resolvedReports / totalReports) * 100)
    : 100;

  return (
    <div className="analytics-view-container">
      <div className="analytics-header">
        <BarChart3 size={26} className="text-red" />
        <h2>Emergency Telemetry & Operational Analytics</h2>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap total">
            <ShieldAlert size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Reports</span>
            <span className="stat-value">{totalReports}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap active">
            <Activity size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Emergencies</span>
            <span className="stat-value">{activeReports}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap resolved">
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Resolved / Responded</span>
            <span className="stat-value">{resolvedReports}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap time">
            <Clock size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg. Response Time</span>
            <span className="stat-value">{formatAvgTime(avgResponseSeconds)}</span>
          </div>
        </div>
      </div>

      <div className="analytics-breakdown-card">
        <h3>Incident Resolution Rate</h3>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(5, resolutionRate))}%` }}
          />
        </div>
        <div className="progress-info">
          <span>{resolvedReports} out of {totalReports} incidents dispatched & resolved</span>
          <strong>{resolutionRate}% Efficiency</strong>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
