import { useState, useEffect, useRef, useCallback } from 'react';

const ISS_POSITION_URL = '/api/iss/iss-now.json';
const ISS_ASTROS_URL = '/api/iss/astros.json';
const NOMINATIM_URL = '/api/nominatim/reverse';
const POLL_INTERVAL = 15000;
const MAX_TRAJECTORY = 15;
const MAX_SPEED_HISTORY = 30;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useISS() {
  const [position, setPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [location, setLocation] = useState('Calculating...');
  const [astronauts, setAstronauts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevRef = useRef(null);
  const prevTimeRef = useRef(null);
  const geocodeTimeoutRef = useRef(null);

  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json&zoom=5&accept-language=en`,
        { headers: { 'User-Agent': 'ISS-Dashboard/1.0' } }
      );
      if (!res.ok) throw new Error('Geocode failed');
      const data = await res.json();
      if (data.display_name) {
        const parts = data.display_name.split(', ');
        setLocation(parts.slice(0, 2).join(', '));
      } else {
        setLocation('Over Ocean');
      }
    } catch {
      setLocation('Over Ocean / Unknown');
    }
  }, []);

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch(ISS_POSITION_URL);
      if (!res.ok) throw new Error('Failed to fetch ISS position');
      const data = await res.json();
      const lat = parseFloat(data.iss_position.latitude);
      const lon = parseFloat(data.iss_position.longitude);
      const now = Date.now();

      setPosition({ lat, lon });
      setTrajectory(prev => {
        const updated = [...prev, [lat, lon]];
        return updated.slice(-MAX_TRAJECTORY);
      });

      // Calculate speed
      if (prevRef.current && prevTimeRef.current) {
        const dist = haversineDistance(
          prevRef.current.lat,
          prevRef.current.lon,
          lat,
          lon
        );
        const timeDiffHours = (now - prevTimeRef.current) / 3600000;
        if (timeDiffHours > 0) {
          const spd = Math.round(dist / timeDiffHours);
          // ISS speed is ~28000 km/h, filter out obviously wrong values
          const clampedSpeed = Math.min(spd, 35000);
          setSpeed(clampedSpeed);
          setSpeedHistory(prev => {
            const updated = [
              ...prev,
              { time: new Date(now).toLocaleTimeString(), speed: clampedSpeed },
            ];
            return updated.slice(-MAX_SPEED_HISTORY);
          });
        }
      }

      prevRef.current = { lat, lon };
      prevTimeRef.current = now;

      // Reverse geocode every fetch
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
      geocodeTimeoutRef.current = setTimeout(() => reverseGeocode(lat, lon), 500);

      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [reverseGeocode]);

  const fetchAstronauts = useCallback(async () => {
    try {
      const res = await fetch(ISS_ASTROS_URL);
      if (!res.ok) throw new Error('Failed to fetch astronauts');
      const data = await res.json();
      setAstronauts(data.people || []);
    } catch (err) {
      console.error('Astronaut fetch error:', err);
    }
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPosition();
    fetchAstronauts();
  }, [fetchPosition, fetchAstronauts]);

  useEffect(() => {
    fetchPosition();
    fetchAstronauts();
    const interval = setInterval(fetchPosition, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, [fetchPosition, fetchAstronauts]);

  return {
    position,
    trajectory,
    speed,
    speedHistory,
    location,
    astronauts,
    loading,
    error,
    retry,
  };
}
