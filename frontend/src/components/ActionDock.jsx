import React from 'react';
import { Bot, AlertTriangle, MapPin, CloudSun } from 'lucide-react';

export default function ActionDock({
  onOpenAI,
  onOpenSOS,
  onOpenMap,
  onOpenWeather,
  isAIActive,
  isSOSActive
}) {
  return (
    <div className="w-full py-4 mt-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 px-2">
        
        {/* 1. AI Assistant Button */}
        <button
          onClick={onOpenAI}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
            isAIActive
              ? 'bg-purple-900/40 border-purple-400/80 shadow-lg shadow-purple-950/60'
              : 'bg-slate-900/80 hover:bg-slate-800/80 border-purple-500/30 hover:border-purple-400/60 shadow-md'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
              AI Assistant
            </div>
            <div className="text-[11px] text-purple-300/70 truncate">
              Ask anything...
            </div>
          </div>
        </button>

        {/* 2. Emergency SOS Button */}
        <button
          onClick={onOpenSOS}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
            isSOSActive
              ? 'bg-red-950/70 border-red-500 shadow-xl shadow-red-950/80 animate-pulse'
              : 'bg-red-950/30 hover:bg-red-950/50 border-red-500/40 hover:border-red-400/70 shadow-md'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs sm:text-sm font-semibold text-red-200 group-hover:text-red-100 transition-colors">
              Emergency
            </div>
            <div className="text-[11px] text-red-400/80 font-medium">
              SOS Immediate
            </div>
          </div>
        </button>

        {/* 3. Live Map Button */}
        <button
          onClick={onOpenMap}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-400/60 shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
              Live Map
            </div>
            <div className="text-[11px] text-emerald-300/70 truncate">
              Find location
            </div>
          </div>
        </button>

        {/* 4. Live Weather Button */}
        <button
          onClick={onOpenWeather}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-sky-500/30 hover:border-sky-400/60 shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CloudSun className="w-5 h-5 text-sky-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
              Live Weather
            </div>
            <div className="text-[11px] text-sky-300/70 truncate">
              Check weather
            </div>
          </div>
        </button>

      </div>
    </div>
  );
}
