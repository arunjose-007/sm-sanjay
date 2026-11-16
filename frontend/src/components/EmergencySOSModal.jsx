import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, PhoneCall, MapPin, X, CheckCircle, MessageSquare,
  Copy, ExternalLink, ShieldAlert, Radio, RefreshCw, Send, CheckCheck,
  Compass, Search, Navigation, LocateFixed
} from 'lucide-react';
import { api } from '../services/api';

export default function EmergencySOSModal({ isOpen, onClose, currentUser }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'locating' | 'ready'
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('Detecting current address...');
  const [copied, setCopied] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [sendingStatus, setSendingStatus] = useState('');

  // Search & Change Place state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const emergencyMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Official Registered Emergency Contacts (4 numbers)
  const REGISTERED_CONTACTS = [
    { id: 1, name: 'Emergency Contact 1', number: '6374926569', formatted: '+91 6374926569' },
    { id: 2, name: 'Emergency Contact 2', number: '7305800510', formatted: '+91 7305800510' },
    { id: 3, name: 'Emergency Contact 3', number: '8122603655', formatted: '+91 8122603655' },
    { id: 4, name: 'Emergency Contact 4', number: '7395893275', formatted: '+91 7395893275' }
  ];

  const allNumbersComma = REGISTERED_CONTACTS.map(c => c.number).join(',');
  const allNumbersSemi = REGISTERED_CONTACTS.map(c => c.number).join(';');

  // Popular quick location presets
  const popularPlaces = [
    { name: 'Chennai Central', lat: 13.0827, lon: 80.2707 },
    { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
    { name: 'Salem Junction', lat: 11.6643, lon: 78.1460 },
    { name: 'Madurai Meenakshi', lat: 9.9195, lon: 78.1193 },
    { name: 'Trichy Central', lat: 10.7905, lon: 78.7047 },
    { name: 'Kanyakumari Coast', lat: 8.0883, lon: 77.5385 }
  ];

  useEffect(() => {
    if (isOpen) {
      triggerLocationCapture();
    } else {
      setStatus('idle');
      setCoords(null);
      setSendingStatus('');
      setShowSearch(false);
      setSearchResults([]);
    }
  }, [isOpen]);

  // Capture / Refresh Location (GPS first, IP Geolocation fallback)
  const triggerLocationCapture = () => {
    setIsRefreshingLocation(true);
    setStatus('locating');
    setSendingStatus('Detecting your live GPS coordinates...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationAcquired(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        async (err) => {
          console.warn("GPS error, trying IP location fallback...", err.message);
          // Try IP-based location fallback so real user city is detected
          try {
            const ipData = await api.getIPLocation();
            if (ipData?.latitude && ipData?.longitude) {
              handleLocationAcquired(ipData.latitude, ipData.longitude, 2000, ipData.display_name);
              return;
            }
          } catch (e) { }
          // Fallback regional center
          handleLocationAcquired(11.1271, 78.6569, 500, 'Tamil Nadu, India');
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
      );
    } else {
      // Fallback
      api.getIPLocation().then(ipData => {
        if (ipData?.latitude && ipData?.longitude) {
          handleLocationAcquired(ipData.latitude, ipData.longitude, 2000, ipData.display_name);
        } else {
          handleLocationAcquired(11.1271, 78.6569, 500, 'Tamil Nadu, India');
        }
      }).catch(() => {
        handleLocationAcquired(11.1271, 78.6569, 500, 'Tamil Nadu, India');
      });
    }
  };

  const handleLocationAcquired = async (lat, lon, acc, knownAddress = null) => {
    const latStr = parseFloat(lat).toFixed(5);
    const lonStr = parseFloat(lon).toFixed(5);
    setCoords({ lat: latStr, lon: lonStr, acc: Math.round(acc || 15) });
    setIsRefreshingLocation(false);
    setStatus('ready');

    if (knownAddress) {
      setAddress(knownAddress);
    } else {
      setSendingStatus('Retrieving reverse-geocoded address...');
      try {
        const res = await api.reverseGeocode(parseFloat(lat), parseFloat(lon));
        if (res.display_name) {
          setAddress(res.display_name);
        } else {
          setAddress(`Coordinates: ${latStr}, ${lonStr}, Tamil Nadu, India`);
        }
      } catch {
        setAddress(`Coordinates: ${latStr}, ${lonStr}, Tamil Nadu, India`);
      }
    }

    // Update map marker if map exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([parseFloat(lat), parseFloat(lon)]);
      }
    }

    // Log distress into backend SQLite database
    try {
      await api.sendSOS({
        user_id: currentUser?.id,
        sender_name: currentUser?.full_name || currentUser?.username || 'User',
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        accuracy_meters: acc,
        target_numbers: REGISTERED_CONTACTS.map(c => c.number)
      });
      setSendingStatus('Live location updated & recorded in emergency database.');
    } catch (e) {
      setSendingStatus('Coordinates captured. Ready to dispatch device SMS.');
    }
  };

  // Place Search
  const handleSearchPlaces = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchPlaces(searchQuery.trim(), coords?.lat, coords?.lon);
      setSearchResults(res.results || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select place from search or quick preset
  const handleSelectPlace = (place) => {
    handleLocationAcquired(place.latitude || place.lat, place.longitude || place.lon, 25, place.display_name || place.name);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Render Mini Emergency Map Preview with Click-to-Move
  useEffect(() => {
    if (status !== 'ready' || !coords || !emergencyMapRef.current) return;
    let isMounted = true;

    const renderMap = async () => {
      try {
        const L = window.L || (await import('leaflet')).default;
        if (!isMounted || !emergencyMapRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(emergencyMapRef.current, {
          center: [parseFloat(coords.lat), parseFloat(coords.lon)],
          zoom: 14,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        const alertIcon = L.divIcon({
          className: 'emergency-pin',
          html: `
            <div style="position:relative; width:34px; height:34px;">
              <div style="position:absolute; inset:-8px; background:rgba(239,68,68,0.5); border-radius:50%; animation:ping 1.5s infinite;"></div>
              <div style="width:34px; height:34px; background:#ef4444; border:3px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:16px; font-weight:bold; box-shadow:0 0 18px rgba(239,68,68,0.9); cursor:pointer;">
                🚨
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([parseFloat(coords.lat), parseFloat(coords.lon)], {
          icon: alertIcon,
          draggable: true
        }).addTo(map);

        markerRef.current = marker;

        // Allow user to click anywhere on map to change location!
        map.on('click', (e) => {
          handleLocationAcquired(e.latlng.lat, e.latlng.lng, 10);
        });

        // Allow user to drag marker
        marker.on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          handleLocationAcquired(newPos.lat, newPos.lng, 10);
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn("Mini map error:", err);
      }
    };

    renderMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [status]);

  if (!isOpen) return null;

  const mapsUrl = coords ? `https://maps.google.com/?q=${coords.lat},${coords.lon}` : 'https://maps.google.com/?q=11.1271,78.6569';

  // Emergency SMS text strictly containing all 4 numbers & live coordinates
  const emergencySMSText = (
    `🚨 EMERGENCY SOS ALERT! I need immediate help.\n` +
    `📍 Location: ${address}\n` +
    `🌐 Latitude: ${coords?.lat || '11.1271'}, Longitude: ${coords?.lon || '78.6569'}\n` +
    `🗺 Google Maps Location: ${mapsUrl}\n` +
    `📞 Registered Emergency Contacts: 6374926569, 7305800510, 8122603655, 7395893275`
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emergencySMSText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Device SMS URI for All 4 Contacts
  const allContactsSmsUrl = `sms:${allNumbersComma}?body=${encodeURIComponent(emergencySMSText)}`;
  const allContactsSmsUrlIOS = `sms:${allNumbersSemi}&body=${encodeURIComponent(emergencySMSText)}`;

  const handleSendToAll = () => {
    setSendingStatus('Launching device SMS application with all 4 contacts...');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = isIOS ? allContactsSmsUrlIOS : allContactsSmsUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border-2 border-red-500/70 p-5 sm:p-6 space-y-4 shadow-[0_0_70px_rgba(239,68,68,0.45)] my-auto max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 font-black text-sm tracking-widest uppercase">
            <Radio className="w-5 h-5 text-red-500 animate-ping" />
            <span>SOS Emergency Live Location Sharing</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'locating' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin mx-auto shadow-lg" />
            <p className="text-base font-bold text-white tracking-wide">Acquiring Live Location...</p>
            <p className="text-xs text-red-300">Detecting GPS satellite coordinates & reverse-geocoding place address</p>
          </div>
        )}

        {status === 'ready' && (
          <div className="space-y-3.5 animate-fade-in">

            {/* Live Location & Address Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-red-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-red-400" />
                  <span>Current GPS Location</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Change Place / Search Toggle */}
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 flex items-center gap-1 transition"
                  >
                    <Search className="w-3 h-3" />
                    <span>{showSearch ? 'Hide Search' : 'Change Place'}</span>
                  </button>

                  {/* Detect GPS / Refresh */}
                  <button
                    onClick={triggerLocationCapture}
                    disabled={isRefreshingLocation}
                    title="Detect Current GPS Location"
                    className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-[11px] font-bold text-red-300 flex items-center gap-1 transition"
                  >
                    <LocateFixed className={`w-3 h-3 ${isRefreshingLocation ? 'animate-spin' : ''}`} />
                    <span>Detect GPS</span>
                  </button>
                </div>
              </div>

              {/* Search Location Input & Results Dropdown */}
              {showSearch && (
                <div className="pt-2 border-t border-slate-800 space-y-2 animate-fade-in">
                  <form onSubmit={handleSearchPlaces} className="flex gap-1.5">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search city, town, or place (e.g. Marina Beach, Salem, Madurai)..."
                      className="flex-1 bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      <span>{isSearching ? 'Searching...' : 'Find'}</span>
                    </button>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950/95 border border-cyan-500/30 rounded-xl p-1.5">
                      {searchResults.map((r, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPlace(r)}
                          className="w-full text-left p-1.5 hover:bg-cyan-950/80 rounded-lg text-[11px] text-slate-200 hover:text-cyan-300 flex items-center gap-1.5 transition"
                        >
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{r.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick City Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Quick Places:</span>
                    {popularPlaces.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPlace(p)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-900 border border-slate-700 hover:border-cyan-500/50 text-[10px] text-slate-300 hover:text-cyan-300 transition"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-white space-y-1">
                <div><b>GPS:</b> <span className="text-cyan-300 font-mono">{coords?.lat}, {coords?.lon}</span> (Accuracy: ±{coords?.acc}m)</div>
                <div className="text-slate-300 text-[11px] leading-tight"><b>Address:</b> {address}</div>
                <div className="pt-0.5">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline"
                  >
                    <span>Open in Google Maps ({mapsUrl})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Emergency Map Preview (Click anywhere on map to set position) */}
            <div className="relative h-40 rounded-2xl overflow-hidden border border-red-500/40 shadow-inner">
              <div ref={emergencyMapRef} className="w-full h-full cursor-crosshair" />
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-slate-950/90 border border-cyan-500/40 text-[10px] text-cyan-300 font-semibold backdrop-blur-md">
                💡 Click anywhere on map to place emergency pin
              </div>
              <div className="absolute bottom-2 right-2 z-10 px-2.5 py-0.5 rounded-md bg-red-950/90 border border-red-500/50 text-[10px] text-red-300 font-bold backdrop-blur-md">
                🚨 Live Distress Marker
              </div>
            </div>

            {/* Prepared Emergency Message Preview */}
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-700/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Prepared Emergency SMS Alert:
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied Alert!' : 'Copy Alert'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-200 font-mono whitespace-pre-wrap bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                {emergencySMSText}
              </p>
            </div>

            {/* PRIMARY ACTION: SEND TO ALL 4 EMERGENCY CONTACTS */}
            <div className="space-y-2">
              <button
                onClick={handleSendToAll}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition active:scale-95"
              >
                <Send className="w-5 h-5" />
                <span>SEND EMERGENCY SMS TO ALL 4 CONTACTS</span>
              </button>

              {sendingStatus && (
                <p className="text-center text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{sendingStatus}</span>
                </p>
              )}
            </div>

            {/* Individual Registered Emergency Contacts */}
            <div className="space-y-2 pt-1 border-t border-red-500/20">
              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block text-left">
                Registered Emergency Contacts:
              </span>

              <div className="space-y-2">
                {REGISTERED_CONTACTS.map((c) => {
                  const indSmsUrl = `sms:${c.number}?body=${encodeURIComponent(emergencySMSText)}`;
                  const indWaUrl = `https://wa.me/91${c.number}?text=${encodeURIComponent(emergencySMSText)}`;
                  const indTelUrl = `tel:${c.number}`;

                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-slate-400 text-[11px]">{c.formatted}</div>
                      </div>

                      <div className="flex gap-1.5">
                        <a
                          href={indSmsUrl}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>SMS</span>
                        </a>

                        <a
                          href={indWaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={indTelUrl}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secondary National Hotlines */}
            <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
              <span>National Hotlines:</span>
              <div className="flex gap-3 font-bold text-red-300">
                <a href="tel:108" className="hover:underline">108 Ambulance</a>
                <a href="tel:100" className="hover:underline">100 Police</a>
                <a href="tel:1554" className="hover:underline">1554 Coast Guard</a>
                <a href="tel:1073" className="hover:underline">1073 Highway</a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
