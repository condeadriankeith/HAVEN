import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer = ({ toasts = [], onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-portal-container" aria-live="polite">
      {toasts.map((toast) => {
        const iconMap = {
          emergency: <AlertCircle className="toast-icon text-red" size={20} />,
          success: <CheckCircle2 className="toast-icon text-emerald" size={20} />,
          info: <Info className="toast-icon text-cyan" size={20} />,
        };

        return (
          <div
            key={toast.id}
            className={`tactical-toast ${toast.type || 'info'}`}
            role="alert"
          >
            <div className="toast-glow-bar" />
            <div className="toast-body">
              <div className="toast-icon-wrap">
                {iconMap[toast.type] || iconMap.info}
              </div>
              <div className="toast-text">
                <strong className="toast-title">{toast.title}</strong>
                {toast.message && <p className="toast-msg">{toast.message}</p>}
              </div>
              <button
                className="toast-close"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
            <div className="toast-timer-bar" style={{ animationDuration: `${toast.duration || 4000}ms` }} />
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
