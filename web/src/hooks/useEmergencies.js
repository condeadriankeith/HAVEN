import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import {
  fetchActiveEmergencies,
  updateEmergencyStatus,
  calculateShortestPath,
  fetchEmergencyStatistics,
} from '../services/api';
import { decodePolyline } from '../utils/polyline';
import {
  playEmergencyAlarm,
  playSuccessChime,
  playClickFeedback,
  playRadarBlip,
} from '../utils/sound';

export const DEFAULT_VET_LAT = 10.6765;
export const DEFAULT_VET_LNG = 122.9509;

// Extracts coordinates reliably from multiple backend formats
export function extractCoordinates(data) {
  let lat = DEFAULT_VET_LAT;
  let lng = DEFAULT_VET_LNG;

  if (data?.location?.latitude !== undefined && data?.location?.longitude !== undefined) {
    lat = parseFloat(data.location.latitude);
    lng = parseFloat(data.location.longitude);
  } else if (data?.latitude !== undefined && data?.longitude !== undefined) {
    lat = parseFloat(data.latitude);
    lng = parseFloat(data.longitude);
  } else if (data?.emergency?.location) {
    lat = parseFloat(data.emergency.location.latitude);
    lng = parseFloat(data.emergency.location.longitude);
  }

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    lat = DEFAULT_VET_LAT;
    lng = DEFAULT_VET_LNG;
  }

  return { lat, lng };
}

// Formats raw emergency data into tactical unified structure
export function formatEmergency(raw) {
  const coords = extractCoordinates(raw);
  const id = raw.emergencyId || raw.id || `EMG-${Date.now().toString().slice(-4)}`;
  const title = raw.emergencyType || raw.type || 'Pet Emergency';
  const description = raw.notes || raw.additionalDetails || raw.description || 'Emergency reported by owner';
  const owner = raw.userName || (raw.contactInfo && raw.contactInfo.name) || 'Pet Owner';
  const phone = raw.userPhone || (raw.contactInfo && raw.contactInfo.phone) || '';
  const email = raw.userEmail || (raw.contactInfo && raw.contactInfo.email) || '';
  const pets = raw.userPets || raw.pets || '[]';
  const status = raw.status || 'ACTIVE';
  const reportedAt = raw.reportedAt || raw.createdAt || new Date().toISOString();

  // Estimate distance and fee from Vet HQ
  const distKm = Math.sqrt(
    Math.pow((coords.lat - DEFAULT_VET_LAT) * 111, 2) +
    Math.pow((coords.lng - DEFAULT_VET_LNG) * 111 * Math.cos(coords.lat * (Math.PI / 180)), 2)
  );
  const emergencyFee = Math.max(150, Math.round(distKm * 60) + 120);

  // Determine severity tier
  let severity = 'URGENT';
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('respiratory') || lowerTitle.includes('shock') || lowerTitle.includes('trauma') || lowerTitle.includes('bleeding')) {
    severity = 'CRITICAL';
  }

  return {
    id,
    title,
    description,
    owner,
    phone,
    email,
    pets,
    lat: coords.lat,
    lng: coords.lng,
    status,
    severity,
    distanceKm: parseFloat(distKm.toFixed(2)),
    emergencyFee,
    reportedAt,
    raw,
  };
}

export function useEmergencies() {
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeReports: 0,
    resolvedReports: 0,
    avgResponseSeconds: 0,
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('haven_sound_enabled') !== 'false';
  });

  const toastTimerRef = useRef({});

  // Toast management
  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, duration: 4500, ...toast };
    setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

    toastTimerRef.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete toastTimerRef.current[id];
    }, newToast.duration);
  }, []);

  const dismissToast = useCallback((id) => {
    if (toastTimerRef.current[id]) {
      clearTimeout(toastTimerRef.current[id]);
      delete toastTimerRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('haven_sound_enabled', String(next));
      if (next) playClickFeedback();
      addToast({
        type: 'info',
        title: next ? 'Tactical Audio Siren Active' : 'Tactical Audio Muted',
        message: next ? 'Auditory sirens will sound on incoming SOS' : 'Siren muted',
      });
      return next;
    });
  };

  // Load initial records
  const loadData = useCallback(async () => {
    const rawList = await fetchActiveEmergencies();
    if (Array.isArray(rawList)) {
      const formatted = rawList.map(formatEmergency);
      setEmergencies(formatted);
    }

    const backendStats = await fetchEmergencyStatistics();
    if (backendStats) {
      setStats({
        totalReports: backendStats.totalReports || 0,
        activeReports: backendStats.activeReports || 0,
        resolvedReports: backendStats.processedReports || 0,
        avgResponseSeconds: backendStats.averageResponseTime || 0,
      });
    }
  }, []);

  // Handle incoming new emergency
  const handleNewEmergency = useCallback((raw) => {
    const formatted = formatEmergency(raw);
    setEmergencies((prev) => {
      if (prev.some((e) => e.id === formatted.id)) return prev;
      return [formatted, ...prev];
    });

    setStats((prev) => ({
      ...prev,
      totalReports: prev.totalReports + 1,
      activeReports: prev.activeReports + 1,
    }));

    if (soundEnabled) {
      playEmergencyAlarm();
    }

    addToast({
      type: 'emergency',
      title: `SOS: ${formatted.title}`,
      message: `${formatted.owner} reported incident at ${formatted.distanceKm}km away.`,
      duration: 6000,
    });
  }, [soundEnabled, addToast]);

  // Handle emergency status updates
  const handleStatusChange = useCallback((raw) => {
    const updated = formatEmergency(raw);
    if (updated.status === 'RESPONDED' || updated.status === 'RESOLVED') {
      setEmergencies((prev) => prev.filter((e) => e.id !== updated.id));
      setSelectedEmergency((prev) => (prev?.id === updated.id ? null : prev));
      setRouteCoordinates([]);
      setRouteInfo(null);

      setStats((prev) => ({
        ...prev,
        activeReports: Math.max(0, prev.activeReports - 1),
        resolvedReports: prev.resolvedReports + 1,
        avgResponseSeconds: prev.avgResponseSeconds > 0 ? Math.round((prev.avgResponseSeconds + 180) / 2) : 180,
      }));

      if (soundEnabled) {
        playSuccessChime();
      }

      addToast({
        type: 'success',
        title: 'Incident Dispatched & Acknowledged',
        message: `${updated.id} marked as responded.`,
      });
    }
  }, [soundEnabled, addToast]);

  // Socket setup
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    init();

    socketService.connect((connected) => {
      setIsConnected(connected);
    });

    socketService.onNewEmergency((data) => {
      handleNewEmergency(data);
    });

    socketService.onStatusChange((data) => {
      handleStatusChange(data);
    });

    return () => {
      socketService.disconnect();
    };
  }, [loadData, handleNewEmergency, handleStatusChange]);

  // Select emergency and calculate route
  const selectEmergency = async (emergency) => {
    if (soundEnabled) playRadarBlip();

    if (selectedEmergency?.id === emergency.id) {
      setSelectedEmergency(null);
      setRouteCoordinates([]);
      setRouteInfo(null);
      return;
    }

    setSelectedEmergency(emergency);
    setRouteCoordinates([]);
    setRouteInfo(null);

    const routeRes = await calculateShortestPath(
      DEFAULT_VET_LAT,
      DEFAULT_VET_LNG,
      emergency.lat,
      emergency.lng
    );

    if (routeRes && routeRes.route) {
      if (typeof routeRes.route === 'string') {
        const decoded = decodePolyline(routeRes.route);
        setRouteCoordinates(decoded);
      } else if (Array.isArray(routeRes.route)) {
        setRouteCoordinates(routeRes.route);
      }

      setRouteInfo({
        distanceKm: routeRes.distance ? parseFloat(routeRes.distance.toFixed(1)) : emergency.distanceKm,
        durationMin: routeRes.duration ? Math.ceil(routeRes.duration / 60) : Math.ceil(emergency.distanceKm * 2.5),
      });
    } else {
      setRouteCoordinates([
        [DEFAULT_VET_LAT, DEFAULT_VET_LNG],
        [emergency.lat, emergency.lng],
      ]);
      setRouteInfo({
        distanceKm: emergency.distanceKm,
        durationMin: Math.ceil(emergency.distanceKm * 2.5),
      });
    }
  };

  // Mark responded
  const markResponded = async (emergency) => {
    if (soundEnabled) playSuccessChime();

    await updateEmergencyStatus(emergency.id, 'RESPONDED');
    socketService.emitStatusUpdate(emergency.id, 'RESPONDED');

    setEmergencies((prev) => prev.filter((e) => e.id !== emergency.id));
    if (selectedEmergency?.id === emergency.id) {
      setSelectedEmergency(null);
      setRouteCoordinates([]);
      setRouteInfo(null);
    }

    setStats((prev) => ({
      ...prev,
      activeReports: Math.max(0, prev.activeReports - 1),
      resolvedReports: prev.resolvedReports + 1,
    }));

    addToast({
      type: 'success',
      title: 'Unit Dispatched',
      message: `Rescue team assigned to incident ${emergency.id}.`,
    });
  };

  return {
    emergencies,
    selectedEmergency,
    routeCoordinates,
    routeInfo,
    isConnected,
    toasts,
    stats,
    soundEnabled,
    hasUnattendedAlert: emergencies.some((e) => e.status === 'ACTIVE'),
    toggleSound,
    selectEmergency,
    markResponded,
    dismissToast,
    addToast,
    reload: loadData,
  };
}

export default useEmergencies;
