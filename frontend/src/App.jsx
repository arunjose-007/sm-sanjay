import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import DashboardPage from './pages/DashboardPage';
import LivelihoodPage from './pages/LivelihoodPage';
import FishermanPage from './pages/FishermanPage';
import DriverPage from './pages/DriverPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AIAssistantWidget from './components/AIAssistantWidget';
import EmergencySOSModal from './components/EmergencySOSModal';
import LiveMapModal from './components/LiveMapModal';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'livelihood' | 'fisherman' | 'driver' | 'admin'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Check initial authentication
  useEffect(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Default demo profile for seamless experience
      const defaultUser = {
        id: 2,
        username: 'sanjai',
        full_name: 'Sanjai',
        role: 'user'
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }

    // 2. Verify with backend session
    api.getCurrentUser()
      .then(res => {
        if (res.authenticated && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    localStorage.removeItem('user');
    setCurrentUser(null);
    if (activeSection === 'admin') {
      setActiveSection('dashboard');
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050c1a] text-slate-100 relative">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => setActiveSection('admin')}
        isAdminView={activeSection === 'admin'}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-16">
        {activeSection === 'dashboard' && (
          <DashboardPage
            onSelectSection={(sec) => setActiveSection(sec)}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenWeather={() => setIsMapOpen(true)}
          />
        )}

        {activeSection === 'livelihood' && (
          <LivelihoodPage
            onBack={() => setActiveSection('dashboard')}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenWeather={() => setIsMapOpen(true)}
          />
        )}

        {activeSection === 'fisherman' && (
          <FishermanPage
            onBack={() => setActiveSection('dashboard')}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenWeather={() => setIsMapOpen(true)}
          />
        )}

        {activeSection === 'driver' && (
          <DriverPage
            onBack={() => setActiveSection('dashboard')}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenWeather={() => setIsMapOpen(true)}
          />
        )}

        {activeSection === 'admin' && (
          <AdminDashboardPage
            onBack={() => setActiveSection('dashboard')}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Floating Overlays & Modals */}
      <LoginModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AIAssistantWidget
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        moduleContext={activeSection === 'dashboard' ? 'general' : activeSection}
        currentUser={currentUser}
      />

      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        currentUser={currentUser}
      />

      <LiveMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Intelligent Assistant for Livelihood and Road Safety &copy; 2026</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Offline AI Powered by Ollama • Free Open-Source Architecture
          </span>
        </div>
      </footer>

    </div>
  );
}
