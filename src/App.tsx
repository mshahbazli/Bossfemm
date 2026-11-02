import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store';
import { translations } from './i18n';
import LandingPage from './components/LandingPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import AdminDashboard from './components/AdminDashboard';
import BenchmarkLeaderboard from './components/BenchmarkLeaderboard';
import PersonalFeedbackForm from './components/PersonalFeedbackForm';
import SelfHostGuideModal from './components/SelfHostGuideModal';
import AnonymousTrackingModal from './components/AnonymousTrackingModal';
import { Button } from './components/ui';
import { Shield, Server, LogOut, ArrowLeft, Key } from 'lucide-react';

export default function App() {
  const { user, login, logout, lang, setLang } = useAuthStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'benchmark'>('dashboard');
  const [showSelfHost, setShowSelfHost] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get('sessionId'));
  }, []);

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-800 font-sans flex flex-col">
      {/* Top Bar adhering to Top Bar Contract */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 md:px-8 flex items-center justify-between gap-6 sticky top-0 z-30 shadow-xs">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 bg-violet-700 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4 fill-white/20" />
            </div>
            <span>Boss<span className="text-violet-700">femm</span></span>
          </a>
        </div>

        {/* Zone 2: Navigation single-line links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'text-violet-700 border-b-2 border-violet-700 pb-0.5' : 'hover:text-slate-900'}`}
          >
            {user.role === 'employer' ? t.nav.leadershipTriage : user.role === 'admin' ? t.nav.admin : t.nav.voiceVault}
          </button>
          
          <button 
            onClick={() => setShowTrackingModal(true)}
            className="hover:text-violet-700 whitespace-nowrap transition-colors flex items-center gap-1 text-violet-700 font-extrabold"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{t.nav.trackToken}</span>
          </button>

          <button 
            onClick={() => setActiveTab('benchmark')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'benchmark' ? 'text-violet-700 border-b-2 border-violet-700 pb-0.5' : 'hover:text-slate-900'}`}
          >
            {t.nav.benchmark}
          </button>

          <button 
            onClick={() => setShowSelfHost(true)}
            className="hover:text-slate-900 whitespace-nowrap transition-colors flex items-center gap-1 text-slate-500 font-semibold"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.nav.docker}</span>
          </button>
        </nav>
        
        {/* Zone 3: User Action, Language Switcher & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher Pill */}
          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-md transition-all ${lang === 'en' ? 'bg-white text-violet-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLang('az')}
              className={`px-2 py-0.5 rounded-md transition-all ${lang === 'az' ? 'bg-white text-violet-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Azərbaycan dili"
            >
              AZ
            </button>
          </div>

          {/* Quick role preview switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => login('employee')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${user.role === 'employee' ? 'bg-white text-violet-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t.nav.employee}
            </button>
            <button 
              onClick={() => login('employer')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${user.role === 'employer' ? 'bg-white text-violet-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t.nav.employer}
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-extrabold text-violet-700 uppercase tracking-wider">{user.role}</p>
            <p className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{user.name}</p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (sessionId) window.location.href = '/';
              logout();
            }}
            className="h-8 text-xs border-slate-200 gap-1 text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.nav.signOut}</span>
          </Button>
        </div>
      </header>
      
      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        {sessionId ? (
          <PersonalFeedbackForm sessionId={sessionId} />
        ) : activeTab === 'benchmark' ? (
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveTab('dashboard')} 
              className="text-xs text-slate-600 gap-1.5 mb-2 hover:bg-slate-100 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t.common.back}
            </Button>
            <BenchmarkLeaderboard />
          </div>
        ) : (
          <>
            {user.role === 'employee' && <EmployeeDashboard />}
            {user.role === 'employer' && <EmployerDashboard />}
            {user.role === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>
      
      {/* Quiet Footer */}
      <footer className="bg-white px-8 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-700" />
          <span className="font-semibold text-slate-700">Bossfemm</span>
          <span>·</span>
          <span>{t.common.tagline}</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Zero-Knowledge Cryptography • Autonomous AI Alert Triage & Resolution Hub
        </p>
      </footer>

      {showSelfHost && <SelfHostGuideModal onClose={() => setShowSelfHost(false)} />}
      {showTrackingModal && (
        <AnonymousTrackingModal 
          onClose={() => setShowTrackingModal(false)}
        />
      )}
    </div>
  );
}
