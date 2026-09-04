import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.ws = null;
    this.onEmergencyCallback = null;
    this.onStatusCallback = null;
    this.onConnectionChangeCallback = null;
  }

  connect(onConnectionChange) {
    this.onConnectionChangeCallback = onConnectionChange;

    // Connect using Socket.IO
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket.id);
      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(true);
      }
      this.socket.emit('subscribe-emergency-alerts', {});
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(false);
      }
    });

    this.socket.on('new-emergency-alert', (data) => {
      console.log('Socket.IO new emergency alert:', data);
      const emergency = data.emergency || data;
      if (this.onEmergencyCallback) {
        this.onEmergencyCallback(emergency);
      }
    });

    this.socket.on('emergency-status-changed', (data) => {
      console.log('Socket.IO status update:', data);
      const emergency = data.emergency || data;
      if (this.onStatusCallback) {
        this.onStatusCallback(emergency);
      }
    });

    // Fallback native WebSocket connection
    this.connectNativeWs();
  }

  connectNativeWs() {
    try {
      const wsUrl = SOCKET_URL.replace(/^http/, 'ws');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Native WebSocket connected');
        this.ws.send(JSON.stringify({ type: 'subscribe-emergency-alerts' }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new-emergency-alert' && this.onEmergencyCallback) {
            this.onEmergencyCallback(data.emergency || data);
          } else if (data.type === 'emergency-status-changed' && this.onStatusCallback) {
            this.onStatusCallback(data.emergency || data);
          }
        } catch (e) {
          console.error('Error parsing native WS message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('Native WebSocket closed');
      };
    } catch (err) {
      console.error('Failed to connect native WS:', err);
    }
  }

  onNewEmergency(callback) {
    this.onEmergencyCallback = callback;
  }

  onStatusChange(callback) {
    this.onStatusCallback = callback;
  }

  emitStatusUpdate(emergencyId, newStatus) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('emergency-status-update', {
        emergencyId,
        newStatus,
      });
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'emergency-status-update',
          emergency: { emergencyId, status: newStatus },
        })
      );
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const socketService = new SocketService();
export default socketService;
