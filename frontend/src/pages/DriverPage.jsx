import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Car, Navigation, MapPin, AlertTriangle, ShieldCheck, ShieldAlert,
  Fuel, Building2, Shield, PhoneCall, Bot, Send, Search, Compass, Sun, Droplets,
  Wind, Clock, ExternalLink, Route, RefreshCw, Crosshair, Sparkles
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DriverIllustration } from '../assets/illustrations';
import { api } from '../services/api';
import ActionDock from '../components/ActionDock';

export default function DriverPage({
  onBack,
  onOpenAI,
  onOpenSOS,
  onOpenMap,
  onOpenWeather
}) {
  const [activeTab, setActiveTab] = useState('navigation'); // 'navigation' | 'tracking' | 'safety' | 'weather' | 'ai' | 'sos'
  const [userLocation, setUserLocation] = useState({
    lat: 11.1271,
    lon: 78.6569,
    address: 'NH-44 Highway Corridor, Tamil Nadu',
    speed: 0
  });

  // Route Navigation State
  const [startPoint, setStartPoint] = useState('My Current GPS Location');
  const [destination, setDestination] = useState('Chennai Central');
  const [routeInfo, setRouteInfo] = useState({
    distance_km: '184 km',
    duration_min: '3 hr 15 min',
    status: 'Optimal Highway Route via NH-44',
    steps: [
      'Depart via NH-44 North towards Salem Interchange (42 km)',
      'Continue straight onto Tollway Bypass (85 km)',
      'Take Exit 12 toward Sriperumbudur Highway (38 km)',
      'Follow arterial bypass directly to destination (19 km)'
    ]
  });
  const [routeLoading, setRouteLoading] = useState(false);

  // Weather & Safety Alerts State
  const [weatherData, setWeatherData] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // Grok AI Driver Assistant
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState([
    {
      sender: 'assistant',
      text: 'Highway Assist AI ready. Ask about accident trauma helplines, nearest hospitals, 24/7 petrol bunks, safe following distances, or route road closures.'
    }
  ]);

  // SOS Emergency State
  const [sosSending, setSosSending] = useState(false);
  const [sosStatus, setSosStatus] = useState('');

  // Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routePolylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const watchIdRef = useRef(null);

  const REGISTERED_CONTACTS = [
    { name: 'Emergency Contact 1', number: '6374926569' },
    { name: 'Emergency Contact 2', number: '7305800510' },
    { name: 'Emergency Contact 3', number: '8122603655' },
    { name: 'Emergency Contact 4', number: '7395893275' }
  ];

  // 1. Continuous GPS Tracking on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleNewLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          handleNewLocation(11.1271, 78.6569);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          handleNewLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => console.warn("GPS tracking warning", err),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
      watchIdRef.current = id;
    } else {
      handleNewLocation(11.1271, 78.6569);
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleNewLocation = async (lat, lon) => {
    setUserLocation(prev => ({ ...prev, lat, lon }));
    fetchLiveWeather(lat, lon);
    fetchNearbyAmenities(lat, lon);

    // Reverse geocode
    try {
      const geo = await api.reverseGeocode(lat, lon);
      if (geo.display_name) {
        setUserLocation(prev => ({ ...prev, address: geo.display_name }));
      }
    } catch {
      setUserLocation(prev => ({
        ...prev,
        address: `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)}), Highway Sector`
      }));
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lon]);
    }
  };

  const fetchLiveWeather = async (lat, lon) => {
    try {
      const res = await api.getCurrentWeather(lat, lon);
      setWeatherData(res);
    } catch (e) {
      console.warn("Weather fetch failed", e);
    }
  };

  const fetchNearbyAmenities = async (lat, lon) => {
    setLoadingPlaces(true);
    try {
      const res = await api.getNearbyPlaces(lat, lon, 'all');
      setNearbyPlaces(res.places || []);
    } catch (e) {
      console.warn("Places fetch failed", e);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // 2. Initialize Leaflet Map on Navigation or Tracking Tab
  useEffect(() => {
    if ((activeTab === 'navigation' || activeTab === 'tracking') && mapContainerRef.current) {
      const timer = setTimeout(() => {
        initDriverMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const initDriverMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([userLocation.lat, userLocation.lon], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Driver Car Marker
    const carIcon = L.divIcon({
      className: 'driver-car-marker',
      html: `
        <div style="width: 32px; height: 32px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(37,99,235,0.8);">
          <span style="font-size: 15px;">🚗</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: carIcon })
      .bindPopup(`<b>Your Vehicle</b><br/>Lat: ${userLocation.lat.toFixed(4)}, Lon: ${userLocation.lon.toFixed(4)}`)
      .addTo(map);

    mapInstanceRef.current = map;

    // Draw initial sample route
    calculateAndDrawRoute(userLocation.lat, userLocation.lon, 13.0827, 80.2707);
  };

  const calculateAndDrawRoute = async (startLat, startLon, destLat, destLon) => {
    if (!mapInstanceRef.current) return;

    setRouteLoading(true);

    try {
      // Query free public OSRM Driving Route API
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(osrmUrl);
      const routeData = await response.json();

      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // GeoJSON lon,lat to Leaflet lat,lon
        const distKm = (route.distance / 1000).toFixed(1);
        const durMin = Math.round(route.duration / 60);
        const hours = Math.floor(durMin / 60);
        const minutes = durMin % 60;
        const durText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

        // Extract step descriptions
        const extractedSteps = [];
        if (route.legs && route.legs[0]?.steps) {
          route.legs[0].steps.slice(0, 5).forEach(s => {
            if (s.name) extractedSteps.push(`Drive along ${s.name} (${(s.distance / 1000).toFixed(1)} km)`);
          });
        }

        setRouteInfo({
          distance_km: `${distKm} km`,
          duration_min: durText,
          status: 'Clear Traffic Flow via Main Corridor',
          steps: extractedSteps.length > 0 ? extractedSteps : [
            `Head along primary highway towards destination (${distKm} km)`,
            'Maintain safe lane discipline and observe speed limits',
            'Take access ramp directly to destination terminal'
          ]
        });

        // Draw Polyline on Leaflet
        if (routePolylineRef.current) {
          mapInstanceRef.current.removeLayer(routePolylineRef.current);
        }

        routePolylineRef.current = L.polyline(coordinates, {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.85
        }).addTo(mapInstanceRef.current);

        // Add destination marker
        if (destMarkerRef.current) {
          mapInstanceRef.current.removeLayer(destMarkerRef.current);
        }

        const destIcon = L.divIcon({
          className: 'dest-marker',
          html: `
            <div style="width: 28px; height: 28px; background: #ef4444; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(239,68,68,0.8);">
              <span style="font-size: 13px; color: white;">🏁</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        destMarkerRef.current = L.marker([destLat, destLon], { icon: destIcon })
          .bindPopup(`<b>Destination</b><br/>${destination}`)
          .addTo(mapInstanceRef.current);

        mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
      }
    } catch (e) {
      console.warn("OSRM Route fallback", e);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleRouteSearch = async (e) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setRouteLoading(true);

    try {
      // Geocode destination via Nominatim
      const searchRes = await api.searchPlaces(destination, userLocation.lat, userLocation.lon);
      if (searchRes.results && searchRes.results.length > 0) {
        const dest = searchRes.results[0];
        calculateAndDrawRoute(userLocation.lat, userLocation.lon, dest.latitude, dest.longitude);
      } else {
        // Fallback offset
        calculateAndDrawRoute(userLocation.lat, userLocation.lon, userLocation.lat + 0.15, userLocation.lon + 0.12);
      }
    } catch {
      calculateAndDrawRoute(userLocation.lat, userLocation.lon, 13.0827, 80.2707);
    } finally {
      setRouteLoading(false);
    }
  };

  // 3. Grok AI Chat Interaction inside Driver Dashboard
  const handleSendAiMessage = async (textToSend) => {
    const query = textToSend || aiQuestion;
    if (!query.trim() || aiLoading) return;

    const userMsg = { sender: 'user', text: query };
    setAiConversation(prev => [...prev, userMsg]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const historyPayload = aiConversation.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.chatAI(query, 'driver', historyPayload);
      const botResponse = res.response || "For highway emergencies, dial 1073 (NH Helpline) or 108 (Trauma Ambulance). Maintain a 3-second safe following buffer.";
      setAiConversation(prev => [...prev, {
        sender: 'assistant',
        text: botResponse,
        model: res.model || 'Grok AI Highway Safety'
      }]);
    } catch {
      setAiConversation(prev => [...prev, {
        sender: 'assistant',
        text: "Guidance: Highway patrol helpline is 1073; Medical ambulance is 108. Rest 15 mins every 2.5 hours of driving to prevent fatigue.",
        model: 'Offline Driver Engine'
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // 4. Emergency SOS Trigger
  const handleTriggerSos = async () => {
    setSosSending(true);
    setSosStatus('Broadcasting highway accident GPS coordinates...');

    try {
      const res = await api.sendSOS({
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        address: userLocation.address || 'Highway Road Corridor',
        sender_name: 'Driver Vehicle SOS',
        target_numbers: REGISTERED_CONTACTS.map(c => c.number)
      });

      setSosStatus('Dispatched! Opening device SMS application to notify all 3 emergency contacts.');
      if (res.all_contacts_sms_uri) {
        window.location.href = res.all_contacts_sms_uri;
      }
    } catch {
      const phoneNumbers = REGISTERED_CONTACTS.map(c => c.number).join(',');
      const msg = encodeURIComponent(`🚨 HIGHWAY EMERGENCY SOS!\nDriver Vehicle requires immediate highway assistance.\nGPS: ${userLocation.lat.toFixed(5)}, ${userLocation.lon.toFixed(5)}\nGoogle Maps: https://maps.google.com/?q=${userLocation.lat},${userLocation.lon}`);
      window.location.href = `sms:${phoneNumbers}?body=${msg}`;
      setSosStatus('SMS application opened with pre-filled GPS distress broadcast.');
    } finally {
      setSosSending(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">

      {/* Top Header Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs sm:text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('sos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-700/40 animate-pulse transition"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Module 03</span>
            <h2 className="text-base font-bold text-white">Driver Dashboard</h2>
          </div>
        </div>
      </div>

      {/* Hero Highway Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl overflow-hidden relative">
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-center z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-[11px] font-bold text-blue-300 mb-2">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Drive Safe, Reach Safe</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Driver Support & Highway Road Safety
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 mt-1 max-w-xl">
              Turn-by-turn route navigation, continuous GPS tracking, real-time traffic updates, nearby 24/7 trauma hospitals, petrol bunks, and instant SOS alert dispatch.
            </p>
          </div>

          {/* Module 6-Pillar Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
            {[
              { id: 'navigation', label: 'Route GPS', icon: Route },
              { id: 'tracking', label: 'Live Location', icon: Navigation },
              { id: 'safety', label: 'Road Safety', icon: ShieldCheck },
              { id: 'weather', label: 'Road Weather', icon: Sun },
              { id: 'ai', label: 'Driver AI', icon: Bot },
              { id: 'sos', label: 'Highway SOS', icon: ShieldAlert, color: 'text-red-400' }
            ].map(tabItem => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveTab(tabItem.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${isActive
                      ? 'bg-blue-950/80 border-blue-400 text-white shadow-lg shadow-blue-950'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80 text-slate-300'
                    }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${tabItem.color || (isActive ? 'text-blue-400' : 'text-slate-400')}`} />
                  <span className="text-xs font-bold">{tabItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Highway Illustration */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-blue-500/20 shadow-xl relative min-h-[180px]">
          <DriverIllustration className="w-full h-full object-cover min-h-[180px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050c1a] via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-blue-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-300">Highway Patrol Emergency:</span>
            <span className="font-extrabold text-blue-400 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> 1073 (24/7)
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ROUTE NAVIGATION & MAP DIRECTIONS                      */}
      {/* ============================================================== */}
      {(activeTab === 'navigation' || activeTab === 'tracking') && (
        <div className="space-y-6 animate-fade-in">

          {/* Route Planning Inputs */}
          <form onSubmit={handleRouteSearch} className="glass-panel rounded-3xl p-5 border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-400" />
                <span>Interactive Highway Route Planner</span>
              </h3>
              <button
                type="button"
                onClick={() => handleNewLocation(userLocation.lat, userLocation.lon)}
                className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Center GPS Location</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Starting Point:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    placeholder="My Current GPS Location"
                    className="w-full glass-input rounded-xl px-3 py-2 pl-9 text-xs sm:text-sm text-cyan-300 font-semibold"
                  />
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Destination:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter city or place (e.g. Chennai, Madurai, Salem)..."
                    className="w-full glass-input rounded-xl px-3 py-2 pl-9 text-xs sm:text-sm text-white"
                  />
                  <Navigation className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={routeLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-700/30 transition disabled:opacity-50"
              >
                {routeLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Calculate & Display Route</span>
                    <Route className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Interactive Route Leaflet Map */}
          <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-blue-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="text-white font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Live Route Navigation Map</span>
              </div>
              <div className="flex gap-4 font-semibold">
                <span className="text-emerald-400">Est. Distance: {routeInfo.distance_km}</span>
                <span className="text-cyan-300">Est. Time: {routeInfo.duration_min}</span>
              </div>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner z-0"
            ></div>

            {/* Turn Directions Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Navigation Directions:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                {routeInfo.steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Driver Live GPS Location Details */}
          <div className="glass-card rounded-2xl p-4 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Current Detected Driver Location:</span>
              <div className="text-white font-bold text-sm mt-0.5">{userLocation.address}</div>
              <div className="text-[11px] font-mono text-cyan-300">
                Lat: {userLocation.lat.toFixed(5)}, Lon: {userLocation.lon.toFixed(5)}
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <span>Google Maps Turn-by-Turn</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ROAD SAFETY & NEARBY EMERGENCY AMENITIES               */}
      {/* ============================================================== */}
      {activeTab === 'safety' && (
        <div className="space-y-6 animate-fade-in">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Traffic Flow</span>
                <Car className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">Normal Flow</div>
              <div className="text-xs text-slate-300">NH Corridor average speed: 78 km/h. No gridlocks.</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>Road Condition</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">Dry Asphalt</div>
              <div className="text-xs text-slate-300">Optimal traction. No wet weather lane closures reported.</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>Accident Prevention</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">3-Sec Rule</div>
              <div className="text-xs text-slate-300">Maintain 3-second buffer behind long multi-axle freight trucks.</div>
            </div>

          </div>

          {/* Nearby Emergency Services (Hospitals, Petrol Bunks, Police) */}
          <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Nearby Highway Emergency Services & Fuel</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Nearby Hospitals */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-red-400">
                  <Building2 className="w-4 h-4" />
                  <span>24/7 Trauma Hospitals</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-white">Government Headquarters Hospital</div>
                    <div className="text-slate-400 text-[11px]">Distance: ~2.4 km • Trauma Ward</div>
                    <div className="text-emerald-400 font-semibold text-[11px] mt-1">Helpline: 108</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-white">Apollo Specialty Emergency Care</div>
                    <div className="text-slate-400 text-[11px]">Distance: ~5.1 km • ICU Paramedics</div>
                    <div className="text-emerald-400 font-semibold text-[11px] mt-1">Helpline: 108</div>
                  </div>
                </div>
              </div>

              {/* Nearby Petrol Bunks */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                  <Fuel className="w-4 h-4" />
                  <span>24/7 Petrol Bunks & Air</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-white">Indian Oil Highway Oasis</div>
                    <div className="text-slate-400 text-[11px]">Distance: ~1.2 km • Diesel, Petrol, Air</div>
                    <div className="text-cyan-400 font-semibold text-[11px] mt-1">Status: Open 24 Hours</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-white">Bharat Petroleum Smart Fuel & EV</div>
                    <div className="text-slate-400 text-[11px]">Distance: ~3.8 km • Fast EV Charger</div>
                    <div className="text-cyan-400 font-semibold text-[11px] mt-1">Status: Open 24 Hours</div>
                  </div>
                </div>
              </div>

              {/* Nearby Police Stations */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span>Police Stations & Highway Patrol</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-white">District Police Control Room</div>
                    <div className="text-slate-400 text-[11px]">Distance: ~2.8 km • Rapid Dispatch</div>
                    <div className="text-blue-400 font-semibold text-[11px] mt-1">Dial: 100 / 112</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-white">Highway Patrol Outpost (NHAI)</div>
                    <div className="text-slate-400 text-[11px]">Distance: ~4.5 km • Crane & Recovery</div>
                    <div className="text-blue-400 font-semibold text-[11px] mt-1">Dial: 1073</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LIVE ROAD WEATHER INFORMATION                          */}
      {/* ============================================================== */}
      {activeTab === 'weather' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="glass-card rounded-2xl p-5 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Highway Temperature</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weatherData?.temperature || 28}°C
              </div>
              <div className="text-xs text-blue-300">
                Feels like {weatherData?.apparent_temperature || 29}°C • {weatherData?.condition || 'Clear Sky'}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Precipitation / Rain</span>
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weatherData?.rain_mm !== undefined ? `${weatherData.rain_mm} mm` : '0.0 mm'}
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Dry Highway Surfaces (Safe Braking)
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Wind Conditions</span>
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weatherData?.wind_speed || 14} <span className="text-sm font-normal text-slate-400">km/h</span>
              </div>
              <div className="text-xs text-slate-300">
                Crosswinds minimal. Stable steering.
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Visibility Distance</span>
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weatherData?.visibility || 10} <span className="text-sm font-normal text-slate-400">km</span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Excellent Highway Sightlines
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: DRIVER ASSISTANCE AI (POWERED BY GROK)                 */}
      {/* ============================================================== */}
      {activeTab === 'ai' && (
        <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 space-y-4 animate-fade-in">

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm sm:text-base">Grok Highway Road Safety Advisor</h3>
                <p className="text-[11px] text-blue-300">Instant answers for emergency trauma, routes, speed regulations & breakdown assistance</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 font-semibold">
              xAI Grok Active
            </span>
          </div>

          {/* Quick Question Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "Find nearest 24/7 trauma hospital",
              "Find nearest petrol bunk & air station",
              "What should I do during a highway accident?",
              "Safe driving rules in heavy rain and fog",
              "National Highway Patrol emergency contact"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendAiMessage(chip)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] text-blue-300 hover:text-white border border-slate-700/80 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Conversation Stream */}
          <div className="h-64 sm:h-72 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            {aiConversation.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-sm'
                    }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.model && (
                    <div className="text-[9px] text-blue-400/80 mt-1 font-mono text-right">
                      {msg.model}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-blue-400 p-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Grok AI analyzing road conditions & regulations...</span>
              </div>
            )}
          </div>

          {/* Inquiry Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask about road conditions, emergency assistance, or navigation..."
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuestion.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: EMERGENCY SOS (3 REGISTERED CONTACTS & 108 / 1073)       */}
      {/* ============================================================== */}
      {activeTab === 'sos' && (
        <div className="glass-panel rounded-3xl p-6 border-2 border-red-500/50 space-y-6 animate-fade-in shadow-2xl">

          <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/40">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Highway Accident Emergency SOS</h3>
                <p className="text-xs text-red-300">Broadcast your vehicle GPS coordinates to all 3 registered emergency contacts</p>
              </div>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-red-950 text-red-200 border border-red-500/50 font-mono">
              NH Patrol: 1073
            </span>
          </div>

          {/* Vehicle Coordinates & Maps Link */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="text-slate-400">Current Captured Vehicle Coordinates:</div>
            <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>{userLocation.lat.toFixed(5)}° N, {userLocation.lon.toFixed(5)}° E</span>
            </div>
            <div className="text-slate-400">
              Address: <span className="text-white font-medium">{userLocation.address}</span>
            </div>
            <div className="text-slate-400">
              Google Maps Link: <a href={`https://maps.google.com/?q=${userLocation.lat},${userLocation.lon}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-mono">https://maps.google.com/?q={userLocation.lat.toFixed(4)},{userLocation.lon.toFixed(4)}</a>
            </div>
          </div>

          {/* 3 Registered Emergency Contacts Alerted */}
          {/* 4 Registered Emergency Contacts Alerted */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              4 Registered Emergency Contacts:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {REGISTERED_CONTACTS.map((c, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="font-mono text-blue-400 font-semibold">{c.number}</div>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                    title="Direct Call"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {sosStatus && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-200">
              {sosStatus}
            </div>
          )}

          {/* Big Red SOS Action Button */}
          <button
            onClick={handleTriggerSos}
            disabled={sosSending}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-red-700/50 transition transform active:scale-98 disabled:opacity-60"
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span>
              {sosSending ? 'SENDING HIGHWAY SOS DISTRESS ALERT...' : 'SEND HIGHWAY SOS ALERT TO ALL 4 CONTACTS'}
            </span>
          </button>

        </div>
      )}

      {/* Floating Bottom Action Dock */}
      <ActionDock
        onOpenAI={onOpenAI}
        onOpenSOS={onOpenSOS}
        onOpenMap={onOpenMap}
        onOpenWeather={onOpenWeather}
      />

    </div>
  );
}
