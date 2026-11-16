import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Search, Plus, Minus, Navigation, ShieldAlert, Cross, X,
  Layers, Compass, ExternalLink, Loader2, LocateFixed, Eye, List,
  Building2, Fuel, Shield, UtensilsCrossed, Bus
} from 'lucide-react';
import { api } from '../services/api';

export default function LiveMapModal({ isOpen, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userAccuracyCircleRef = useRef(null);
  const placesMarkersGroupRef = useRef(null);
  const watchIdRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState({
    lat: 11.1271,
    lon: 78.6569,
    accuracy: 15,
    address: 'Detecting live address...'
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [mapLayer, setMapLayer] = useState('streets'); // 'streets' | 'satellite'
  const [showPlacesDrawer, setShowPlacesDrawer] = useState(false);

  // Categories as specified
  const categories = [
    { id: 'all', label: 'All Nearby', icon: MapPin, color: 'text-cyan-400' },
    { id: 'hospitals', label: 'Hospitals', icon: Building2, color: 'text-red-400' },
    { id: 'police', label: 'Police Stations', icon: Shield, color: 'text-blue-400' },
    { id: 'petrol', label: 'Petrol Bunks', icon: Fuel, color: 'text-amber-400' },
    { id: 'bus_stands', label: 'Bus Stands', icon: Bus, color: 'text-emerald-400' },
    { id: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed, color: 'text-orange-400' },
  ];

  // 1. Initial Location detection and start continuous tracking on mount
  useEffect(() => {
    if (!isOpen) {
      if (watchIdRef.current) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    startContinuousTracking();

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOpen]);

  // Reverse geocode whenever lat/lon changes
  const updateAddress = async (lat, lon) => {
    try {
      const res = await api.reverseGeocode(lat, lon);
      if (res.display_name) {
        setUserLocation(prev => ({
          ...prev,
          address: res.display_name
        }));
      }
    } catch {
      setUserLocation(prev => ({
        ...prev,
        address: `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)}), Tamil Nadu, India`
      }));
    }
  };

  // Continuous real-time location tracking using watchPosition
  const startContinuousTracking = () => {
    if (!navigator.geolocation) {
      updateAddress(11.1271, 78.6569);
      loadNearby(11.1271, 78.6569, activeCategory);
      return;
    }

    // Get immediate position first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleNewCoordinates(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, true);
      },
      () => {
        handleNewCoordinates(11.1271, 78.6569, 50, true);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );

    // Watch for dynamic updates
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        handleNewCoordinates(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, false);
      },
      (err) => {
        console.warn("Continuous GPS tracking error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    watchIdRef.current = id;
    setIsLiveTracking(true);
  };

  const handleNewCoordinates = (lat, lon, accuracy, isInitial = false) => {
    setUserLocation(prev => ({
      ...prev,
      lat,
      lon,
      accuracy: Math.round(accuracy || 15)
    }));

    updateAddress(lat, lon);

    // Update marker on Leaflet map dynamically without page reload
    if (mapInstanceRef.current && window.L) {
      const L = window.L;
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lon]);
      }
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.setLatLng([lat, lon]);
        userAccuracyCircleRef.current.setRadius(accuracy || 20);
      }
      if (isInitial) {
        mapInstanceRef.current.setView([lat, lon], 14);
      }
    }

    if (isInitial) {
      loadNearby(lat, lon, activeCategory);
    }
  };

  // Load nearby places from real API
  const loadNearby = async (lat, lon, cat = 'all') => {
    setLoadingPlaces(true);
    try {
      const res = await api.getNearbyPlaces(lat, lon, cat);
      setNearbyPlaces(res.places || []);
    } catch (e) {
      console.warn("Nearby places fetch error:", e);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Switch category filter
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    loadNearby(userLocation.lat, userLocation.lon, catId);
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;
    let isMounted = true;

    const initMap = async () => {
      try {
        const L = window.L || (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lon],
          zoom: 14,
          zoomControl: false,
        });

        // Layer selection
        const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        });

        const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '&copy; Esri World Imagery'
        });

        if (mapLayer === 'satellite') {
          satelliteTiles.addTo(map);
        } else {
          streetTiles.addTo(map);
        }

        // Live User Position Marker (Google Maps Style Blue Navigation Dot + Accuracy Radius)
        const userIcon = L.divIcon({
          className: 'google-nav-dot',
          html: `
            <div style="position: relative; width: 26px; height: 26px;">
              <div style="position: absolute; inset: -10px; background: rgba(14, 165, 233, 0.35); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 26px; height: 26px; background: #0284c7; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 16px rgba(2, 132, 199, 0.9);"></div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon }).addTo(map);
        userMarkerRef.current.bindPopup(`<b>Your Live GPS Location</b><br/>Lat: ${userLocation.lat.toFixed(5)}<br/>Lon: ${userLocation.lon.toFixed(5)}`);

        userAccuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lon], {
          radius: userLocation.accuracy || 20,
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.15,
          weight: 1
        }).addTo(map);

        // Group for places markers
        placesMarkersGroupRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error("Leaflet init error:", err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, mapLayer]);

  // Update places markers when nearbyPlaces change
  useEffect(() => {
    if (!mapInstanceRef.current || !placesMarkersGroupRef.current || !window.L) return;
    const L = window.L;
    placesMarkersGroupRef.current.clearLayers();

    nearbyPlaces.forEach(p => {
      let pinColor = '#3b82f6';
      let pinChar = '📍';
      if (p.category === 'Hospital') { pinColor = '#ef4444'; pinChar = '🏥'; }
      else if (p.category === 'Police Station') { pinColor = '#2563eb'; pinChar = '👮'; }
      else if (p.category === 'Petrol Bunk') { pinColor = '#f59e0b'; pinChar = '⛽'; }
      else if (p.category === 'Bus Stand') { pinColor = '#10b981'; pinChar = '🚌'; }
      else if (p.category === 'Restaurant') { pinColor = '#ea580c'; pinChar = '🍽️'; }

      const icon = L.divIcon({
        className: 'place-marker',
        html: `
          <div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:13px; font-weight:bold; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
            ${pinChar}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([p.latitude, p.longitude], { icon })
        .addTo(placesMarkersGroupRef.current)
        .bindPopup(`
          <div style="font-family: sans-serif; color: #0f172a; padding: 4px; min-width: 170px;">
            <b style="font-size: 13px; color: ${pinColor};">${p.name}</b><br/>
            <span style="font-size: 11px; color: #64748b;">${p.category} • <b>${p.distance_km} km away</b></span><br/>
            ${p.phone ? `<span style="font-size: 11px;">📞 ${p.phone}</span><br/>` : ''}
            <a href="${p.navigation_url}" target="_blank" rel="noreferrer" style="display:inline-block; margin-top:6px; font-size:11px; background:#2563eb; color:white; padding:4px 8px; border-radius:6px; text-decoration:none; font-weight:bold;">
              Navigate in Google Maps ↗
            </a>
          </div>
        `);

      marker.on('click', () => setSelectedPlace(p));
    });
  }, [nearbyPlaces]);

  // Zoom In / Zoom Out controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Center on Current Location
  const handleCenterOnUser = () => {
    if (mapInstanceRef.current && userLocation.lat && userLocation.lon) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lon], 15, { duration: 1.2 });
    }
  };

  // Search places / addresses
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.searchPlaces(searchQuery, userLocation.lat, userLocation.lon);
      if (res.results && res.results.length > 0) {
        const topResult = res.results[0];
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([topResult.latitude, topResult.longitude], 15, { duration: 1.5 });

          if (window.L) {
            const L = window.L;
            const searchPin = L.marker([topResult.latitude, topResult.longitude])
              .addTo(mapInstanceRef.current)
              .bindPopup(`<b>${topResult.display_name}</b><br/><a href="${topResult.navigation_url}" target="_blank">Directions ↗</a>`)
              .openPopup();
          }
        }
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[90vh] rounded-3xl glass-panel border border-cyan-500/40 overflow-hidden shadow-2xl flex flex-col">

        {/* Top Bar: Search + Live Address + Category Chips */}
        <div className="p-3 sm:p-4 bg-slate-950/95 border-b border-cyan-500/30 space-y-3 z-20">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Live GPS Coordinate & Address Tag */}
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs w-full sm:w-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
              <div className="truncate max-w-md">
                <span className="text-white">GPS:</span> {userLocation.lat.toFixed(5)}, {userLocation.lon.toFixed(5)}
                <span className="text-slate-400 font-normal ml-1">({userLocation.address})</span>
              </div>
            </div>

            {/* Place Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any place, city, hospital, or route..."
                className="w-full glass-input rounded-xl px-4 py-2 pl-10 text-xs sm:text-sm text-white"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
              </button>
            </form>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Chips as specified */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${activeCategory === cat.id
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/40'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                    }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowPlacesDrawer(!showPlacesDrawer)}
              className="ml-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <List className="w-3.5 h-3.5" />
              <span>List ({nearbyPlaces.length})</span>
            </button>
          </div>

        </div>

        {/* Map Body & Controls */}
        <div className="relative flex-1 w-full h-full bg-[#050c1a] overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Zoom In, Zoom Out, Center-on-Me, Satellite Toggle Controls */}
          <div className="absolute right-4 bottom-6 z-20 flex flex-col gap-2 shadow-2xl">
            {/* Zoom In Button */}
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-10 h-10 rounded-xl bg-slate-900/95 text-white hover:text-cyan-400 border border-cyan-500/40 flex items-center justify-center hover:bg-slate-800 transition backdrop-blur-md shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Zoom Out Button */}
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-10 h-10 rounded-xl bg-slate-900/95 text-white hover:text-cyan-400 border border-cyan-500/40 flex items-center justify-center hover:bg-slate-800 transition backdrop-blur-md shadow-lg"
            >
              <Minus className="w-5 h-5" />
            </button>

            {/* Center on My Live GPS Location Button */}
            <button
              onClick={handleCenterOnUser}
              title="Center on My Location"
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 flex items-center justify-center transition shadow-lg shadow-blue-600/50 active:scale-95"
            >
              <LocateFixed className="w-5 h-5 animate-pulse" />
            </button>

            {/* Map Layer Switcher (Streets vs Satellite) */}
            <button
              onClick={() => setMapLayer(mapLayer === 'streets' ? 'satellite' : 'streets')}
              title="Toggle Satellite View"
              className="w-10 h-10 rounded-xl bg-slate-900/95 text-amber-400 hover:text-amber-300 border border-amber-500/40 flex items-center justify-center hover:bg-slate-800 transition backdrop-blur-md shadow-lg"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* Left Status Overlay */}
          <div className="absolute left-4 top-4 z-20 hidden sm:flex flex-col gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md text-xs text-slate-200 shadow-xl space-y-1 max-w-sm">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Continuous GPS Location Tracking</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Automatically updates marker position as your vehicle or device moves.
              </p>
            </div>
          </div>

          {/* Side Drawer: Nearby Places List */}
          {showPlacesDrawer && (
            <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-slate-950/95 border-l border-cyan-500/30 z-30 flex flex-col p-4 overflow-y-auto animate-fade-in backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Nearby Places ({nearbyPlaces.length})</span>
                </h3>
                <button onClick={() => setShowPlacesDrawer(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mt-3">
                {nearbyPlaces.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/60 transition space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white">{p.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        {p.distance_km} km
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{p.category} {p.phone && `• 📞 ${p.phone}`}</p>
                    <div className="flex gap-2 pt-1">
                      <a
                        href={p.navigation_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        Navigate in Google Maps ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
