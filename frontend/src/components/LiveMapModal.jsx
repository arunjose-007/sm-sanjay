import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Plus, Minus, Navigation, ShieldAlert, Cross, X, WifiOff } from 'lucide-react';
import { api } from '../services/api';

export default function LiveMapModal({ isOpen, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 11.1271, lon: 78.6569, label: 'Tamil Nadu, India' });
  const [hospitals, setHospitals] = useState([]);
  const [tileError, setTileError] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch hospital markers from backend
    api.getHospitals(userLocation.lat, userLocation.lon)
      .then(res => setHospitals(res.hospitals || []))
      .catch(e => console.warn("Failed loading map markers", e));

    // Try detecting user real GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const newLoc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            label: 'Your Current GPS Location'
          };
          setUserLocation(newLoc);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([newLoc.lat, newLoc.lon], 11);
          }
        },
        () => console.log("Using default Tamil Nadu coordinates for map.")
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Dynamically load Leaflet if available
    let isMounted = true;

    const initMap = async () => {
      try {
        const L = window.L || (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        // If map already initialized, clear it
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lon],
          zoom: 10,
          zoomControl: false,
        });

        // Add OpenStreetMap Free Tile Layer with tile error listener
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });

        tileLayer.on('tileerror', () => {
          setTileError(true);
        });

        tileLayer.addTo(map);

        // Add User Location Marker
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `<div style="background-color: #0284c7; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(2,132,199,0.8); animation: pulse 2s infinite;"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<b>Your Location</b><br>${userLocation.label}`)
          .openPopup();

        // Add Hospital Markers
        hospitals.forEach(h => {
          const hospIcon = L.divIcon({
            className: 'custom-hosp-marker',
            html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 6px; border: 2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold; box-shadow: 0 0 10px rgba(239,68,68,0.7);">+</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker([h.latitude, h.longitude], { icon: hospIcon })
            .addTo(map)
            .bindPopup(`<b>${h.name}</b><br>${h.address}<br><b>Phone:</b> ${h.phone}<br><b>Distance:</b> ${h.calculated_distance || h.distance || 'Near'} km`);
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn("Leaflet tile or script initialization failed:", err);
        setTileError(true);
      }
    };

    const timer = setTimeout(initMap, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, hospitals, userLocation]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simple lookup against loaded hospitals or coordinate parse
    const found = hospitals.find(h =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found && mapInstanceRef.current) {
      mapInstanceRef.current.setView([found.latitude, found.longitude], 13);
      setSelectedMarker(found);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      
      <div className="relative w-full max-w-5xl h-[85vh] rounded-2xl glass-panel border border-sky-500/40 overflow-hidden shadow-2xl flex flex-col bg-slate-950">
        
        {/* Map Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-sky-500/20 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Navigation & Safety Map</h3>
              <p className="text-[11px] text-slate-400">
                Your Location: <span className="text-sky-300 font-semibold">{userLocation.label}</span> ({userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)})
              </p>
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 max-w-xs w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital or area..."
                className="w-full glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
              />
            </div>
          </form>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container Area */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          
          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Offline Fallback Screen if tiles can't load */}
          {tileError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/95 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
                <WifiOff className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                Offline Map Fallback Active
              </h4>
              <p className="text-xs text-slate-300 max-w-md mb-6">
                Online map tiles are unreachable (offline mode). Stored geographical coordinates and hospital waypoints remain fully accessible below.
              </p>

              {/* Vector Offline Grid Display */}
              <div className="w-full max-w-2xl bg-slate-900/90 rounded-xl border border-slate-800 p-4 text-left max-h-64 overflow-y-auto space-y-2">
                <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                  Stored Waypoints & Nearby Emergency Medical Centers:
                </div>
                {hospitals.map((h, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{h.name}</div>
                      <div className="text-slate-400 text-[11px]">{h.address}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold text-[10px]">
                        {h.calculated_distance || h.distance || 'Nearby'} km
                      </span>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5">{h.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 rounded-xl glass-panel bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-9 h-9 rounded-xl glass-panel bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Location Badge bottom-left matching UI */}
          <div className="absolute bottom-4 left-4 z-10 glass-panel bg-slate-900/90 px-3.5 py-2 rounded-xl border border-sky-500/30 shadow-xl flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></div>
            <div>
              <span className="font-bold text-white">Your Location</span>
              <span className="text-slate-300 ml-1.5">{userLocation.label}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
