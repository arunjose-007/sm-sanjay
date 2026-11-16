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
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check initial authentication
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) {
          setCurrentUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoadingAuth(false);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveSection('dashboard');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // If not logged in, enforce login screen (cannot enter without login)
  if (!currentUser && !isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#050c1a] text-slate-100 flex flex-col justify-center items-center">
        <LoginModal
          isOpen={true}
          isMandatory={true}
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#050c1a] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050c1a] text-slate-100 relative selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenAuth={() => {}}
        onLogout={handleLogout}
        onOpenAdmin={() => setActiveSection('admin')}
        onOpenAI={() => setIsAIOpen(true)}
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
          <AdminDashboardPage onBack={() => setActiveSection('dashboard')} />
        )}
      </main>

      {/* Floating & Modal Widgets */}
      <AIAssistantWidget
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        moduleContext={activeSection}
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
    </div>
  );
}
