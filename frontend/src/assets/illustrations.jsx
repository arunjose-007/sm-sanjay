import React from 'react';

export const LogoShield = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 115" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="50%" stopColor="#1e40af" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    <path
      d="M50 4L90 20V55C90 85 50 110 50 110C50 110 10 85 10 55V20L50 4Z"
      fill="url(#shieldGrad)"
      stroke="#38bdf8"
      strokeWidth="3.5"
    />
    {/* Sun / Sky */}
    <circle cx="50" cy="40" r="14" fill="#fbbf24" opacity="0.9" />
    {/* Green fields */}
    <path d="M22 65C30 58 40 58 48 65L50 67L52 65C60 58 70 58 78 65C76 75 70 82 50 95C30 82 24 75 22 65Z" fill="#10b981" opacity="0.85" />
    {/* Road */}
    <path d="M44 52L36 94H64L56 52H44Z" fill="#334155" />
    <path d="M50 56V62M50 67V75M50 80V90" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="3 3" />
    {/* People / Community Icons */}
    <circle cx="34" cy="45" r="4" fill="#ffffff" />
    <path d="M28 55C28 50 40 50 40 55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="66" cy="45" r="4" fill="#ffffff" />
    <path d="M60 55C60 50 72 50 72 55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FarmerIllustration = ({ className = "w-full h-48 object-cover" }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div className="relative z-10 flex flex-col items-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-3 shadow-lg shadow-emerald-950/60">
        <svg className="w-9 h-9 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <span className="text-emerald-200 font-semibold text-lg tracking-wide">Agricultural & Rural Livelihood</span>
      <span className="text-emerald-400/80 text-xs mt-1">Smart Farming • Jobs • Government Grants</span>
    </div>
  </div>
);

export const FishermanIllustration = ({ className = "w-full h-48 object-cover" }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br from-cyan-950 via-blue-950 to-slate-900 flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div className="relative z-10 flex flex-col items-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-3 shadow-lg shadow-cyan-950/60">
        <svg className="w-9 h-9 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span className="text-cyan-200 font-semibold text-lg tracking-wide">Marine & Coastal Safety</span>
      <span className="text-cyan-400/80 text-xs mt-1">Sea Weather • Wind Speed • Wave Bulletins</span>
    </div>
  </div>
);

export const DriverIllustration = ({ className = "w-full h-48 object-cover" }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div className="relative z-10 flex flex-col items-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mb-3 shadow-lg shadow-blue-950/60">
        <svg className="w-9 h-9 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      </div>
      <span className="text-blue-200 font-semibold text-lg tracking-wide">Highway & Road Navigation</span>
      <span className="text-blue-400/80 text-xs mt-1">Live Traffic • Hazard Warnings • Hospitals</span>
    </div>
  </div>
);
