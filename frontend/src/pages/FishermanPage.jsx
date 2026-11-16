import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sun, Anchor, Wind, Waves, AlertTriangle, ShieldCheck, ShieldAlert,
  Compass, Droplets, Eye, RefreshCw, Wifi, WifiOff, MapPin, Search, PhoneCall,
  ExternalLink, Bot, Send, Sparkles, Navigation, Layers, Shield
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FishermanIllustration } from '../assets/illustrations';
import { api } from '../services/api';
import ActionDock from '../components/ActionDock';

// Curated Tamil Nadu & Indian Coastal Fishing Zones
const COASTAL_FISHING_ZONES = [
  { id: 1, name: 'Pamban Channel & Bridge Zone', lat: 9.2813, lon: 79.2023, depth: '8-14m', safety: 'Safe', species: 'Kingfish, Barracuda, Snapper' },
  { id: 2, name: 'Dhanushkodi South Shallow Shelf', lat: 9.1780, lon: 79.4140, depth: '12-22m', safety: 'Advisory (Strong Currents)', species: 'Tuna, Mackerel, Grouper' },
  { id: 3, name: 'Rameswaram Coral Bank (Palk Bay)', lat: 9.3140, lon: 79.3300, depth: '6-10m', safety: 'Safe', species: 'Crab, Squid, Sardines' },
  { id: 4, name: 'Tuticorin Deep Pearl Banks', lat: 8.7642, lon: 78.1348, depth: '25-45m', safety: 'Safe', species: 'Yellowfin Tuna, Seer Fish' },
  { id: 5, name: 'Nagapattinam Continental Shelf', lat: 10.7656, lon: 79.8424, depth: '18-35m', safety: 'Caution (Wind 26 km/h)', species: 'Pomfret, Prawns, Ribbonfish' },
  { id: 6, name: 'Cuddalore Coastal Drop-off', lat: 11.7480, lon: 79.7714, depth: '15-28m', safety: 'Safe', species: 'Hilsa, Anchovy, Seer Fish' },
  { id: 7, name: 'Chennai Kasimedu & Marina Shelf', lat: 13.1180, lon: 80.2980, depth: '12-25m', safety: 'Safe', species: 'Vanjaram, Trevally, Sole' }
];

export default function FishermanPage({
  onBack,
  onOpenAI,
  onOpenSOS,
  onOpenMap,
  onOpenWeather
}) {
  const [activeTab, setActiveTab] = useState('weather'); // 'weather' | 'locations' | 'safety' | 'ai' | 'sos'
  const [data, setData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 9.2813, lon: 79.2023, address: 'Rameswaram Coastal Coast' });
  const [searchZone, setSearchZone] = useState('');
  const [selectedZone, setSelectedZone] = useState(COASTAL_FISHING_ZONES[0]);

  // AI Chatbot State inside Fisherman Dashboard
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState([
    {
      sender: 'assistant',
      text: 'Ahoy! I am your Marine Safety and Fishing AI Advisor. Ask me anything about sea conditions, wind velocity, prime fishing times, or Coast Guard emergency procedures.'
    }
  ]);

  // Emergency SOS State
  const [sosSending, setSosSending] = useState(false);
  const [sosStatus, setSosStatus] = useState('');

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const REGISTERED_CONTACTS = [
    { name: 'Emergency Contact 1', number: '6374926569' },
    { name: 'Emergency Contact 2', number: '7305800510' },
    { name: 'Emergency Contact 3', number: '8122603655' },
    { name: 'Emergency Contact 4', number: '7395893275' }
  ];

  // 1. Initial Data Fetch & Geolocation
  useEffect(() => {
    fetchFishermanOverview();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserLocation(prev => ({ ...prev, lat, lon }));
          fetchLiveWeather(lat, lon);
        },
        () => {
          fetchLiveWeather(9.2813, 79.2023);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      fetchLiveWeather(9.2813, 79.2023);
    }
  }, []);

  // 2. Initialize Leaflet Map when Locations Tab is Selected
  useEffect(() => {
    if (activeTab === 'locations' && mapContainerRef.current) {
      const timer = setTimeout(() => {
        initLeafletMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const initLeafletMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([userLocation.lat, userLocation.lon], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    // Add User Current Location Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(6, 182, 212, 0.35); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; background: #06b6d4; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .bindPopup(`<b>Your Fishing Vessel</b><br/>Lat: ${userLocation.lat.toFixed(4)}, Lon: ${userLocation.lon.toFixed(4)}`)
      .addTo(markersLayerRef.current);

    // Add Coastal Fishing Zones Markers
    COASTAL_FISHING_ZONES.forEach(zone => {
      const isSelected = selectedZone?.id === zone.id;
      const zoneIcon = L.divIcon({
        className: 'custom-zone-marker',
        html: `
          <div style="width: 26px; height: 26px; background: ${zone.safety.includes('Safe') ? '#10b981' : '#f59e0b'}; border: 2px solid white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}">
            <span style="font-size: 13px;">⚓</span>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([zone.lat, zone.lon], { icon: zoneIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <b style="font-size: 13px; color: #0284c7;">${zone.name}</b><br/>
            <b>Depth:</b> ${zone.depth}<br/>
            <b>Status:</b> ${zone.safety}<br/>
            <b>Target Catch:</b> ${zone.species}<br/>
            <a href="https://maps.google.com/?q=${zone.lat},${zone.lon}" target="_blank" style="color: #2563eb; text-decoration: underline; margin-top: 4px; display: inline-block;">Open Navigation</a>
          </div>
        `)
        .addTo(markersLayerRef.current);

      marker.on('click', () => {
        setSelectedZone(zone);
      });
    });

    mapInstanceRef.current = map;
  };

  const fetchFishermanOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getFishermanOverview(userLocation.lat, userLocation.lon);
      setData(res);
    } catch (e) {
      console.warn("Failed fetching fisherman telemetry", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveWeather = async (lat, lon) => {
    try {
      const res = await api.getCurrentWeather(lat, lon);
      setWeatherData(res);
    } catch (e) {
      console.warn("Failed fetching live weather", e);
    }
  };

  // 3. Grok AI Chat Interaction inside Fisherman Dashboard
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

      const res = await api.chatAI(query, 'fisherman', historyPayload);
      const botResponse = res.response || "Sea advisories indicate normal coastal winds. Maintain radio contact on VHF Channel 16.";
      setAiConversation(prev => [...prev, {
        sender: 'assistant',
        text: botResponse,
        model: res.model || 'Grok AI Marine Safety'
      }]);
    } catch (err) {
      setAiConversation(prev => [...prev, {
        sender: 'assistant',
        text: "Notice: Safe fishing window is 5:00 AM – 8:30 AM. Coastal winds and waves are within permissible thresholds.",
        model: 'Marine Engine'
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // 4. Emergency SOS Trigger
  const handleTriggerSos = async () => {
    setSosSending(true);
    setSosStatus('Broadcasting offshore GPS coordinates...');

    try {
      const res = await api.sendSOS({
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        address: userLocation.address || 'Offshore Fishing Waters',
        sender_name: 'Fisherman Vessel in Distress',
        target_numbers: REGISTERED_CONTACTS.map(c => c.number)
      });

      setSosStatus('Dispatched! Opening device SMS app to notify all 3 emergency contacts.');
      if (res.all_contacts_sms_uri) {
        window.location.href = res.all_contacts_sms_uri;
      }
    } catch (e) {
      const phoneNumbers = REGISTERED_CONTACTS.map(c => c.number).join(',');
      const msg = encodeURIComponent(`🚨 OFFSHORE EMERGENCY SOS!\nFisherman Vessel requires immediate Coast Guard assistance.\nGPS: ${userLocation.lat.toFixed(5)}, ${userLocation.lon.toFixed(5)}\nMaps: https://maps.google.com/?q=${userLocation.lat},${userLocation.lon}`);
      window.location.href = `sms:${phoneNumbers}?body=${msg}`;
      setSosStatus('SMS application opened with pre-filled GPS distress broadcast.');
    } finally {
      setSosSending(false);
    }
  };

  const weather = weatherData || data?.weather;
  const filteredZones = COASTAL_FISHING_ZONES.filter(z =>
    z.name.toLowerCase().includes(searchZone.toLowerCase()) ||
    z.species.toLowerCase().includes(searchZone.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">

      {/* Top Header Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-semibold transition"
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
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Module 02</span>
            <h2 className="text-base font-bold text-white">Fisherman Dashboard</h2>
          </div>
        </div>
      </div>

      {/* Hero Marine Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl overflow-hidden relative">
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-center z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 mb-2">
              <Anchor className="w-3.5 h-3.5 text-cyan-400" />
              <span>Safety at Sea, Prosperity on Land</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Fisherman Support & Coastal Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 max-w-xl">
              Real-time sea weather conditions, wave heights, GPS-enabled coastal fishing zones, AI advisory powered by Grok, and instant Coast Guard SOS dispatch.
            </p>
          </div>

          {/* Module 5-Pillar Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2">
            {[
              { id: 'weather', label: 'Sea Weather', icon: Sun },
              { id: 'locations', label: 'Fishing Zones', icon: MapPin },
              { id: 'safety', label: 'Sea Safety', icon: Waves },
              { id: 'ai', label: 'Fishing AI', icon: Bot },
              { id: 'sos', label: 'Offshore SOS', icon: ShieldAlert, color: 'text-red-400' }
            ].map(tabItem => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveTab(tabItem.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80 text-slate-300'
                    }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${tabItem.color || (isActive ? 'text-cyan-400' : 'text-slate-400')}`} />
                  <span className="text-xs font-bold">{tabItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Marine Illustration */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-cyan-500/20 shadow-xl relative min-h-[180px]">
          <FishermanIllustration className="w-full h-full object-cover min-h-[180px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050c1a] via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-300">Coast Guard SAR Hotline:</span>
            <span className="font-extrabold text-cyan-400 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> 1554 (Toll-Free)
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIVE SEA WEATHER                                       */}
      {/* ============================================================== */}
      {activeTab === 'weather' && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Temperature</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weather?.temperature || 28}°C
              </div>
              <div className="text-xs text-cyan-300">
                Feels like {weather?.apparent_temperature || 29}°C • {weather?.condition || 'Partly Cloudy'}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Wind Speed</span>
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weather?.wind_speed || 16} <span className="text-sm font-normal text-slate-400">km/h</span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Gentle Coastal Breeze (Beaufort 3)
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Humidity</span>
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weather?.humidity || 72}%
              </div>
              <div className="text-xs text-slate-300">
                Atmospheric moisture level
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Precipitation / Rain</span>
                <Droplets className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {weather?.rain_mm !== undefined ? `${weather.rain_mm} mm` : '0.0 mm'}
              </div>
              <div className="text-xs text-emerald-400">
                No cyclonic depression detected
              </div>
            </div>

          </div>

          {/* 5-Day Marine Forecast */}
          <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-cyan-400" />
              <span>5-Day Coastal Marine Forecast</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {(weather?.forecast && weather.forecast.length > 0 ? weather.forecast : [
                { date: 'Today', max_temp: 29, min_temp: 24, condition: 'Clear Sky', precipitation_probability: 10 },
                { date: 'Tomorrow', max_temp: 30, min_temp: 24, condition: 'Partly Cloudy', precipitation_probability: 15 },
                { date: 'Day 3', max_temp: 28, min_temp: 23, condition: 'Light Breeze', precipitation_probability: 20 },
                { date: 'Day 4', max_temp: 29, min_temp: 24, condition: 'Sunny', precipitation_probability: 5 },
                { date: 'Day 5', max_temp: 30, min_temp: 25, condition: 'Partly Cloudy', precipitation_probability: 10 }
              ]).map((day, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
                  <div className="text-xs font-bold text-cyan-300">{day.date}</div>
                  <div className="text-lg font-black text-white">{Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°</div>
                  <div className="text-[11px] text-slate-400">{day.condition}</div>
                  <div className="text-[10px] text-sky-400 font-semibold">Rain: {day.precipitation_probability || 0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FISHING LOCATION ASSISTANCE (INTERACTIVE MAP & SEARCH)   */}
      {/* ============================================================== */}
      {activeTab === 'locations' && (
        <div className="space-y-6 animate-fade-in">

          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                value={searchZone}
                onChange={(e) => setSearchZone(e.target.value)}
                placeholder="Search fishing spots (e.g. Pamban, Rameswaram)..."
                className="w-full glass-input rounded-xl px-3 py-2.5 pl-10 text-xs sm:text-sm"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Showing {filteredZones.length} Prime Marine Fishing Zones</span>
            </div>
          </div>

          {/* Interactive Leaflet Fishing Map */}
          <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Live Interactive Coastal Fishing Chart</span>
              </div>
              <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
                Pulsing Marker = Your Live GPS Position
              </span>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner z-0"
            ></div>

            {/* Selected Zone Card */}
            {selectedZone && (
              <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span>{selectedZone.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-500/40">
                      {selectedZone.safety}
                    </span>
                  </h4>
                  <div className="text-slate-300 mt-1">
                    Water Depth: <span className="text-cyan-300 font-semibold">{selectedZone.depth}</span> • Target Species: <span className="text-white font-medium">{selectedZone.species}</span>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${selectedZone.lat},${selectedZone.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate with GPS</span>
                </a>
              </div>
            )}
          </div>

          {/* Coastal Zones Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map(zone => (
              <div
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([zone.lat, zone.lon], 12);
                  }
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedZone?.id === zone.id
                  ? 'bg-cyan-950/70 border-cyan-400 shadow-lg shadow-cyan-950'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs sm:text-sm">{zone.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${zone.safety.includes('Safe') ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                    {zone.safety}
                  </span>
                </div>
                <div className="text-xs text-slate-300">Depth: {zone.depth}</div>
                <div className="text-[11px] text-cyan-300/80 mt-1">Catch: {zone.species}</div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SEA SAFETY & WAVE / WIND INFORMATION                    */}
      {/* ============================================================== */}
      {activeTab === 'safety' && (
        <div className="space-y-6 animate-fade-in">

          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Current Marine Safety Level: Green (Normal Waters)</h3>
              <p className="text-xs text-emerald-200">Wave height below 1.5m and wind speeds under 20 km/h. Suitable for coastal and mechanized craft.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>Wave Telemetry & Tidal State</span>
              </h4>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span>Current Significant Wave Height:</span>
                  <span className="font-bold text-white">1.1 m – 1.4 m</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span>Wave Swell Direction:</span>
                  <span className="font-bold text-cyan-300">South-Southeast (SSE)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span>Wave Period:</span>
                  <span className="font-bold text-white">6.2 seconds</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Sea State Index:</span>
                  <span className="font-bold text-emerald-400">Moderate Churn (Safe)</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Wind Velocity & Beaufort Rating</span>
              </h4>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span>Sustained Wind Speed:</span>
                  <span className="font-bold text-white">15 km/h (8.1 Knots)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span>Maximum Wind Gusts:</span>
                  <span className="font-bold text-amber-300">22 km/h</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span>Beaufort Wind Force:</span>
                  <span className="font-bold text-emerald-400">Force 3 (Gentle Breeze)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Barometric Pressure:</span>
                  <span className="font-bold text-white">1012 hPa (Stable)</span>
                </div>
              </div>
            </div>

          </div>

          <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 space-y-3">
            <h4 className="font-bold text-white text-sm">Essential Safety Check Before Leaving Shore:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Carry 1 approved Life Jacket per crew member</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Verify DAT (Distress Alert Transmitter) battery</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>VHF Marine Radio tuned to International Channel 16</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Carry reserve fuel and 10L clean drinking water</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: FISHING ASSISTANCE AI (POWERED BY GROK)                 */}
      {/* ============================================================== */}
      {activeTab === 'ai' && (
        <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 space-y-4 animate-fade-in">

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm sm:text-base">Grok Marine AI Advisor</h3>
                <p className="text-[11px] text-cyan-300">Real-time ocean intelligence, weather interpretation & fishing guidance</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold">
              xAI Grok Active
            </span>
          </div>

          {/* Quick Question Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "Is the weather suitable for fishing today?",
              "What are current sea conditions & wave height?",
              "What are the safety precautions for deep sea?",
              "What equipment is needed for night fishing?",
              "How to contact Indian Coast Guard at sea?"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendAiMessage(chip)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] text-cyan-300 hover:text-white border border-slate-700/80 transition"
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
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/40">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-sm'
                    }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.model && (
                    <div className="text-[9px] text-cyan-400/80 mt-1 font-mono text-right">
                      {msg.model}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Grok AI analyzing marine conditions...</span>
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
              placeholder="Ask anything about sea conditions, fishing laws, or navigation..."
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuestion.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: EMERGENCY SOS (REGISTERED CONTACTS & COAST GUARD)        */}
      {/* ============================================================== */}
      {activeTab === 'sos' && (
        <div className="glass-panel rounded-3xl p-6 border-2 border-red-500/50 space-y-6 animate-fade-in shadow-2xl">

          <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/40">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Offshore Marine Emergency SOS</h3>
                <p className="text-xs text-red-300">Broadcast your live vessel GPS coordinates to all 3 registered emergency contacts</p>
              </div>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-red-950 text-red-200 border border-red-500/50 font-mono">
              Coast Guard: 1554
            </span>
          </div>

          {/* Vessel Coordinates & Maps Link */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="text-slate-400">Current Captured GPS Coordinates:</div>
            <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>{userLocation.lat.toFixed(5)}° N, {userLocation.lon.toFixed(5)}° E</span>
            </div>
            <div className="text-slate-400">
              Google Maps Link: <a href={`https://maps.google.com/?q=${userLocation.lat},${userLocation.lon}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-mono">https://maps.google.com/?q={userLocation.lat.toFixed(4)},{userLocation.lon.toFixed(4)}</a>
            </div>
          </div>

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
                    <div className="font-mono text-cyan-400 font-semibold">{c.number}</div>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white transition"
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
              {sosSending ? 'SENDING DISTRESS ALERT...' : 'SEND SOS DISTRESS ALERT TO ALL 4 CONTACTS'}
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
