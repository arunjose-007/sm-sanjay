import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Anchor, Wind, Waves, AlertTriangle, ShieldCheck, ShieldAlert, Compass, Droplets, Eye, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { FishermanIllustration } from '../assets/illustrations';
import { api } from '../services/api';
import ActionDock from '../components/ActionDock';

export default function FishermanPage({
  onBack,
  onOpenAI,
  onOpenSOS,
  onOpenMap,
  onOpenWeather
}) {
  const [activeTab, setActiveTab] = useState('weather'); // 'weather' | 'alerts' | 'wind' | 'waves'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFishermanData();
  }, []);

  const fetchFishermanData = async () => {
    setLoading(true);
    try {
      const res = await api.getFishermanOverview();
      setData(res);
    } catch (e) {
      console.warn("Failed fetching fisherman data", e);
    } finally {
      setLoading(false);
    }
  };

  const weather = data?.weather;
  const alerts = data?.alerts || [];
  const safety = data?.safety_status || {
    level: 'advisory',
    badge: 'Maritime Advisory',
    message: 'Check sea bulletins before venturing into deep waters.',
    color: '#f59e0b'
  };
  const waveInfo = data?.wave_information || {
    current_wave_height: '1.2 - 1.8 m',
    wave_direction: 'South-Southeast (SSE)',
    wave_period: '6.4 seconds',
    sea_state: 'Moderate Churn'
  };
  const windInfo = data?.wind_information || {
    wind_speed: '18 km/h (9.7 Knots)',
    wind_direction: 'SSE',
    gusts: '24 km/h',
    beaufort_scale: 'Force 3 (Gentle Breeze)'
  };

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
          <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
            Module 02
          </span>
          <h2 className="text-sm sm:text-lg font-bold text-white">
            Fisherman Support
          </h2>
        </div>
      </div>

      {/* Hero Split Card matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        
        {/* Left Side: 4 Feature Action Cards matching reference image */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                <Anchor className="w-5 h-5" />
              </span>
              <span>Fisherman Support</span>
            </h1>
            <p className="text-xs sm:text-sm text-cyan-300/80 mt-1">
              Safety at Sea, Prosperity on Land
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* 1. Live Sea Weather */}
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'weather'
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Live Sea Weather</div>
                <div className="text-[11px] text-slate-400">Check sea conditions</div>
              </div>
            </button>

            {/* 2. Fishing Alerts */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'alerts'
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Fishing Alerts</div>
                <div className="text-[11px] text-slate-400">Get alerts & updates</div>
              </div>
            </button>

            {/* 3. Wind Speed */}
            <button
              onClick={() => setActiveTab('wind')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'wind'
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Wind Speed</div>
                <div className="text-[11px] text-slate-400">Real-time wind data</div>
              </div>
            </button>

            {/* 4. Wave Information */}
            <button
              onClick={() => setActiveTab('waves')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'waves'
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Wave Information</div>
                <div className="text-[11px] text-slate-400">Know the waves</div>
              </div>
            </button>

          </div>
        </div>

        {/* Right Side: Hero Marine Boat Illustration */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-xl border border-cyan-500/20 relative min-h-[220px]">
          <FishermanIllustration className="w-full h-full min-h-[220px]" />
        </div>

      </div>

      {/* Real-time Marine Safety Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
        safety.level === 'danger'
          ? 'bg-red-950/70 border-red-500 text-red-200'
          : safety.level === 'advisory'
          ? 'bg-amber-950/60 border-amber-500 text-amber-200'
          : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center shrink-0">
            {safety.level === 'danger' ? (
              <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            ) : safety.level === 'advisory' ? (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>{safety.badge}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                Palk Bay & Gulf of Mannar
              </span>
            </div>
            <div className="text-xs mt-0.5">{safety.message}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          {weather?.is_cached ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 text-amber-300">
              <WifiOff className="w-3.5 h-3.5" /> Showing Cached Data ({new Date(weather.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 text-emerald-300">
              <Wifi className="w-3.5 h-3.5" /> Live Marine Telemetry
            </span>
          )}
          <button
            onClick={fetchFishermanData}
            title="Refresh Sea Sensors"
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Detailed Telemetry Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Panel 1: Live Sea Weather */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Sea Weather</span>
            <Sun className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {weather ? Math.round(weather.temperature) : 28}°C
          </div>
          <div className="text-xs text-slate-300">
            {weather?.weather_condition || 'Partly Cloudy'}
          </div>
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Humidity:</span>
              <span className="text-white font-medium">{weather?.humidity || 72}%</span>
            </div>
            <div className="flex justify-between">
              <span>Sea Visibility:</span>
              <span className="text-white font-medium">{weather?.visibility || 10} km</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Wind Speed & Direction */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Wind Speed</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {weather ? Math.round(weather.wind_speed) : 14} <span className="text-sm font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-xs text-cyan-300 font-medium">
            {windInfo.beaufort_scale}
          </div>
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Direction:</span>
              <span className="text-white font-medium">{windInfo.wind_direction}</span>
            </div>
            <div className="flex justify-between">
              <span>Gust Speed:</span>
              <span className="text-white font-medium">{windInfo.gusts}</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Wave Information */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Wave Information</span>
            <Waves className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {waveInfo.current_wave_height}
          </div>
          <div className="text-xs text-indigo-300 font-medium">
            {waveInfo.sea_state}
          </div>
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Wave Period:</span>
              <span className="text-white font-medium">{waveInfo.wave_period}</span>
            </div>
            <div className="flex justify-between">
              <span>Direction:</span>
              <span className="text-white font-medium">{waveInfo.wave_direction}</span>
            </div>
          </div>
        </div>

        {/* Panel 4: Emergency Maritime Contacts */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 bg-blue-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Sea Emergency</span>
            <Anchor className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Coast Guard SAR Hotline:</div>
            <a href="tel:1554" className="text-2xl font-black text-white hover:text-cyan-300 transition block">
              1554
            </a>
          </div>
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-300">
            <div><b>VHF Channel:</b> Ch 16 (Distress Frequency)</div>
            <div><b>Harbor Control:</b> 04573-221233</div>
          </div>
        </div>

      </div>

      {/* Fishing Alerts & Warnings List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Anchor className="w-4 h-4 text-cyan-400" />
            <span>Active Coastal Advisories & Fishing Alerts</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {alerts.length} Bulletin(s) Available
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                alert.severity === 'danger'
                  ? 'bg-red-950/40 border-red-500/50'
                  : alert.severity === 'advisory'
                  ? 'bg-amber-950/40 border-amber-500/40'
                  : 'bg-emerald-950/40 border-emerald-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    alert.severity === 'danger'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : alert.severity === 'advisory'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {alert.severity}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {alert.alert_title}
                  </h4>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  Valid: {alert.valid_until || 'Next 24 Hours'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {alert.advisory}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[11px] bg-black/30 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 block">Sea Condition:</span>
                  <span className="font-semibold text-white">{alert.sea_condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Wind Velocity:</span>
                  <span className="font-semibold text-white">{alert.wind_speed}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Wave Heights:</span>
                  <span className="font-semibold text-white">{alert.wave_height}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
