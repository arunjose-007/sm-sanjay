import React from 'react';
import { Check, ArrowRight, Users, Fish, Truck, Bot, MapPin, AlertTriangle, PhoneCall, Sparkles, ShieldCheck, Waves, Activity } from 'lucide-react';
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 uppercase tracking-widest shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Unified Citizen Safety & Prosperity Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          Choose Your Section
        </h1>
        <p className="text-xs sm:text-sm text-sky-300/80 font-medium max-w-xl mx-auto">
          Intelligent AI-guided telemetry, welfare benefits, ocean safety, and highway trauma navigation.
        </p>
      </div>

      {/* 3 Main Cards Grid matching reference image with enhanced attractive styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

        {/* CARD 1: LIVELIHOOD */}
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border-2 border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] transition-all duration-300 group transform hover:-translate-y-1.5">
          <div>
            {/* Top Banner Image with Status Pill */}
            <div className="relative h-48 overflow-hidden">
              <FarmerIllustration className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050c1a] via-[#050c1a]/40 to-transparent"></div>

              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Schemes & Jobs</span>
              </div>

              {/* Badge Icon Overlap */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-4 border-[#050c1a] flex items-center justify-center text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8" />
              </div>
            </div>

            {/* Title & Features */}
            <div className="pt-8 px-6 pb-6 text-center space-y-4">
              <h2 className="text-2xl font-black text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                Livelihood
              </h2>

              <ul className="space-y-2.5 text-left text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Job Opportunities</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Government Schemes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Financial Assistance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Skill Development</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button & Metric Tag */}
          <div className="p-6 pt-0 space-y-3">
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300 font-semibold flex items-center justify-between">
              <span>Verified Portals</span>
              <span className="text-emerald-400 font-bold">PM-KISAN • PMMSY</span>
            </div>

            <button
              onClick={() => onSelectSection('livelihood')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 transition-all group-hover:scale-[1.02]"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* CARD 2: FISHERMAN */}
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border-2 border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] transition-all duration-300 group transform hover:-translate-y-1.5">
          <div>
            {/* Top Banner Image with Status Pill */}
            <div className="relative h-48 overflow-hidden">
              <FishermanIllustration className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050c1a] via-[#050c1a]/40 to-transparent"></div>

              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Sea State: Safe to Sail</span>
              </div>

              {/* Badge Icon Overlap */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-4 border-[#050c1a] flex items-center justify-center text-white shadow-[0_0_25px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
                <Fish className="w-8 h-8" />
              </div>
            </div>

            {/* Title & Features */}
            <div className="pt-8 px-6 pb-6 text-center space-y-4">
              <h2 className="text-2xl font-black text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                Fisherman
              </h2>

              <ul className="space-y-2.5 text-left text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Live Sea Weather</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Fishing Alerts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Wind Speed</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Wave Information</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button & Metric Tag */}
          <div className="p-6 pt-0 space-y-3">
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-300 font-semibold flex items-center justify-between">
              <span>Telemetry</span>
              <span className="text-cyan-400 font-bold">Wave: 1.2m • Wind: 14 km/h</span>
            </div>

            <button
              onClick={() => onSelectSection('fisherman')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-700/30 transition-all group-hover:scale-[1.02]"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* CARD 3: DRIVER */}
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border-2 border-blue-500/40 hover:border-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] transition-all duration-300 group transform hover:-translate-y-1.5">
          <div>
            {/* Top Banner Image with Status Pill */}
            <div className="relative h-48 overflow-hidden">
              <DriverIllustration className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050c1a] via-[#050c1a]/40 to-transparent"></div>

              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/60 text-[11px] font-bold text-blue-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>NH Corridor: Clear Flow</span>
              </div>

              {/* Badge Icon Overlap */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-4 border-[#050c1a] flex items-center justify-center text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
                <Truck className="w-8 h-8" />
              </div>
            </div>

            {/* Title & Features */}
            <div className="pt-8 px-6 pb-6 text-center space-y-4">
              <h2 className="text-2xl font-black text-white tracking-wide group-hover:text-blue-300 transition-colors">
                Driver
              </h2>

              <ul className="space-y-2.5 text-left text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Live Traffic</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Road Conditions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Accident Alerts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Nearby Hospitals</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button & Metric Tag */}
          <div className="p-6 pt-0 space-y-3">
            <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-300 font-semibold flex items-center justify-between">
              <span>24/7 Trauma Centers</span>
              <span className="text-blue-400 font-bold">5 Hospitals Online</span>
            </div>

            <button
              onClick={() => onSelectSection('driver')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 hover:from-blue-600 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-800/30 transition-all group-hover:scale-[1.02]"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Integrated Live Cards matching bottom section in reference image */}
      <div className="pt-6 border-t border-slate-800/80">
        <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Integrated Live Operational Feeds</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* 1. AI Assistant Teaser */}
          <div
            onClick={onOpenAI}
            className="rounded-2xl glass-panel border border-cyan-500/40 p-4 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Grok AI Assistant</h4>
                <span className="text-[10px] text-cyan-300 font-bold">xAI Fast Intelligence</span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              xAI Grok engine answering queries on weather, nearby places, farming, sea safety, and jobs.
            </p>
            <span className="text-xs text-cyan-400 font-bold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch Grok Assistant <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 2. Live Map Card */}
          <div
            onClick={onOpenMap}
            className="rounded-2xl glass-panel border border-emerald-500/40 p-4 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Map</h4>
                <span className="text-[10px] text-emerald-300 font-medium">Google Maps Style Tracking</span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Real-time GPS tracking, address search, satellite view, and trauma hospital navigation.
            </p>
            <span className="text-xs text-emerald-400 font-bold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Navigation Map <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 3. Live Weather Widget (Real Open-Meteo & Cache) */}
          <LiveWeatherWidget onExpand={onOpenWeather} />

          {/* 4. Emergency SOS Card */}
          <div className="rounded-2xl glass-panel border border-red-500/50 p-4 bg-gradient-to-br from-red-950/40 to-[#050c1a] flex flex-col justify-between hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] transition">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/60 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Emergency SOS</h4>
                <span className="text-[10px] text-red-400 font-bold">4 Emergency Contacts Active</span>
              </div>
            </div>
            <p className="text-xs text-red-200">
              Immediate GPS Location Sharing to: <b>6374926569, 7305800510, 8122603655, 7395893275</b>.
            </p>
            <button
              onClick={onOpenSOS}
              className="mt-3 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/50 transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Send SOS</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
