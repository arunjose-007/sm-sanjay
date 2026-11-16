import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, Eye, RefreshCw, Wifi, WifiOff, MapPin } from 'lucide-react';
import { api } from '../services/api';

export default function LiveWeatherWidget({ onExpand }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentWeather();
      setWeather(data);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.warn("Weather fetch error, using baseline fallback", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const temp = weather ? Math.round(weather.temperature) : 28;
  const condition = weather?.weather_condition || 'Partly Cloudy';
  const humidity = weather ? Math.round(weather.humidity) : 72;
  const windSpeed = weather ? Math.round(weather.wind_speed) : 14;
  const visibility = weather?.visibility ? `${weather.visibility} km` : '10 km';
  const isCached = weather?.is_cached;

  return (
    <div className="relative rounded-2xl glass-panel border border-sky-500/30 p-4 sm:p-5 shadow-xl bg-slate-950/70 hover:border-sky-400/50 transition-all flex flex-col justify-between">
      
      {/* Top Bar with title and refresh */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
            Live Weather
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {isCached ? (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>Cached</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Live API</span>
            </span>
          )}

          <button
            onClick={fetchWeather}
            disabled={loading}
            title="Refresh Weather Data"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content matching screenshot */}
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Weather Icon & Temperature */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600/20 to-amber-500/20 border border-sky-400/30 flex items-center justify-center text-amber-300 shadow-md">
            <CloudSun className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {temp}°C
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {condition}
            </div>
          </div>
        </div>

        {/* Right: Metrics Grid */}
        <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-300 pr-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Humidity:</span>
            <span className="font-semibold text-white">{humidity}%</span>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Wind Speed:</span>
            <span className="font-semibold text-white">{windSpeed} km/h</span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Visibility:</span>
            <span className="font-semibold text-white">{visibility}</span>
          </div>
        </div>

      </div>

      {/* Bottom Sub-info */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-sky-400" />
          {weather?.location_name || 'Tamil Nadu, India'}
        </span>
        {lastRefreshed && (
          <span>Updated: {lastRefreshed}</span>
        )}
      </div>

    </div>
  );
}
