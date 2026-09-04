import React from 'react';
import { BarChart3, Activity, CheckCircle2, Clock, ShieldAlert, HeartPulse, Zap } from 'lucide-react';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

const AnalyticsView = ({ stats = {} }) => {
  const {
    totalReports = 0,
    activeReports = 0,
    resolvedReports = 0,
    avgResponseSeconds = 0,
  } = stats;

  const animatedTotal = useAnimatedCounter(totalReports);
  const animatedActive = useAnimatedCounter(activeReports);
  const animatedResolved = useAnimatedCounter(resolvedReports);

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
        <BarChart3 size={28} className="text-cyan" />
        <h2>Operational Telemetry & Performance Metrics</h2>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap total">
            <ShieldAlert size={26} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total Logged</span>
            <span className="stat-number">{animatedTotal}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap active">
            <Activity size={26} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Active Incidents</span>
            <span className="stat-number" style={{ color: 'var(--accent-crimson)' }}>
              {animatedActive}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap resolved">
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Dispatched & Resolved</span>
            <span className="stat-number" style={{ color: 'var(--accent-emerald)' }}>
              {animatedResolved}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap time">
            <Clock size={26} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Avg. Turnaround</span>
            <span className="stat-number" style={{ color: 'var(--accent-amber)', fontSize: '1.55rem' }}>
              {formatAvgTime(avgResponseSeconds)}
            </span>
          </div>
        </div>
      </div>

      <div className="analytics-breakdown-card">
        <h3>Emergency Resolution Efficiency</h3>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(5, resolutionRate))}%` }}
          />
        </div>
        <div className="progress-legend">
          <span>{resolvedReports} of {totalReports} total incidents neutralized</span>
          <strong>{resolutionRate}% Response Efficiency</strong>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        <div className="analytics-breakdown-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
            <HeartPulse size={18} className="text-red" />
            <span>Frequent Incident Classifications</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span>Respiratory Distress / Choking</span>
              <strong className="text-red">42%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span>Vehicle Trauma / Fractures</span>
              <strong className="text-amber">28%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span>Heatstroke & Hyperthermia</span>
              <strong className="text-cyan">18%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span>Toxic Ingestion / Allergic Shock</span>
              <strong className="text-emerald">12%</strong>
            </div>
          </div>
        </div>

        <div className="analytics-breakdown-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
            <Zap size={18} className="text-cyan" />
            <span>Target Response Readiness Benchmark</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              <span>Target Dispatch Time: <strong>&lt; 3.0 mins</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
              <span>Average Arrival Velocity: <strong>38 km/h</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)' }} />
              <span>Bacolod Urban Coverage: <strong>99.4% radius</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
