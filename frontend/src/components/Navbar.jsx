import React from 'react';
import { Home, User, LogOut, Shield, ShieldAlert, LogIn } from 'lucide-react';
import { LogoShield } from '../assets/illustrations';

export default function Navbar({
  currentUser,
  activeSection,
  setActiveSection,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  isAdminView
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-sky-500/20 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveSection('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <LogoShield className="w-10 h-10 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              Intelligent Assistant
            </span>
            <span className="text-xs text-sky-400/90 hidden sm:inline font-medium">
              for Livelihood and Road Safety
            </span>
          </div>
        </div>

        {/* Right Navigation & User Controls */}
        <div className="flex items-center gap-3 sm:gap-6 text-sm">
          
          {/* Dashboard Home Button */}
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSection === 'dashboard' && !isAdminView
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Admin Dashboard Pill */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isAdminView
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console</span>
            </button>
          )}

          {/* User Profile or Login */}
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-md border border-sky-400/30">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs text-slate-400">Welcome,</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-100 max-w-[120px] truncate">
                    {currentUser.full_name || currentUser.username}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-sky-600/30 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Register</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
