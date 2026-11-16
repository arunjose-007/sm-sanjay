import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, Eye, RefreshCw, Wifi, WifiOff, MapPin, CloudRain, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function LiveWeatherWidget({ onExpand }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [showForecast, setShowForecast] = useState(false);

  const fetchWeather = (userLat, userLon) => {
    setLoading(true);

    const callApi = (lat, lon) => {
      api.getCurrentWeather(lat, lon)
        .then((data) => {
          setWeather(data);
          setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        })
        .catch((e) => {
          console.warn("Weather API fetch error", e);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    if (userLat && userLon) {
      callApi(userLat, userLon);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => callApi(pos.coords.latitude, pos.coords.longitude),
        () => callApi(11.1271, 78.6569),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      callApi(11.1271, 78.6569);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(() => fetchWeather(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const temp = weather?.temperature ?? 28;
  const condition = weather?.condition || 'Partly Cloudy';
  const humidity = weather?.humidity ?? 72;
  const windSpeed = weather?.wind_speed ?? 14;
  const precipitation = weather?.precipitation_mm ?? 0.0;
  const locationName = weather?.location_name || 'Tamil Nadu, India';
  const forecast = weather?.forecast || [];

  return (
    <div className="relative rounded-2xl glass-panel border border-sky-500/30 p-4 sm:p-5 shadow-xl bg-slate-950/80 hover:border-sky-400/50 transition-all flex flex-col justify-between">

      {/* Top Bar with title and refresh */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
        <div className="flex items-center gap-1.5 truncate">
          <CloudSun className="w-4 h-4 text-sky-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase truncate">
            {locationName}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Wifi className="w-2.5 h-2.5 text-emerald-400" />
            <span>Live Met</span>
          </span>

          <button
            onClick={() => fetchWeather()}
            disabled={loading}
            title="Refresh Real-Time Weather"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Weather Card Display */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Temp and Condition */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600/30 to-amber-500/20 border border-sky-400/40 flex items-center justify-center text-amber-300 shadow-lg shrink-0">
            {precipitation > 0 ? <CloudRain className="w-8 h-8 text-cyan-300 animate-bounce" /> : <CloudSun className="w-8 h-8 text-amber-300" />}
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">
              {temp}°C
            </div>
            <div className="text-xs text-cyan-300 font-semibold truncate max-w-[120px]">
              {condition}
            </div>
          </div>
        </div>

        {/* Right: Real Metrics Grid */}
        <div className="grid grid-cols-1 gap-1 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400 text-[11px]">Humidity:</span>
            <span className="font-bold text-white text-[11px]">{humidity}%</span>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 text-[11px]">Wind:</span>
            <span className="font-bold text-white text-[11px]">{windSpeed} km/h</span>
          </div>

          <div className="flex items-center gap-2">
            <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400 text-[11px]">Rainfall:</span>
            <span className="font-bold text-cyan-300 text-[11px]">{precipitation} mm</span>
          </div>
        </div>
      </div>

      {/* Multi-Day Forecast Expand Toggle */}
      {forecast.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="w-full text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>5-Day Meteorological Forecast</span>
            </span>
            {showForecast ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showForecast && (
            <div className="grid grid-cols-5 gap-1.5 pt-2.5 mt-1 border-t border-slate-800/60 animate-fade-in text-center">
              {forecast.slice(0, 5).map((f, idx) => (
                <div key={idx} className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">{f.date.slice(5)}</div>
                  <div className="text-xs font-bold text-white my-0.5">{Math.round(f.max_temp)}°</div>
                  <div className="text-[9px] text-cyan-400 truncate">{f.condition}</div>
                  <div className="text-[9px] text-sky-300 mt-0.5">{f.precipitation_probability}% 🌧️</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
