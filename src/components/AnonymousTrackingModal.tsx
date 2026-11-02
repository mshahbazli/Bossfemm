import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { Button } from './ui';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  Copy, 
  Sparkles, 
  Building2, 
  X,
  Search,
  MessageSquare
} from 'lucide-react';

interface AnonymousTrackingModalProps {
  initialToken?: string;
  onClose: () => void;
}

export default function AnonymousTrackingModal({ initialToken = '', onClose }: AnonymousTrackingModalProps) {
  const { lang } = useAuthStore();
  const t = translations[lang];

  const [tokenInput, setTokenInput] = useState(initialToken);
  const [ticketData, setTicketData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [copied, setCopied] = useState(false);

  const demoTokens = ['BF-79X-ZK9A', 'BF-34K-PAY2', 'BF-91M-SAFE'];

  const fetchTicket = async (tokenToFetch: string) => {
    if (!tokenToFetch.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/reviews/track/${encodeURIComponent(tokenToFetch.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setTicketData(data);
      } else {
        setTicketData(null);
        setErrorMsg(t.tracking.notFound);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(t.tracking.notFound);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      fetchTicket(initialToken);
    }
  }, [initialToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTicket(tokenInput);
  };

  const handleCopyToken = () => {
    if (ticketData?.trackingToken) {
      navigator.clipboard.writeText(ticketData.trackingToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticketData?.trackingToken) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/reviews/track/${encodeURIComponent(ticketData.trackingToken)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setTicketData((prev: any) => ({ ...prev, dialogue: data.dialogue }));
        setReplyText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const statusOrder: Record<string, number> = {
      'encrypted_received': 1,
      'ai_triaged': 2,
      'leadership_review': 3,
      'action_plan_active': 4,
      'resolved': 5
    };
    const currentNum = statusOrder[currentStatus] || 2;
    if (currentNum > stepIndex) return 'completed';
    if (currentNum === stepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">{t.tracking.title}</h2>
              <p className="text-xs text-slate-400 font-medium">{t.tracking.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Token Search Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value.toUpperCase())}
                  placeholder={t.tracking.inputPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-wide text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !tokenInput.trim()}
                className="bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs px-5 rounded-xl shrink-0"
              >
                {loading ? t.common.loading : t.tracking.trackBtn}
              </Button>
            </div>

            {/* Quick Demo Token Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">{t.tracking.tryDemoTokens}</span>
              {demoTokens.map(tok => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => {
                    setTokenInput(tok);
                    fetchTicket(tok);
                  }}
                  className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-800 transition-colors"
                >
                  {tok}
                </button>
              ))}
            </div>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {ticketData && (
            <div className="space-y-6 animate-fadeIn">
              {/* Receipt Key Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-900 to-indigo-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-violet-200 font-bold block">
                    {t.tracking.reportReceipt}
                  </span>
                  <span className="text-xl font-mono font-black tracking-widest text-white">
                    {ticketData.trackingToken}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleCopyToken}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs gap-1.5 font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? t.common.copied : t.common.copy}</span>
                </Button>
              </div>

              {/* 5-Step Lifecycle Progression Stepper */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  {t.tracking.timelineTitle}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {[
                    { idx: 1, label: t.tracking.step1 },
                    { idx: 2, label: t.tracking.step2 },
                    { idx: 3, label: t.tracking.step3 },
                    { idx: 4, label: t.tracking.step4 },
                    { idx: 5, label: t.tracking.step5 }
                  ].map(step => {
                    const st = getStepStatus(step.idx, ticketData.status);
                    return (
                      <div 
                        key={step.idx}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          st === 'completed'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : st === 'current'
                            ? 'bg-violet-50 border-violet-400 text-violet-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {st === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : st === 'current' ? (
                            <Clock className="w-4 h-4 text-violet-600 animate-pulse" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono">
                              {step.idx}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-bold leading-tight block">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ticket Details & AI Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Company & Category */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{t.tracking.companyBadge}</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{ticketData.companyLogo}</span>
                      <span>{ticketData.companyName}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">{t.tracking.aiCategory}</span>
                    <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                      {ticketData.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">{t.tracking.aiUrgency}</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      ticketData.riskLevel === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : ticketData.riskLevel === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {ticketData.riskLevel} ({ticketData.riskScore}/100)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">{t.tracking.slaTimer}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {ticketData.slaHours}h target window
                    </span>
                  </div>
                </div>

                {/* Right Card: AI Executive Summary & Remediation */}
                <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                    <Sparkles className="w-3.5 h-3.5 text-violet-700" />
                    <span>{t.tracking.executiveSummary}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    "{ticketData.aiExecutiveSummary || ticketData.text}"
                  </p>

                  {ticketData.resolved && ticketData.resolutionNote && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                      <span className="text-[11px] font-bold text-emerald-900 block flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {t.tracking.remedialActionTaken}
                      </span>
                      <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                        {ticketData.resolutionNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Two-Way Anonymous Dialogue Box */}
              <div className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-violet-700" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{t.tracking.dialogueTitle}</h4>
                      <p className="text-[11px] text-slate-500">{t.tracking.dialogueDesc}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Zero-Knowledge Channel Active
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="p-4 space-y-3 max-h-60 overflow-y-auto bg-slate-50/50">
                  {ticketData.dialogue && ticketData.dialogue.length > 0 ? (
                    ticketData.dialogue.map((msg: any) => (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'employee' 
                            ? 'items-end' 
                            : msg.sender === 'system'
                            ? 'items-center'
                            : 'items-start'
                        }`}
                      >
                        {msg.sender === 'system' ? (
                          <div className="max-w-md text-center py-1.5 px-3 rounded-full bg-slate-200/80 text-[11px] font-medium text-slate-700">
                            {msg.text}
                          </div>
                        ) : (
                          <div 
                            className={`max-w-md p-3 rounded-xl text-xs font-medium space-y-1 ${
                              msg.sender === 'employee'
                                ? 'bg-violet-700 text-white rounded-br-none shadow-xs'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                              <span className="font-bold">
                                {msg.sender === 'employee' ? 'You (Anonymous)' : 'Corporate Leadership / HR'}
                              </span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No dialogue exchange initiated yet.
                    </p>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                  <input 
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={t.tracking.replyPlaceholder}
                    disabled={sendingReply}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-violet-600 font-medium"
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold gap-1 px-4 rounded-lg shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? t.common.saving : t.tracking.sendReplyBtn}</span>
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <Button 
            onClick={onClose} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            {t.common.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
