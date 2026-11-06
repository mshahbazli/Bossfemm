import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { 
  Shield, 
  Lock, 
  Key, 
  Building2, 
  UserCheck, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Eye, 
  EyeOff, 
  Cpu, 
  AlertCircle 
} from 'lucide-react';
import { Button } from './ui';

interface CompanyInviteAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'invite' | 'token' | 'guest' | 'leadership';
}

const COMPANIES = [
  { id: 'c1', name: 'Tech Solutions LLC', industry: 'Technology & IT' },
  { id: 'c2', name: 'Global Finance Bank', industry: 'Finance & Banking' },
  { id: 'c3', name: 'Aura Logistics & Retail', industry: 'Logistics & Retail' },
  { id: 'c4', name: 'Nexis Media Group', industry: 'Media & Creative' }
];

const DEPARTMENTS = [
  { id: 'eng', name_az: 'Mühəndislik və Texnologiya (IT)', name_en: 'Engineering & Technology (IT)' },
  { id: 'prod', name_az: 'Məhsul İdarəetməsi və Dizayn', name_en: 'Product Management & Design' },
  { id: 'fin', name_az: 'Maliyyə və Mühasibatlıq', name_en: 'Finance & Accounting' },
  { id: 'hr', name_az: 'İnsan Resursları (People Ops)', name_en: 'People Operations & HR' },
  { id: 'ops', name_az: 'Əməliyyatlar və Logistika', name_en: 'Operations & Logistics' },
  { id: 'mkt', name_az: 'Marketinq və Kommunikasiya', name_en: 'Marketing & Communications' },
  { id: 'leg', name_az: 'Hüquq və Komplayens', name_en: 'Legal & Corporate Compliance' }
];

// Helper to compute client-side SHA-256 hash for Zero-Knowledge authentication
async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function CompanyInviteAuthModal({ isOpen, onClose, initialTab = 'invite' }: CompanyInviteAuthModalProps) {
  const { lang, loginWithToken, registerWithInvite, loginAsGuest, login } = useAuthStore();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'invite' | 'token' | 'guest' | 'leadership'>(initialTab);

  // Invite tab state
  const [selectedCompanyId, setSelectedCompanyId] = useState('c1');
  const [selectedDept, setSelectedDept] = useState('Engineering & Technology (IT)');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ token: string; company: string; dept: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Token login tab state
  const [tokenInput, setTokenInput] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [showLoginPasscode, setShowLoginPasscode] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle registration through company invite
  const handleRegisterInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!passcode || passcode.length < 6) {
      setInviteError(lang === 'az' ? 'Şifrə ən azı 6 simvoldan ibarət olmalıdır' : 'Passcode must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const hashed = await hashPasscode(passcode);
      const res = await registerWithInvite(selectedCompanyId, selectedDept, hashed);
      
      if (res.success && res.accessToken) {
        const comp = COMPANIES.find(c => c.id === selectedCompanyId)?.name || 'Company';
        setGeneratedCredentials({
          token: res.accessToken,
          company: comp,
          dept: selectedDept
        });
      } else {
        setInviteError(res.error || 'Qeydiyyat zamanı xəta baş verdi');
      }
    } catch (err: any) {
      setInviteError(err?.message || 'Şifrələmə xətası baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Handle login with existing token and passcode
  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    if (!tokenInput.trim() || !loginPasscode.trim()) {
      setTokenError(lang === 'az' ? 'Token və şifrə mütləq daxil edilməlidir' : 'Both Token and Passcode are required');
      return;
    }

    try {
      setLoading(true);
      const hashed = await hashPasscode(loginPasscode);
      const res = await loginWithToken(tokenInput.trim().toUpperCase(), hashed);
      
      if (res.success) {
        onClose();
      } else {
        setTokenError(res.error || (lang === 'az' ? 'Giriş uğursuz oldu. Token və ya şifrə yanlışdır.' : 'Login failed. Invalid token or passcode.'));
      }
    } catch (err: any) {
      setTokenError(err?.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Handle continuing as guest
  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await loginAsGuest(selectedCompanyId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo token
  const handleFillDemoToken = () => {
    setTokenInput('BF-USR-79X2-ZK');
    setLoginPasscode('secret123');
    setTokenError(null);
  };

  const handleCopyCredentials = () => {
    if (generatedCredentials?.token) {
      navigator.clipboard.writeText(generatedCredentials.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {lang === 'en' ? 'Bossfemm Zero-Knowledge Access Portal' : 'Bossfemm Şifrəli Giriş və Dəvət Portalı'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'en' ? 'Zero trace · Client-side encrypted · 100% anonymous' : 'İzsiz · Brauzerdə şifrələnən · Tamamilə anonim'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 p-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
          <button
            onClick={() => { setActiveTab('invite'); setInviteError(null); }}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'invite' 
                ? 'bg-white text-violet-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'en' ? 'Company Invite' : 'Şirkət Dəvəti'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('token'); setTokenError(null); }}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'token' 
                ? 'bg-white text-violet-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'en' ? 'Token Login' : 'Tokenlə Giriş'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guest')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'guest' 
                ? 'bg-white text-violet-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'en' ? 'Guest Access' : 'Qonaq Girişi'}</span>
          </button>

          <button
            onClick={() => setActiveTab('leadership')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'leadership' 
                ? 'bg-white text-violet-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'en' ? 'Leadership' : 'Rəhbərlik'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: Company Invite Flow */}
          {activeTab === 'invite' && (
            <div className="space-y-5">
              {!generatedCredentials ? (
                <form onSubmit={handleRegisterInvite} className="space-y-4">
                  <div className="p-3.5 bg-violet-50/70 border border-violet-200 rounded-2xl text-xs text-violet-950 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-700" />
                      {lang === 'en' ? 'Initial Company Invite Verification' : 'İlkin Şirkət Dəvəti Təsdiqi'}
                    </span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {lang === 'en' 
                        ? 'Select your employer and department to generate your permanent Anonymous Access Token. Your master passcode is encrypted client-side; no one can access your account.'
                        : 'Şirkətinizi və strukturunuzu seçərək fərdi Anonim Giriş Tokeni əldə edin. Şifrəniz brauzerdə şifrələnir və sistem daxil heç kim tərəfindən oxuna bilmir.'}
                    </p>
                  </div>

                  {inviteError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{inviteError}</span>
                    </div>
                  )}

                  {/* Step 1: Select Company */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {lang === 'en' ? '1. Select Your Company (Invite Destination)' : '1. Şirkəti Seçin (Dəvət Olunduğunuz Qurum)'}
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={e => setSelectedCompanyId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                    >
                      {COMPANIES.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} · ({c.industry})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Select Department */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {lang === 'en' ? '2. Select Your Internal Structure / Department' : '2. Şirkət Daxili Struktur və Şöbəni Seçin'}
                    </label>
                    <select
                      value={selectedDept}
                      onChange={e => setSelectedDept(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.id} value={lang === 'az' ? d.name_az : d.name_en}>
                          {lang === 'az' ? d.name_az : d.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 3: Set Client-Side Encrypted Passcode */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        {lang === 'en' ? '3. Create Your Private Master Passcode' : '3. Şəxsi Giriş Şifrənizi Təyin Edin'}
                      </label>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Zero-Knowledge SHA-256
                      </span>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPasscode ? 'text' : 'password'}
                        value={passcode}
                        onChange={e => setPasscode(e.target.value)}
                        placeholder={lang === 'en' ? 'Enter a strong passcode (min. 6 chars)' : 'Güclü şifrə daxil edin (min. 6 simvol)'}
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'en' 
                        ? 'This password is never sent in plaintext. It encrypts your personal access credentials locally.' 
                        : 'Bu şifrə heç vaxt açıq şəkildə serverə getmir, yalnız sizin brauzerinizdə kodlanır.'}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !passcode.trim()}
                    className="w-full bg-violet-700 hover:bg-violet-800 text-white font-bold py-2.5 text-xs rounded-xl shadow-sm gap-2"
                  >
                    <span>{loading ? t.common.loading : (lang === 'en' ? 'Generate Anonymous Access Token' : 'Anonim Giriş Tokeni Yarat')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                /* Success Credential Card */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>{lang === 'en' ? 'Anonymous Token Generated Successfully!' : 'Anonim Tokeniniz Uğurla Yaradıldı!'}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{lang === 'en' ? 'Your Access Token:' : 'Sizin Giriş Tokeniniz:'}</span>
                        <button
                          onClick={handleCopyCredentials}
                          className="text-violet-700 font-bold flex items-center gap-1 hover:underline text-[11px]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedToken ? (lang === 'en' ? 'Copied!' : 'Kopyalandı!') : (lang === 'en' ? 'Copy' : 'Kopyala')}</span>
                        </button>
                      </div>
                      <p className="text-base font-black text-slate-900 tracking-wider">
                        {generatedCredentials.token}
                      </p>
                      <div className="text-[11px] text-slate-600 font-sans pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>{generatedCredentials.company}</span>
                        <span className="text-violet-700 font-bold">{generatedCredentials.dept}</span>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-900 font-medium">
                      {lang === 'en'
                        ? 'Save this token and your password. You will use them to sign in anytime without email, phone, or corporate traces.'
                        : 'Bu tokeni və şifrənizi yadda saxlayın. Növbəti dəfə heç bir email və iz olmadan yalnız bu tokenlə daxil olacaqsınız.'}
                    </p>
                  </div>

                  <Button 
                    onClick={onClose}
                    className="w-full bg-violet-700 hover:bg-violet-800 text-white font-bold py-2.5 text-xs rounded-xl shadow-sm gap-2"
                  >
                    <span>{lang === 'en' ? 'Enter Anonymous Voice Vault Now' : 'Anonim Səs Vaultuna Daxil Ol'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Token & Passcode Login */}
          {activeTab === 'token' && (
            <form onSubmit={handleTokenLogin} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <p className="font-medium">
                  {lang === 'en'
                    ? 'Enter with your permanent Anonymous Token and private Master Passcode.'
                    : 'Şirkət dəvəti ilə aldığınız Anonim Token və şəxsi şifrənizlə təhlükəsiz daxil olun.'}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-slate-400 font-medium">{lang === 'en' ? 'Quick demo token:' : 'Nümunə demo token:'}</span>
                  <button
                    type="button"
                    onClick={handleFillDemoToken}
                    className="font-mono text-[11px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2 py-0.5 rounded border border-violet-200 transition-colors"
                  >
                    BF-USR-79X2-ZK (Sarah Jenkins)
                  </button>
                </div>
              </div>

              {tokenError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tokenError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {lang === 'en' ? 'Anonymous Access Token' : 'Anonim Giriş Tokeni'}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value.toUpperCase())}
                    placeholder="BF-USR-XXXX-ZK"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-wide text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {lang === 'en' ? 'Private Master Passcode' : 'Şəxsi Şifrə'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type={showLoginPasscode ? 'text' : 'password'}
                    value={loginPasscode}
                    onChange={e => setLoginPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPasscode(!showLoginPasscode)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showLoginPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !tokenInput.trim() || !loginPasscode.trim()}
                className="w-full bg-violet-700 hover:bg-violet-800 text-white font-bold py-2.5 text-xs rounded-xl shadow-sm gap-2"
              >
                <span>{loading ? t.common.loading : (lang === 'en' ? 'Verify & Enter Vault' : 'Təsdiqlə və Vaulta Daxil Ol')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* TAB 3: Guest Whistleblower Access */}
          {activeTab === 'guest' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  {lang === 'en' ? 'Guest & External Whistleblower Mode' : 'Qonaq və Müstəqil Şikayətçi Rejimi'}
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {lang === 'en'
                    ? 'No corporate invitation or password needed. You can submit encrypted feedback or reports directly to any benchmarked enterprise and receive a one-time Secret Receipt Key to track resolution and reply anonymously.'
                    : 'Şirkət dəvətinə və ya şifrəyə ehtiyac yoxdur. İstənilən şirkətə birbaşa şifrələnmiş şikayət və rəy bildirə, birdəfəlik Gizli Qəbz Açarı vasitəsilə həll mərhələsini izləyə bilərsiniz.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {lang === 'en' ? 'Select Target Company to Whistleblow / Review' : 'Rəy / Şikayət Bildirəcəyiniz Şirkəti Seçin'}
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={e => setSelectedCompanyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  {COMPANIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} · ({c.industry})
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs rounded-xl shadow-sm gap-2"
              >
                <span>{lang === 'en' ? 'Enter as Guest Whistleblower' : 'Qonaq Əməkdaş kimi Davam Et'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* TAB 4: Corporate Leadership & Governance Preview */}
          {activeTab === 'leadership' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1 font-medium">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-violet-700" />
                  {lang === 'en' ? 'Enterprise Leadership & Audit Console' : 'Korporativ Rəhbərlik və Audit Paneli'}
                </span>
                <p>
                  {lang === 'en'
                    ? 'Preview the AI-powered alert triage hub, risk grading (Critical/High), SLA resolution lifecycles, and cryptographic governance.'
                    : 'AI dəstəkli risk eskalasiyası, təcili 24h SLA idarəetməsi, anonim dialoq və bərabərlik hesabatlarını nəzərdən keçirin.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={() => { login('employer'); onClose(); }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-xs rounded-xl shadow-sm flex flex-col items-center justify-center gap-1 h-auto"
                >
                  <Cpu className="w-4 h-4 text-violet-400" />
                  <span>{lang === 'en' ? 'Chief People Officer / HR Lead' : 'HR Rəhbəri (Tech Solutions)'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">AI Alert Triage & Resolution</span>
                </Button>

                <Button 
                  onClick={() => { login('admin'); onClose(); }}
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-100 text-slate-800 font-bold py-3 text-xs rounded-xl shadow-sm flex flex-col items-center justify-center gap-1 h-auto"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'en' ? 'Platform Administrator' : 'Sistem Administratoru'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sovereign Audit & Telemetry</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
