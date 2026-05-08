import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Gauge, Globe, Users, Navigation, Satellite } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SkeletonMap } from './Skeleton';
import { ErrorBoundaryUI } from './ErrorBoundary';
import 'leaflet/dist/leaflet.css';

// Custom ISS icon
const issIcon = new L.DivIcon({
  html: `<div style="
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 0 20px rgba(59,130,246,0.6), 0 0 40px rgba(139,92,246,0.3);
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M12 2L12 22M2 12L22 12M7 7L17 17M17 7L7 17"/>
    </svg>
  </div>`,
  className: 'iss-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Move map smoothly
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lon], map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);
  return null;
}

function StatCard({ icon: Icon, label, value, color, theme }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50'
          : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
      }`}
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p
          className={`text-xs font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {label}
        </p>
        <p
          className={`text-sm font-bold truncate ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ISSSection({ issData }) {
  const { theme } = useTheme();
  const { position, trajectory, speed, location, astronauts, loading, error, retry } =
    issData;
  const [showAstronauts, setShowAstronauts] = useState(false);

  if (error) {
    return (
      <section id="iss-section" className="animate-fade-in">
        <SectionHeader theme={theme} />
        <ErrorBoundaryUI message={error} onRetry={retry} />
      </section>
    );
  }

  if (loading) {
    return (
      <section id="iss-section">
        <SectionHeader theme={theme} />
        <SkeletonMap />
      </section>
    );
  }

  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <section id="iss-section" className="space-y-4 animate-fade-in">
      <SectionHeader theme={theme} />

      {/* Map */}
      <div
        className={`rounded-xl overflow-hidden border ${
          theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'
        }`}
        style={{ height: '380px' }}
      >
        {position && (
          <MapContainer
            center={[position.lat, position.lon]}
            zoom={3}
            scrollWheelZoom={true}
            zoomControl={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url={tileUrl} />
            <Marker position={[position.lat, position.lon]} icon={issIcon} />
            {trajectory.length > 1 && (
              <Polyline
                positions={trajectory}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 2,
                  opacity: 0.7,
                  dashArray: '5, 10',
                }}
              />
            )}
            <MapUpdater position={position} />
          </MapContainer>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={MapPin}
          label="Latitude"
          value={position ? position.lat.toFixed(4) + '°' : '—'}
          color="bg-blue-600"
          theme={theme}
        />
        <StatCard
          icon={Navigation}
          label="Longitude"
          value={position ? position.lon.toFixed(4) + '°' : '—'}
          color="bg-purple-600"
          theme={theme}
        />
        <StatCard
          icon={Gauge}
          label="Speed"
          value={speed ? `${speed.toLocaleString()} km/h` : 'Calculating...'}
          color="bg-emerald-600"
          theme={theme}
        />
        <StatCard
          icon={Globe}
          label="Location"
          value={location}
          color="bg-amber-600"
          theme={theme}
        />
      </div>

      {/* Astronauts */}
      <div
        className={`rounded-xl border transition-all duration-300 ${
          theme === 'dark'
            ? 'border-slate-700/50 bg-slate-800/40'
            : 'border-slate-200 bg-white'
        }`}
      >
        <button
          onClick={() => setShowAstronauts(prev => !prev)}
          className={`w-full flex items-center justify-between p-4 cursor-pointer rounded-xl transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
          }`}
          aria-expanded={showAstronauts}
          aria-controls="astronaut-list"
          id="astronauts-toggle"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3
                className={`text-sm font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                People in Space
              </h3>
              <p
                className={`text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {astronauts.length} astronauts currently in orbit
              </p>
            </div>
          </div>
          <span
            className={`text-2xl font-black ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`}
          >
            {astronauts.length}
          </span>
        </button>

        {showAstronauts && (
          <div
            id="astronaut-list"
            className={`px-4 pb-4 border-t ${
              theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
              {astronauts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2.5 rounded-lg animate-fade-in ${
                    theme === 'dark'
                      ? 'bg-slate-700/40 hover:bg-slate-700/60'
                      : 'bg-slate-50 hover:bg-slate-100'
                  } transition-colors`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white'
                    }`}
                  >
                    {a.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {a.name}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {a.craft}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SectionHeader({ theme }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
        <Satellite className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2
          className={`text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          ISS Live Tracker
        </h2>
        <p
          className={`text-xs ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Real-time position • Updated every 15s
        </p>
      </div>
    </div>
  );
}
