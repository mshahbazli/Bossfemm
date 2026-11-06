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
import { Shield, Server, LogOut, ArrowLeft, Key, Menu, X, Lock, Cpu, Trophy } from 'lucide-react';

export default function App() {
  const { user, login, logout, lang, setLang } = useAuthStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'benchmark'>('dashboard');
  const [showSelfHost, setShowSelfHost] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get('sessionId'));
  }, []);

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-800 font-sans flex flex-col overflow-x-hidden">
      {/* Top Bar adhering to Top Bar Contract */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/" className="flex items-center gap-2 text-base sm:text-lg font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-700 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white/20" />
              </div>
              <span>Boss<span className="text-violet-700">femm</span></span>
            </a>
          </div>

          {/* Zone 2: Navigation clean workspace links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'text-violet-700 border-b-2 border-violet-700 pb-0.5' : 'hover:text-slate-900'}`}
            >
              {user.role === 'employer' ? t.nav.leadershipTriage : user.role === 'admin' ? t.nav.admin : t.nav.voiceVault}
            </button>

            <button 
              onClick={() => setActiveTab('benchmark')}
              className={`whitespace-nowrap transition-colors ${activeTab === 'benchmark' ? 'text-violet-700 border-b-2 border-violet-700 pb-0.5' : 'hover:text-slate-900'}`}
            >
              {t.nav.benchmark}
            </button>
          </nav>
          
          {/* Zone 3: User Action, Language Switcher, Profile & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

            {/* Quick role preview switcher (desktop/tablet) */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
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

            {(() => {
              const displayedUserName = lang === 'en'
                ? (user.name_en || (user.role === 'employer' ? 'Chief People Officer (Tech Solutions)' : user.role === 'admin' ? 'System Administrator' : user.name || 'Sarah Jenkins'))
                : (user.name_az || (user.role === 'employer' ? 'HR Rəhbəri (Tech Solutions)' : user.role === 'admin' ? 'Sistem Administratoru' : user.name || 'Mübariz Şahbazlı'));
              return (
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-extrabold text-violet-700 uppercase tracking-wider">{user.role}</p>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{displayedUserName}</p>
                </div>
              );
            })()}

            {/* Sign Out Button (desktop/tablet) */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (sessionId) window.location.href = '/';
                logout();
              }}
              className="hidden sm:inline-flex h-8 text-xs border-slate-200 gap-1 text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.nav.signOut}</span>
            </Button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors md:hidden shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / SaaS Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-lg shadow-xl px-5 py-4 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto animate-fadeIn">
            {/* Authenticated User Mini Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-700 text-white flex items-center justify-center font-bold text-xs">
                  {user.name?.[0] || 'U'}
                </div>
                <div className="truncate max-w-[160px]">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {lang === 'en'
                      ? (user.name_en || (user.role === 'employer' ? 'Chief People Officer (Tech Solutions)' : user.role === 'admin' ? 'System Administrator' : user.name || 'Sarah Jenkins'))
                      : (user.name_az || (user.role === 'employer' ? 'HR Rəhbəri (Tech Solutions)' : user.role === 'admin' ? 'Sistem Administratoru' : user.name || 'Mübariz Şahbazlı'))}
                  </p>
                  <p className="text-[10px] font-mono text-violet-700 font-bold uppercase">{user.role}</p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (sessionId) window.location.href = '/';
                  logout();
                }}
                className="h-7 text-[11px] text-red-600 border-red-200 hover:bg-red-50 gap-1 px-2.5"
              >
                <LogOut className="w-3 h-3" />
                <span>{t.nav.signOut}</span>
              </Button>
            </div>

            {/* Navigation tabs */}
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors w-full text-left ${
                  activeTab === 'dashboard' 
                    ? 'bg-violet-50 text-violet-700 border border-violet-200' 
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  {user.role === 'employer' ? <Cpu className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <span>
                  {user.role === 'employer' ? t.nav.leadershipTriage : user.role === 'admin' ? t.nav.admin : t.nav.voiceVault}
                </span>
              </button>

              <button 
                onClick={() => {
                  setActiveTab('benchmark');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors w-full text-left ${
                  activeTab === 'benchmark' 
                    ? 'bg-violet-50 text-violet-700 border border-violet-200' 
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <span>{t.nav.benchmark}</span>
              </button>
            </div>

            {/* Quick Role Switcher in mobile drawer */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                {t.nav.signInAs}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    login('employee');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-colors flex items-center justify-center gap-1.5 ${
                    user.role === 'employee' 
                      ? 'bg-violet-700 text-white border-violet-700 shadow-2xs' 
                      : 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.nav.employee}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    login('employer');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-colors flex items-center justify-center gap-1.5 ${
                    user.role === 'employer' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{t.nav.employer}</span>
                </button>
              </div>
            </div>
          </div>
        )}
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
