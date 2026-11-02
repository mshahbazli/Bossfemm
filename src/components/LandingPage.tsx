import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { Button } from './ui';
import { 
  Shield, 
  Lock, 
  Trophy, 
  Sparkles, 
  Server, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Key,
  MessageSquare,
  Activity,
  Cpu,
  FileCheck2
} from 'lucide-react';
import BenchmarkLeaderboard from './BenchmarkLeaderboard';
import SelfHostGuideModal from './SelfHostGuideModal';
import AnonymousTrackingModal from './AnonymousTrackingModal';

export default function LandingPage() {
  const { login, lang, setLang } = useAuthStore();
  const [showSelfHost, setShowSelfHost] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [initialTrackToken, setInitialTrackToken] = useState('');

  const t = translations[lang];

  const handleOpenTracker = (token: string = '') => {
    setInitialTrackToken(token);
    setShowTrackingModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-800 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      {/* Top Bar following Top Bar Contract: Brand wordmark - Links - Language - Primary Action */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 md:px-8 flex items-center justify-between gap-6 shadow-xs">
        {/* Zone 1: Single text wordmark */}
        <a href="/" className="flex items-center gap-2.5 text-lg font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-violet-700 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4 fill-white/20" />
          </div>
          <span>Boss<span className="text-violet-700">femm</span></span>
        </a>

        {/* Zone 2: Concise single-line links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <a href="#vault" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            {t.nav.voiceVault}
          </a>
          <button 
            onClick={() => handleOpenTracker()}
            className="hover:text-violet-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-violet-700 font-extrabold"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{t.nav.trackToken}</span>
          </button>
          <a href="#triage" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            {t.nav.leadershipTriage}
          </a>
          <a href="#security" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            {t.landing.securityTitle}
          </a>
          <a href="#benchmark" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            {t.nav.benchmark}
          </a>
          <button 
            onClick={() => setShowSelfHost(true)} 
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-slate-500 font-semibold"
          >
            <Server className="w-3 h-3 text-emerald-600" />
            <span>{t.nav.docker}</span>
          </button>
        </nav>

        {/* Zone 3: Language Toggle Pill & Primary Action */}
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

          <Button 
            onClick={() => login('employee')} 
            className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 text-xs rounded-xl shadow-sm whitespace-nowrap shrink-0"
          >
            {t.common.reportIssue}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>{t.landing.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
            {t.landing.heroTitlePrefix}
            <span className="text-violet-700">{t.landing.heroTitleHighlight}</span>
            {t.landing.heroTitleSuffix}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            {t.landing.heroSubtitle}
          </p>

          {/* Quick Demo Token Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <span>{t.tracking.tryDemoTokens}</span>
            {['BF-79X-ZK9A', 'BF-34K-PAY2', 'BF-91M-SAFE'].map(token => (
              <button
                key={token}
                onClick={() => handleOpenTracker(token)}
                className="font-mono font-bold text-[11px] text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Key className="w-3 h-3 text-violet-600" />
                <span>{token}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dual-Role Hero Access Cards */}
        <div id="vault" className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: For Employees (Anonymous Voice Vault) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-white to-violet-50/40 border-2 border-violet-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-violet-400 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lock className="w-24 h-24 text-violet-800" />
            </div>

            <div className="space-y-4 relative z-10">
              <span className="text-xs font-black uppercase tracking-wider text-violet-700 block">
                {t.landing.dualRoleEmployeeTitle}
              </span>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                {t.landing.dualRoleEmployeeHeading}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {t.landing.dualRoleEmployeeDesc}
              </p>

              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Client-side Web Crypto AES-256 (Zero trace)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unforgeable Secret Receipt Key (No login needed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2-way anonymous dialogue channel with leadership</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-violet-100 flex flex-wrap items-center gap-3 relative z-10">
              <Button 
                onClick={() => login('employee')} 
                className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm gap-2"
              >
                <span>{t.landing.dualRoleEmployeeAction}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleOpenTracker()} 
                className="border-slate-300 hover:border-violet-300 text-slate-700 hover:text-violet-700 font-bold px-4 py-2.5 rounded-xl text-xs gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{t.landing.dualRoleEmployeeTrack}</span>
              </Button>
            </div>
          </div>

          {/* Card 2: For Corporate Leadership (AI Alert Triage & Resolution Hub) */}
          <div id="triage" className="p-8 rounded-3xl bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-24 h-24 text-slate-800" />
            </div>

            <div className="space-y-4 relative z-10">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                {t.landing.dualRoleEmployerTitle}
              </span>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                {t.landing.dualRoleEmployerHeading}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {t.landing.dualRoleEmployerDesc}
              </p>

              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Risk Escalation: Critical (24h SLA) / High (72h SLA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>De-identified executive action briefings & root cause</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Timely resolution directly improves corporate FemPS score</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3 relative z-10">
              <Button 
                onClick={() => login('employer')} 
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm gap-2"
              >
                <span>{t.landing.dualRoleEmployerAction}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Cryptographic Architecture & Zero-Knowledge Workflow */}
      <section id="security" className="py-20 px-6 md:px-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto w-full space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
              {t.landing.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.landing.securityTitle}
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              {t.landing.securitySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{t.landing.step1Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {t.landing.step1Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-violet-700 font-bold">
                Client-Side Encryption
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{t.landing.step2Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {t.landing.step2Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-blue-700 font-bold">
                Zero IP Logging
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{t.landing.step3Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {t.landing.step3Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-amber-700 font-bold">
                AI Agent Risk Grading
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{t.landing.step4Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {t.landing.step4Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-emerald-700 font-bold">
                2-Way Secret Token
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Secondary Outcome Benchmark: The FemPS Index */}
      <section id="benchmark" className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.benchmark.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.landing.fempsRepositionTitle}
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {t.landing.fempsRepositionSubtitle}
            </p>

            {/* 4 Outcome Weights */}
            <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-slate-700">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                {t.landing.fempsPillar1}
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                {t.landing.fempsPillar2}
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                {t.landing.fempsPillar3}
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-emerald-700">
                {t.landing.fempsPillar4}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <BenchmarkLeaderboard />
          </div>
        </div>
      </section>

      {/* Section 3: Open Source & Self-Hosted Docker Callout */}
      <section id="self-hosted" className="py-16 px-6 md:px-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Server className="w-3.5 h-3.5" />
              <span>{t.landing.dockerBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.landing.dockerTitle}
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {t.landing.dockerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button 
              size="lg"
              onClick={() => setShowSelfHost(true)} 
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-xl gap-2 shadow-sm text-xs"
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>{t.landing.dockerBtn}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 px-6 md:px-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-violet-700 flex items-center justify-center text-white">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-800">Bossfemm</span>
            <span className="text-slate-300">·</span>
            <span>{t.common.tagline}</span>
          </div>

          <p className="text-slate-400 font-medium">
            Open-Source Equality & Anonymous Resolution Standard. All rights reserved.
          </p>
        </div>
      </footer>

      {showSelfHost && <SelfHostGuideModal onClose={() => setShowSelfHost(false)} />}
      {showTrackingModal && (
        <AnonymousTrackingModal 
          initialToken={initialTrackToken}
          onClose={() => setShowTrackingModal(false)} 
        />
      )}
    </div>
  );
}
