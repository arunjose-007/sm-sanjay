import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrafficCone, AlertTriangle, Cross, Car, Phone, Navigation, MapPin, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('traffic'); // 'traffic' | 'conditions' | 'hospitals' | 'accidents'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState({ lat: 11.1271, lon: 78.6569 });

  useEffect(() => {
    // Detect GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserCoords(coords);
          loadDriverData(coords.lat, coords.lon);
        },
        () => loadDriverData(11.1271, 78.6569)
      );
    } else {
      loadDriverData(11.1271, 78.6569);
    }
  }, []);

  const loadDriverData = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await api.getDriverOverview(lat, lon);
      setData(res);
    } catch (e) {
      console.warn("Failed loading driver data", e);
    } finally {
      setLoading(false);
    }
  };

  const trafficAlerts = data?.traffic_alerts || [];
  const roadConditions = data?.road_conditions || [];
  const hospitals = data?.nearby_hospitals || [];
  const accidentAlerts = data?.accident_alerts || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-xs sm:text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-blue-400 uppercase tracking-widest font-bold">
            Module 03
          </span>
          <h2 className="text-sm sm:text-lg font-bold text-white">
            Driver Support
          </h2>
        </div>
      </div>

      {/* Hero Split Card matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 overflow-hidden shadow-2xl">
        
        {/* Left Side: 4 Feature Action Cards matching reference image */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                <Car className="w-5 h-5" />
              </span>
              <span>Driver Support</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-300/80 mt-1">
              Drive Safe, Reach Safe
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* 1. Live Traffic */}
            <button
              onClick={() => setActiveTab('traffic')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'traffic'
                  ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <TrafficCone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Live Traffic</div>
                <div className="text-[11px] text-slate-400">Check traffic updates</div>
              </div>
            </button>

            {/* 2. Road Conditions */}
            <button
              onClick={() => setActiveTab('conditions')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'conditions'
                  ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Road Conditions</div>
                <div className="text-[11px] text-slate-400">Know road status</div>
              </div>
            </button>

            {/* 3. Nearby Hospitals */}
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-purple-950/60 border-purple-400 shadow-lg shadow-purple-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Cross className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Nearby Hospitals</div>
                <div className="text-[11px] text-slate-400">Find hospitals nearby</div>
              </div>
            </button>

            {/* 4. Accident Alerts */}
            <button
              onClick={() => setActiveTab('accidents')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'accidents'
                  ? 'bg-rose-950/60 border-rose-400 shadow-lg shadow-rose-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Accident Alerts</div>
                <div className="text-[11px] text-slate-400">Get instant alerts</div>
              </div>
            </button>

          </div>
        </div>

        {/* Right Side: Hero Highway Truck Illustration */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-xl border border-blue-500/20 relative min-h-[220px]">
          <DriverIllustration className="w-full h-full min-h-[220px]" />
        </div>

      </div>

      {/* Tab Switcher / Content Filter Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white capitalize">
            {activeTab === 'traffic' && 'Highway Live Traffic Feeds'}
            {activeTab === 'conditions' && 'Roadway Hazards & Construction Alerts'}
            {activeTab === 'hospitals' && 'Nearby Emergency Trauma Care Centers'}
            {activeTab === 'accidents' && 'Accident Blackspots & Incident Reports'}
          </span>
        </div>

        <button
          onClick={() => loadDriverData(userCoords.lat, userCoords.lon)}
          className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Dynamic Content Display */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Loading driver safety records from SQLite database...</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* TAB 1: TRAFFIC ALERTS */}
          {activeTab === 'traffic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trafficAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {alert.alert_type}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {alert.road_name}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {alert.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="capitalize">Severity: <b className="text-amber-400">{alert.severity}</b></span>
                    <span className="text-emerald-400 font-semibold">Active Status</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ROAD CONDITIONS */}
          {activeTab === 'conditions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadConditions.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {alert.alert_type}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Active Warning
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {alert.road_name}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {alert.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="capitalize">Hazard Level: <b className="text-red-400">{alert.severity}</b></span>
                    <span className="text-sky-400">Pass with caution</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: NEARBY HOSPITALS */}
          {activeTab === 'hospitals' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
                <span>Distances computed automatically using your GPS coordinates via Haversine calculation.</span>
                <span className="font-bold text-sky-400">Sorted Nearest First</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospitals.map((hosp) => (
                  <div
                    key={hosp.id}
                    className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/40 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold shrink-0">
                            +
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-white">
                              {hosp.name}
                            </h3>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span className="truncate">{hosp.address}</span>
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                          {hosp.calculated_distance || hosp.distance || 5} km
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/80 text-xs text-slate-300 border border-slate-800">
                        <span className="text-purple-400 font-semibold block mb-0.5">Emergency Services:</span>
                        {hosp.emergency_services}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <a
                        href={`tel:${hosp.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call: {hosp.phone}</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + hosp.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACCIDENT ALERTS */}
          {activeTab === 'accidents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accidentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-card rounded-2xl p-5 border border-red-500/40 bg-red-950/20 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                        CRITICAL COLLISION ALERT
                      </span>
                      <span className="text-xs text-red-300 font-medium">
                        Highway Emergency Active
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {alert.road_name}
                    </h3>

                    <p className="text-xs text-red-100 leading-relaxed bg-black/40 p-3 rounded-xl border border-red-500/30">
                      {alert.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-red-500/30 flex items-center justify-between text-xs">
                    <span className="text-slate-300">Emergency Crane & Rescue Deployed</span>
                    <a
                      href="tel:1073"
                      className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Highway 1073
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Bottom Action Dock with 4 Buttons */}
      <ActionDock
        onOpenAI={onOpenAI}
        onOpenSOS={onOpenSOS}
        onOpenMap={onOpenMap}
        onOpenWeather={onOpenWeather}
      />

    </div>
  );
}
