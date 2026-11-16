import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight, X, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { LogoShield } from '../assets/illustrations';
import { api } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setEmail('');
    setFullName('');
  };

  const handleSwitchTab = (newTab) => {
    resetForm();
    setTab(newTab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login(username, password);
        localStorage.setItem('user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
        onClose();
      } else if (tab === 'register') {
        const res = await api.register({
          username,
          email,
          password,
          full_name: fullName,
        });
        setSuccess('Registration complete! Please log in with your credentials.');
        setTab('login');
        setPassword('');
      } else if (tab === 'forgot') {
        const res = await api.forgotPassword(email, password);
        setSuccess(res.message || 'Password updated! Please log in.');
        setTab('login');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Container matching the split backdrop style from uploaded UI */}
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-sky-500/30 overflow-hidden shadow-2xl shadow-sky-950/60 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Emblem & Header matching UI */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 transform transition hover:scale-105">
            <LogoShield className="w-16 h-16 filter drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Intelligent Assistant
          </h2>
          <p className="text-xs font-semibold text-sky-400 mt-0.5">
            for Livelihood and Road Safety
          </p>
          <p className="text-xs text-slate-400 italic mt-1 font-medium">
            Smart Support... Safer Tomorrow...
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sanjai Kumar"
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {(tab === 'login' || tab === 'register') && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {(tab === 'register' || tab === 'forgot') && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {tab === 'forgot' ? 'New Password' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl pl-9 pr-10 py-2 text-sm text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Button matching reference UI */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>
                  {tab === 'login' ? 'Login' : tab === 'register' ? 'Create Account' : 'Reset Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Tab Switcher Links */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs space-y-2">
          {tab === 'login' ? (
            <>
              <div>
                <span className="text-slate-400">New User? </span>
                <button
                  onClick={() => handleSwitchTab('register')}
                  className="text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2"
                >
                  Register Here
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleSwitchTab('forgot')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <div>
              <span className="text-slate-400">Already have an account? </span>
              <button
                onClick={() => handleSwitchTab('login')}
                className="text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Guest / Demo Notice */}
          <div className="pt-2 text-[11px] text-slate-500">
            Demo Accounts: <span className="text-slate-400">sanjai</span> (pass: password123) | Admin: <span className="text-slate-400">admin</span> (pass: admin123)
          </div>
        </div>

      </div>
    </div>
  );
}
