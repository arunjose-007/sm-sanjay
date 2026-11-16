import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight, X, AlertCircle, CheckCircle, Shield, Sparkles, Check } from 'lucide-react';
import { LogoShield, FishermanIllustration, DriverIllustration } from '../assets/illustrations';
import { api } from '../services/api';

export default function LoginModal({ isOpen, isMandatory = false, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationLimitReached, setRegistrationLimitReached] = useState(false);

  // Check 20-user registration limit on modal open and tab change
  React.useEffect(() => {
    api.getRegistrationStatus()
      .then(res => {
        if (res.limit_reached) {
          setRegistrationLimitReached(true);
        } else {
          setRegistrationLimitReached(false);
        }
      })
      .catch(() => {});
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setFullName('');
  };

  const handleSwitchTab = (newTab) => {
    resetForm();
    setTab(newTab);
  };

  // Basic password strength score
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, text: 'Fair', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (tab === 'register') {
      if (!fullName.trim()) {
        setError('Please enter your Full Name.');
        return;
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address (e.g. name@example.com).');
        return;
      }
      if (!username.trim() || username.trim().length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify both password fields.');
        return;
      }
    }

    if (tab === 'forgot') {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter your registered email address.');
        return;
      }
      if (password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('New passwords do not match. Please verify.');
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login(username, password);
        localStorage.setItem('user', JSON.stringify(res.user));
        setSuccess(`Welcome back, ${res.user.full_name || res.user.username}!`);
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 300);
      } else if (tab === 'register') {
        const res = await api.register({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
        });
        
        // Auto-login and direct redirect to Dashboard
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          setSuccess(`Account created! Welcome, ${res.user.full_name}! Entering dashboard...`);
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 400);
        } else {
          setSuccess('Account created! Please log in.');
          setTab('login');
        }
      } else if (tab === 'forgot') {
        const res = await api.forgotPassword(email.trim().toLowerCase(), password);
        setSuccess(res.message || 'Password updated successfully! Please log in.');
        setTimeout(() => {
          setTab('login');
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your network and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050c1a] overflow-y-auto">
      
      {/* Background Split Artwork matching UI Inspiration */}
      <div className="fixed inset-0 grid grid-cols-1 md:grid-cols-2 opacity-25 pointer-events-none">
        <div className="relative overflow-hidden h-full">
          <FishermanIllustration className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#050c1a]/80 to-[#050c1a]"></div>
        </div>
        <div className="relative overflow-hidden h-full hidden md:block">
          <DriverIllustration className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#050c1a]/80 to-[#050c1a]"></div>
        </div>
      </div>

      {/* Decorative ambient lighting */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Centered Glassmorphic Login/Register Card */}
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] p-5 sm:p-8 z-10 backdrop-blur-2xl my-auto">
        
        {/* Close Button only if not mandatory */}
        {!isMandatory && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Shield Emblem & Header matching exact reference design */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="mb-2.5 transform transition hover:scale-105 duration-300">
            <LogoShield className="w-14 h-14 sm:w-16 sm:h-16 filter drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Intelligent Assistant
          </h2>
          <p className="text-[11px] sm:text-xs font-semibold text-cyan-400 mt-0.5 tracking-wider uppercase">
            for Livelihood and Road Safety
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 italic mt-0.5 font-medium">
            Smart Support... Safer Tomorrow...
          </p>
        </div>

        {/* Registration Limit Alert (When 20 users reached) */}
        {tab === 'register' && registrationLimitReached && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-white text-xs">Maximum user registration limit (20) reached.</div>
              <div className="text-[11px] text-amber-300/80 mt-0.5">
                New user sign-ups are currently closed. Existing registered users can log in with their credentials.
              </div>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-500/15 border border-red-500/40 flex items-start gap-2 text-xs text-red-200 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-2 text-xs text-emerald-200">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span className="leading-relaxed">{success}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sanjai Kumar"
                  className="w-full glass-input rounded-xl px-3 py-2 pl-9 text-xs sm:text-sm"
                />
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          {(tab === 'register' || tab === 'forgot') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full glass-input rounded-xl px-3 py-2 pl-9 text-xs sm:text-sm"
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          {tab !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {tab === 'login' ? 'Username or Email Address' : 'Username'} <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={tab === 'login' ? "Username or email (e.g. sanjai)" : "Choose a unique username"}
                  className="w-full glass-input rounded-xl px-3 py-2 pl-9 text-xs sm:text-sm"
                />
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                {tab === 'forgot' ? 'New Password' : 'Password'} <span className="text-cyan-400">*</span>
              </label>
              {tab === 'register' && password && (
                <span className="text-[10px] text-slate-400">
                  Strength: <span className="font-bold text-white">{strength.text}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full glass-input rounded-xl px-3 py-2 pl-9 pr-9 text-xs sm:text-sm"
              />
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-300" />}
              </button>
            </div>
            {tab === 'register' && password && (
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.color} ${strength.score === 1 ? 'w-1/3' : strength.score === 2 ? 'w-2/3' : 'w-full'}`}></div>
              </div>
            )}
          </div>

          {(tab === 'register' || tab === 'forgot') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full glass-input rounded-xl px-3 py-2 pl-9 pr-9 text-xs sm:text-sm"
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-300" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (tab === 'register' && registrationLimitReached)}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all transform active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>
                  {tab === 'login' && 'Login →'}
                  {tab === 'register' && (registrationLimitReached ? 'Registration Limit (20) Reached' : 'Create Account →')}
                  {tab === 'forgot' && 'Reset Password →'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Links */}
        <div className="mt-5 text-center space-y-1.5 text-xs">
          {tab === 'login' && (
            <>
              <div>
                <span className="text-slate-400">New User? </span>
                <button
                  onClick={() => handleSwitchTab('register')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
                >
                  Register Here
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleSwitchTab('forgot')}
                  className="text-slate-400 hover:text-slate-300 transition"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}

          {tab === 'register' && (
            <div>
              <span className="text-slate-400">Already have an account? </span>
              <button
                onClick={() => handleSwitchTab('login')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
              >
                Log In
              </button>
            </div>
          )}

          {tab === 'forgot' && (
            <div>
              <button
                onClick={() => handleSwitchTab('login')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
