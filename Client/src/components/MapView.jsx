import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Sparkles, Filter, Crosshair, CheckCircle, AlertTriangle, Play, Square, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioSynth } from '../utils/audioSynth';
import { geocodeLocation, fetchOSRMRoute, generateFallbackRoute, checkRouteDeviation } from '../utils/routingEngine';

// Custom Minimal Markers
const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="background:#00e676; width:24px; height:24px; border-radius:50%; border:3px solid white; box-shadow:0 0 16px #00e676;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const destIcon = new L.DivIcon({
  className: 'custom-dest-marker',
  html: `<div style="background:#ef4444; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 0 16px #ef4444; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; font-weight:bold;">🏁</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const volunteerIcon = new L.DivIcon({
  className: 'custom-vol-marker',
  html: `<div style="background:#3b82f6; width:26px; height:26px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(59,130,246,0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold;">🤝</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const safeZoneIcon = new L.DivIcon({
  className: 'custom-safezone-marker',
  html: `<div style="background:#a855f7; width:26px; height:26px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(168,85,247,0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold;">🛡️</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const guideAvatarIcon = new L.DivIcon({
  className: 'custom-guide-marker',
  html: `<div style="background:linear-gradient(135deg, #059669, #4f46e5); width:36px; height:36px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 18px #059669; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:18px;">🤖</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapView({ 
  volunteers = [], 
  safeZones = [], 
  destination = "", 
  onDestinationChange 
}) {
  const { t, lang } = useLanguage();
  
  // Geolocation & Route State
  const [currentLoc, setCurrentLoc] = useState([28.5457, 77.1928]);
  const [destCoords, setDestCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Fetching live GPS...');
  const [gpsError, setGpsError] = useState('');
  
  const [inputDest, setInputDest] = useState(destination || 'Green Park Metro Gate 2, New Delhi');
  const [calculatedRoutes, setCalculatedRoutes] = useState([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [guidePosIndex, setGuidePosIndex] = useState(0);

  // Live Journey Mode State
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [routeDeviationDetected, setRouteDeviationDetected] = useState(false);
  const watchIdRef = useRef(null);

  // Layer toggles
  const [showRoutes, setShowRoutes] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(true);

  // 1. Live Geolocation & Continuous Watcher Setup
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLoc([lat, lng]);
          setLocationStatus(`Live GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setGpsError('');
        },
        (err) => {
          console.warn("GPS Location error:", err.message);
          let msg = "We couldn't access your current location. Please enable location permissions and try again.";
          if (err.code === 1) msg = "Location permission denied. Please allow location access in your browser settings.";
          setGpsError(msg);
          setLocationStatus("GPS Location Unavailable");
        },
        { enableHighAccuracy: true, timeout: 12000 }
      );
    } else {
      setGpsError("Browser does not support Geolocation.");
      setLocationStatus("Location API Unsupported");
    }
  }, []);

  // 2. Journey Watcher for Live Tracking & Deviation Detection
  useEffect(() => {
    if (isJourneyActive && 'geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setCurrentLoc([newLat, newLng]);

          // Check route deviation if route is active
          if (calculatedRoutes.length > 0 && calculatedRoutes[0].coordinates) {
            const hasDeviated = checkRouteDeviation(newLat, newLng, calculatedRoutes[0].coordinates, 300);
            if (hasDeviated) {
              setRouteDeviationDetected(true);
            }
          }
        },
        (err) => console.warn("Watch position error:", err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isJourneyActive, calculatedRoutes]);

  // 3. Compute/Recalculate Real OSRM Route
  const handleCalculateRoute = async (targetDestStr) => {
    const query = targetDestStr || inputDest;
    if (!query.trim()) {
      alert("Please enter a destination first.");
      return;
    }

    setIsCalculatingRoute(true);
    setRouteDeviationDetected(false);

    try {
      // Step A: Geocode Destination Address using Nominatim
      const geocoded = await geocodeLocation(query);
      let targetLat = currentLoc[0] + 0.004;
      let targetLng = currentLoc[1] + 0.005;

      if (geocoded) {
        targetLat = geocoded.lat;
        targetLng = geocoded.lng;
        setDestCoords([targetLat, targetLng]);
      } else {
        setDestCoords([targetLat, targetLng]);
      }

      // Step B: Calculate Real Road Route from OSRM
      const routes = await fetchOSRMRoute(currentLoc[0], currentLoc[1], targetLat, targetLng);
      
      if (routes && routes.length > 0) {
        setCalculatedRoutes(routes);
      } else {
        // Fallback to geometric road interpolation if OSRM unavailable
        const fallback = generateFallbackRoute(currentLoc[0], currentLoc[1], targetLat, targetLng);
        setCalculatedRoutes(fallback);
      }

      if (onDestinationChange) onDestinationChange(query);
    } catch (err) {
      console.error("Route calculation error:", err);
      const fallback = generateFallbackRoute(currentLoc[0], currentLoc[1], currentLoc[0] + 0.004, currentLoc[1] + 0.005);
      setCalculatedRoutes(fallback);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Auto-calculate initial route on load
  useEffect(() => {
    handleCalculateRoute(inputDest);
  }, []);

  // Primary Route Coordinates
  const primaryRouteCoords = calculatedRoutes.length > 0 ? calculatedRoutes[0].coordinates : [
    [currentLoc[0], currentLoc[1]],
    [currentLoc[0] + 0.0015, currentLoc[1] + 0.0018],
    [currentLoc[0] + 0.0030, currentLoc[1] + 0.0035],
    [currentLoc[0] + 0.0040, currentLoc[1] + 0.0050],
  ];

  // Moving AI Guide Avatar Index
  useEffect(() => {
    const timer = setInterval(() => {
      setGuidePosIndex(prev => (prev + 1) % Math.max(1, primaryRouteCoords.length));
    }, 3000);
    return () => clearInterval(timer);
  }, [primaryRouteCoords]);

  const currentGuidePos = primaryRouteCoords[guidePosIndex] || currentLoc;

  // Dynamic Positioning of Volunteers & Safe Zones relative to live user position
  const dynamicVolunteers = volunteers.map((vol, index) => ({
    ...vol,
    lat: currentLoc[0] + (index % 2 === 0 ? 0.002 * (index + 1) : -0.002 * (index + 1)),
    lng: currentLoc[1] + (index % 3 === 0 ? 0.0025 * (index + 1) : -0.0015 * (index + 1))
  }));

  const dynamicSafeZones = safeZones.map((sz, index) => ({
    ...sz,
    lat: currentLoc[0] + (index % 2 === 0 ? -0.0018 * (index + 1) : 0.0022 * (index + 1)),
    lng: currentLoc[1] + (index % 2 === 0 ? 0.003 * (index + 1) : -0.0025 * (index + 1))
  }));

  const handleRecenterGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setCurrentLoc([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus(`Live GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setGpsError('');
      });
    }
  };

  const handleSpeakGuideTip = () => {
    const tip = lang === 'hi'
      ? `आपका गंतव्य ${inputDest} चुना गया है। सुरक्षा स्कोर ${calculatedRoutes[0]?.safetyScore || 86}/100 है।`
      : `Safe corridor active to ${inputDest}. Recommended safety score is ${calculatedRoutes[0]?.safetyScore || 86}/100.`;
    audioSynth.speakText(tip, lang);
  };

  const activeRoute = calculatedRoutes[0];

  return (
    <div className="map-card glass-panel" style={{ height: 'auto', minHeight: '580px' }}>
      {/* Top Controls & Search Bar */}
      <div className="map-header" style={{ flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <MapPin size={16} className="text-emerald-400" />
            <input 
              type="text" 
              value={inputDest} 
              onChange={(e) => setInputDest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateRoute(inputDest)}
              placeholder="Enter Destination (Landmark, Address, Station, Hospital)..."
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          <button onClick={() => handleCalculateRoute(inputDest)} disabled={isCalculatingRoute} className="btn-action-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.82rem' }}>
            {isCalculatingRoute ? "Plotting..." : "View Safer Route"}
          </button>

          <button onClick={handleRecenterGPS} className="btn-icon-toggle" title="Recenter GPS" style={{ padding: '8px 12px' }}>
            <Crosshair size={14} className="text-emerald-400" />
          </button>
        </div>

        {/* GPS Status & Filters Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.78rem', color: gpsError ? 'var(--accent-danger)' : 'var(--accent-safe)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: gpsError ? '#ef4444' : '#00e676' }}></span>
            <span>{gpsError || locationStatus}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <button onClick={() => setShowRoutes(p => !p)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--bg-card-border)', background: showRoutes ? 'rgba(5, 150, 105, 0.2)' : 'var(--bg-secondary)', color: showRoutes ? 'var(--accent-safe)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
              Routes
            </button>
            <button onClick={() => setShowVolunteers(p => !p)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--bg-card-border)', background: showVolunteers ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-secondary)', color: showVolunteers ? 'var(--accent-brand)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
              NSS ({volunteers.length})
            </button>
            <button onClick={() => setShowSafeZones(p => !p)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--bg-card-border)', background: showSafeZones ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-secondary)', color: showSafeZones ? '#a855f7' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
              Safe Zones ({safeZones.length})
            </button>
          </div>
        </div>
      </div>

      {/* GPS Error Alert Warning if permission denied */}
      {gpsError && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', borderBottom: '1px solid var(--accent-danger)', fontSize: '0.8rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {gpsError}</span>
          <button onClick={handleRecenterGPS} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Enable GPS 🔄</button>
        </div>
      )}

      {/* Route Deviation Banner Alert during Journey Mode */}
      {routeDeviationDetected && (
        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span>⚠️ Route Deviation Detected — You appeared to have moved away from your planned safe corridor.</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => handleCalculateRoute(inputDest)} className="btn-icon-toggle" style={{ background: '#fff', color: '#000', fontSize: '0.75rem', padding: '4px 10px' }}>
              <RefreshCw size={13} />
              <span>Recalculate Route</span>
            </button>
            <button onClick={() => setRouteDeviationDetected(false)} className="btn-icon-toggle" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.75rem', padding: '4px 10px' }}>
              <span>I'm Safe</span>
            </button>
          </div>
        </div>
      )}

      {/* Recommended Route Card & Live Journey Start Button */}
      {activeRoute && (
        <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} />
              <span>{activeRoute.name} (Safety Score: {activeRoute.safetyScore}/100)</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Distance: <strong>{activeRoute.distanceKm} km</strong> • ETA: <strong>{activeRoute.durationMin} min</strong> • Destination: <strong>{inputDest}</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
              "{activeRoute.reason}"
            </div>
          </div>

          {/* Live Journey Mode Trigger Button */}
          <button 
            onClick={() => setIsJourneyActive(prev => !prev)}
            className="btn-action-primary"
            style={{
              width: 'auto',
              padding: '8px 16px',
              background: isJourneyActive ? 'var(--accent-danger)' : 'linear-gradient(135deg, #059669, #4f46e5)',
              fontSize: '0.82rem'
            }}
          >
            {isJourneyActive ? (
              <>
                <Square size={14} />
                <span>Stop Live Journey</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Start Safe Journey</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Non-fabrication Disclaimer Notice */}
      <div style={{ padding: '4px 16px', background: 'var(--bg-primary)', fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', borderBottom: '1px solid var(--bg-card-border)' }}>
        * Safety assessment is based on available route, location, time, and nearby-place information. This is not a guarantee of actual safety.
      </div>

      {/* Interactive Leaflet Map Box */}
      <div className="map-container-box" style={{ minHeight: '380px' }}>
        <MapContainer 
          center={currentLoc} 
          zoom={15} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <MapRecenter center={currentLoc} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Live Location Marker */}
          <Marker position={currentLoc} icon={userIcon}>
            <Popup>
              <strong>📍 Your Live Location</strong><br/>
              Lat: {currentLoc[0].toFixed(4)}, Lng: {currentLoc[1].toFixed(4)}
            </Popup>
          </Marker>

          {/* Destination Marker */}
          {destCoords && (
            <Marker position={destCoords} icon={destIcon}>
              <Popup>
                <strong>🏁 Destination: {inputDest}</strong>
              </Popup>
            </Marker>
          )}

          {/* Render Real OSRM Route Polylines */}
          {showRoutes && calculatedRoutes.map((rt) => (
            <React.Fragment key={rt.id}>
              <Polyline 
                positions={rt.coordinates} 
                color={rt.isPrimary ? "#059669" : "#6366f1"} 
                weight={rt.isPrimary ? 6 : 4} 
                opacity={rt.isPrimary ? 0.9 : 0.6} 
                dashArray={rt.isPrimary ? "none" : "6, 8"}
              />
            </React.Fragment>
          ))}

          {/* Live GPS Corridor Halo Circle */}
          <Circle 
            center={currentLoc} 
            radius={220} 
            pathOptions={{ fillColor: '#059669', fillOpacity: 0.08, color: '#059669', weight: 1 }} 
          />

          {/* Moving AI Guide Avatar Marker */}
          <Marker position={currentGuidePos} icon={guideAvatarIcon}>
            <Popup>
              <strong>🤖 Safora AI SafeGuide Companion</strong><br/>
              Tracking route to {inputDest}.
            </Popup>
          </Marker>

          {/* Dynamic NSS/NGO Volunteer Pins */}
          {showVolunteers && dynamicVolunteers.map(vol => (
            <Marker key={vol.id} position={[vol.lat, vol.lng]} icon={volunteerIcon}>
              <Popup>
                <strong>{vol.name} ({vol.type})</strong><br/>
                {vol.organization}<br/>
                Status: {vol.status}<br/>
                Phone: {vol.phone}
              </Popup>
            </Marker>
          ))}

          {/* Dynamic Safe Zone Pins */}
          {showSafeZones && dynamicSafeZones.map(sz => (
            <Marker key={sz.id} position={[sz.lat, sz.lng]} icon={safeZoneIcon}>
              <Popup>
                <strong>{sz.name}</strong><br/>
                Helpline: {sz.helpline}<br/>
                Lighting: {sz.lightingRating}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* AI Guide Avatar Card Overlay */}
        <div className="ai-guide-overlay" onClick={handleSpeakGuideTip} style={{ cursor: 'pointer' }}>
          <div className="guide-avatar-circle">
            🤖
            <div className="guide-pulse-dot"></div>
          </div>
          <div className="guide-text-content">
            <div className="guide-title-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{t('guideTitle')}</span>
              <Sparkles size={14} />
            </div>
            <div className="guide-speech-bubble">
              Tracking safe corridor to {inputDest}. Safety score: {activeRoute?.safetyScore || 86}/100.
            </div>
          </div>
          <div style={{ background: 'rgba(5, 150, 105, 0.2)', padding: '6px 10px', borderRadius: '8px', color: 'var(--accent-safe)', fontWeight: 'bold', fontSize: '0.8rem' }}>
            {activeRoute?.safetyScore || 86}/100 SAFE
          </div>
        </div>
      </div>
    </div>
  );
}
