import React from 'react';
import { Check, ArrowRight, Users, Fish, Truck, Bot, MapPin, AlertTriangle, PhoneCall } from 'lucide-react';
import { FarmerIllustration, FishermanIllustration, DriverIllustration } from '../assets/illustrations';
import LiveWeatherWidget from '../components/LiveWeatherWidget';

export default function DashboardPage({
  onSelectSection,
  onOpenAI,
  onOpenSOS,
  onOpenMap,
  onOpenWeather
}) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* Heading matching reference image */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Choose Your Section
        </h1>
        <p className="text-sm text-sky-400 font-medium">
          Comprehensive AI-guided support for livelihoods, marine fisheries, and highway safety
        </p>
      </div>

      {/* 3 Main Cards Grid matching reference image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        
        {/* CARD 1: LIVELIHOOD */}
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-400/60 transition-all group">
          <div>
            {/* Top Banner Image */}
            <div className="relative h-44 overflow-hidden">
              <FarmerIllustration className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              {/* Badge Icon Overlap */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-4 border-slate-950 flex items-center justify-center text-white shadow-xl">
                <Users className="w-7 h-7" />
              </div>
            </div>

            {/* Title & Features */}
            <div className="pt-8 px-6 pb-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Livelihood
              </h2>

              <ul className="space-y-2.5 text-left text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Job Opportunities</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Government Schemes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Financial Assistance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Skill Development</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-6 pt-0">
            <button
              onClick={() => onSelectSection('livelihood')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all group-hover:bg-sky-500"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* CARD 2: FISHERMAN */}
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-cyan-500/30 hover:border-cyan-400/60 transition-all group">
          <div>
            {/* Top Banner Image */}
            <div className="relative h-44 overflow-hidden">
              <FishermanIllustration className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              {/* Badge Icon Overlap */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-4 border-slate-950 flex items-center justify-center text-white shadow-xl">
                <Fish className="w-7 h-7" />
              </div>
            </div>

            {/* Title & Features */}
            <div className="pt-8 px-6 pb-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Fisherman
              </h2>

              <ul className="space-y-2.5 text-left text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Live Sea Weather</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Fishing Alerts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Wind Speed</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Wave Information</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-6 pt-0">
            <button
              onClick={() => onSelectSection('fisherman')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all group-hover:bg-cyan-500"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* CARD 3: DRIVER */}
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-blue-500/30 hover:border-blue-400/60 transition-all group">
          <div>
            {/* Top Banner Image */}
            <div className="relative h-44 overflow-hidden">
              <DriverIllustration className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              {/* Badge Icon Overlap */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-4 border-slate-950 flex items-center justify-center text-white shadow-xl">
                <Truck className="w-7 h-7" />
              </div>
            </div>

            {/* Title & Features */}
            <div className="pt-8 px-6 pb-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Driver
              </h2>

              <ul className="space-y-2.5 text-left text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Live Traffic</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Road Conditions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Accident Alerts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Nearby Hospitals</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-6 pt-0">
            <button
              onClick={() => onSelectSection('driver')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all group-hover:bg-indigo-500"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Integrated Live Cards matching bottom section in reference image */}
      <div className="pt-6 border-t border-slate-800/80">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Integrated Live Operational Feeds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. AI Assistant Teaser */}
          <div 
            onClick={onOpenAI}
            className="rounded-2xl glass-panel border border-purple-500/30 p-4 hover:border-purple-400/60 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Bot className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">AI Assistant</h4>
            </div>
            <p className="text-xs text-slate-300">
              Offline Llama-powered AI for farming, fishing, and road safety queries.
            </p>
            <span className="text-xs text-purple-400 font-medium mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch Chatbot <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 2. Live Map Card */}
          <div
            onClick={onOpenMap}
            className="rounded-2xl glass-panel border border-emerald-500/30 p-4 hover:border-emerald-400/60 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Live Map</h4>
            </div>
            <p className="text-xs text-slate-300">
              Real-time GPS tracking, trauma hospitals, and offline waypoint fallback.
            </p>
            <span className="text-xs text-emerald-400 font-medium mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Navigation Map <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 3. Live Weather Widget (Real Open-Meteo & Cache) */}
          <LiveWeatherWidget onExpand={onOpenWeather} />

          {/* 4. Emergency SOS Card matching reference UI */}
          <div className="rounded-2xl glass-panel border border-red-500/40 p-4 bg-gradient-to-br from-red-950/40 to-slate-950 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white">Emergency SOS</h4>
            </div>
            <p className="text-xs text-red-200">
              Need Help? Click to Alert Authorities Immediately.
            </p>
            <button
              onClick={onOpenSOS}
              className="mt-3 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Send SOS</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
