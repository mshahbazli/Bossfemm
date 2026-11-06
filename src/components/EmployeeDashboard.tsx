import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { Button, Card, CardContent, CardHeader, CardTitle } from './ui';
import { 
  MessageSquare, 
  ShieldCheck, 
  Shield,
  CheckCircle2, 
  Lock, 
  Clock, 
  Building2,
  Key,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import FeedbackSessionManager from './FeedbackSessionManager';
import AnonymousTrackingModal from './AnonymousTrackingModal';

export default function EmployeeDashboard() {
  const { user, verifySimulate, lang } = useAuthStore();
  const t = translations[lang];

  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [trackingModalToken, setTrackingModalToken] = useState<string | null>(null);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/reviews/me/${user.id}`)
        .then(r => r.json())
        .then(setMyReviews);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.companyId) {
      fetch(`/api/femps/company/${user.companyId}`)
        .then(r => r.json())
        .then(setCompanyInfo)
        .catch(err => console.error(err));
    }
  }, [user?.companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: review.trim(),
          companyId: user?.companyId || 'c1',
          lang
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setIssuedToken(data.trackingToken);
        setReview('');
        // Also refresh user's review list if user is logged in
        if (user?.id) {
          fetch(`/api/reviews/me/${user.id}`)
            .then(r => r.json())
            .then(setMyReviews);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyIssuedToken = () => {
    if (issuedToken) {
      navigator.clipboard.writeText(issuedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const topicPresets = [
    t.topics.equalPay,
    t.topics.maternity,
    t.topics.career,
    t.topics.safety,
    t.topics.bias
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Profile / Anonymity Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {lang === 'en'
                  ? (user?.name_en || (user?.role === 'employee' ? 'Sarah Jenkins' : user?.name || 'Sarah Jenkins'))
                  : (user?.name_az || (user?.role === 'employee' ? 'Mübariz Şahbazlı' : user?.name || 'Mübariz Şahbazlı'))}
              </h1>
              {user?.verified && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.employee.accountVerified}</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Zero-Knowledge Identity Protection</span>
              {user?.accessToken && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 text-[11px]">
                    Token: {user.accessToken}
                  </span>
                </>
              )}
              {user?.isGuest && (
                <span className="font-mono text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                  {lang === 'en' ? 'Guest Mode' : 'Qonaq Rejimi'}
                </span>
              )}
            </div>
            {user?.department && (
              <p className="text-xs text-slate-600 mt-1 font-medium">
                <span className="text-slate-500">{lang === 'en' ? 'Department / Structure:' : 'Struktur / Şöbə:'}</span>{' '}
                <span className="text-violet-700 font-bold">{user.department}</span>
              </p>
            )}
            {companyInfo && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{companyInfo.name}</span>
                <span className="text-slate-300">·</span>
                <span className="text-violet-700 font-bold font-mono">
                  FemPS Score: {companyInfo.fempsScore}/100
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setTrackingModalToken('BF-79X-ZK9A')}
            className="text-xs font-bold text-violet-700 border-violet-200 hover:bg-violet-50 gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{t.common.trackResolution}</span>
          </Button>

          {!user?.verified && (
            <Button size="sm" onClick={verifySimulate} className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold">
              {t.employee.verifyBtn}
            </Button>
          )}
        </div>
      </div>

      {/* Main Form: Anonymous Women's Voice Vault */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  {t.employee.formTitle}
                </CardTitle>
                <p className="text-xs text-slate-500 font-medium">
                  {t.employee.formSubtitle}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              AES-256 GCM Active
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {/* Quick topic helper chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{t.employee.topicsLabel}</span>
            {topicPresets.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => setReview(prev => prev ? `${prev} [${topic}]: ` : `[${topic}]: `)}
                className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                + {topic}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea 
              rows={5}
              placeholder={t.employee.placeholder}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-600 focus:outline-none font-medium text-sm leading-relaxed"
              value={review}
              onChange={e => setReview(e.target.value)}
            />

            {/* Cryptographic Privacy Notice */}
            <div className="p-3.5 bg-violet-50/70 border border-violet-100 rounded-xl flex items-start gap-3">
              <Shield className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-violet-900 font-bold">{t.employee.cryptoNoticeTitle} </strong>
                {t.employee.cryptoNoticeDesc}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button 
                type="submit" 
                disabled={submitting || !review.trim()} 
                className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-6 rounded-xl shadow-sm gap-2 text-xs"
              >
                <span>{submitting ? t.common.saving : t.employee.submitBtn}</span>
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>

            {/* Token Issuance Alert on Submission */}
            {issuedToken && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900 to-indigo-900 text-white space-y-3 shadow-md animate-fadeIn">
                <div className="flex items-center gap-2 text-violet-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t.employee.tokenGeneratedTitle}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                  <span className="text-2xl font-mono font-black tracking-widest text-white">
                    {issuedToken}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      onClick={handleCopyIssuedToken}
                      className="bg-white text-violet-900 hover:bg-slate-100 text-xs font-bold gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? t.common.copied : t.employee.copyTokenBtn}</span>
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setTrackingModalToken(issuedToken)}
                      className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{t.employee.trackNowBtn}</span>
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] text-violet-200/90 leading-relaxed font-medium">
                  {t.employee.tokenGeneratedDesc}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Tracked Submissions & Problem Resolution Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {t.employee.myConcernsTitle}
          </h2>
          <span className="text-xs text-slate-400 font-medium">{t.employee.myConcernsSubtitle}</span>
        </div>

        <div className="space-y-3">
          {myReviews.map(r => (
            <div key={r.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-violet-700">
                    {(lang === 'en' && r.category_en) ? r.category_en : r.category}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">{r.date}</span>
                  {r.trackingToken && (
                    <button 
                      onClick={() => setTrackingModalToken(r.trackingToken)}
                      className="font-mono text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded hover:bg-violet-100 flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      <span>{r.trackingToken}</span>
                    </button>
                  )}
                </div>

                <div>
                  {r.resolved ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.employee.statusResolved}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t.employee.statusPending}</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                "{(lang === 'en' && r.text_en) ? r.text_en : r.text}"
              </p>

              {r.resolved && (r.resolutionNote || r.resolutionNote_en) && (
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <strong className="text-slate-800 font-semibold">{t.employee.actionTaken} </strong>
                  {(lang === 'en' && r.resolutionNote_en) ? r.resolutionNote_en : r.resolutionNote}
                </div>
              )}
            </div>
          ))}

          {myReviews.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-slate-200">
              {t.employee.noConcerns}
            </div>
          )}
        </div>
      </div>

      {/* "Mənə Bildir" Fərdi Seans İdarəedicisi (Active peer feedback sessions) */}
      <FeedbackSessionManager />

      {/* Anonymous Tracking Modal */}
      {trackingModalToken && (
        <AnonymousTrackingModal 
          initialToken={trackingModalToken}
          onClose={() => setTrackingModalToken(null)}
        />
      )}
    </div>
  );
}
