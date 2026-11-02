import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Shield,
  Send,
  MessageSquare,
  Lock,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Activity,
  Award
} from 'lucide-react';
import BadgeModal from './BadgeModal';

export default function EmployerDashboard() {
  const { user, lang } = useAuthStore();
  const t = translations[lang];

  const [triageData, setTriageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'resolved'>('all');

  // Resolution modal / action state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [activeDialogueId, setActiveDialogueId] = useState<string | null>(null);
  const [leadershipReplyText, setLeadershipReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Secondary tabs collapse state
  const [showSecondaryMetrics, setShowSecondaryMetrics] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Policy & Representation metrics
  const [policiesText, setPoliciesText] = useState('');
  const [workforceRatio, setWorkforceRatio] = useState<number>(46);
  const [leadershipRatio, setLeadershipRatio] = useState<number>(42);
  const [analyzingPolicy, setAnalyzingPolicy] = useState(false);
  const [metricsSaving, setMetricsSaving] = useState(false);
  const [metricsSaved, setMetricsSaved] = useState(false);

  const fetchTriageData = () => {
    const compId = user?.companyId || 'c1';
    setLoading(true);
    fetch(`/api/employer/triage-alerts?companyId=${compId}`)
      .then(r => r.json())
      .then(res => {
        setTriageData(res);
        if (res.company) {
          setPoliciesText(res.company.policiesText || '');
          setWorkforceRatio(res.company.femaleWorkforceRatio || 46);
          setLeadershipRatio(res.company.femaleLeadershipRatio || 42);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTriageData();
  }, [user?.companyId]);

  const handleUpdateStatus = async (alertId: string, newStatus: string, note?: string) => {
    try {
      const res = await fetch(`/api/employer/alerts/${alertId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          resolutionNote: note || '',
          companyId: user?.companyId || 'c1'
        })
      });
      if (res.ok) {
        setResolvingId(null);
        setResolutionNote('');
        fetchTriageData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendLeadershipReply = async (alertId: string) => {
    if (!leadershipReplyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/employer/alerts/${alertId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: leadershipReplyText.trim() })
      });
      if (res.ok) {
        setLeadershipReplyText('');
        fetchTriageData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingReply(false);
    }
  };

  const handleAnalyzePolicy = async () => {
    if (!policiesText.trim()) return;
    setAnalyzingPolicy(true);
    try {
      await fetch('/api/femps/analyze-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: user?.companyId || 'c1',
          policiesText,
          lang
        })
      });
      fetchTriageData();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingPolicy(false);
    }
  };

  const handleSaveMetrics = async () => {
    setMetricsSaving(true);
    try {
      await fetch('/api/femps/update-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: user?.companyId || 'c1',
          femaleWorkforceRatio: workforceRatio,
          femaleLeadershipRatio: leadershipRatio
        })
      });
      setMetricsSaved(true);
      setTimeout(() => setMetricsSaved(false), 3000);
      fetchTriageData();
    } catch (e) {
      console.error(e);
    } finally {
      setMetricsSaving(false);
    }
  };

  if (loading && !triageData) {
    return (
      <div className="flex items-center justify-center p-16 text-xs text-slate-500 font-bold">
        {t.common.loading}
      </div>
    );
  }

  const { company, alerts = [], stats = {}, fempsCalc } = triageData || {};

  const filteredAlerts = alerts.filter((a: any) => {
    if (filter === 'all') return true;
    if (filter === 'critical') return a.riskLevel === 'CRITICAL' && !a.resolved;
    if (filter === 'high') return a.riskLevel === 'HIGH' && !a.resolved;
    if (filter === 'medium') return (a.riskLevel === 'MEDIUM' || a.riskLevel === 'LOW') && !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-violet-400 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>{company?.name || 'Enterprise'} · AI Alert Triage Center</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t.triage.hubTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
            {t.triage.hubSubtitle}
          </p>
        </div>

        {/* Secondary FemPS Live Rating Badge */}
        {fempsCalc && (
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 rounded-2xl flex items-center gap-4 shrink-0 relative z-10">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t.triage.kpiFempsImpact}
              </span>
              <span className="text-3xl font-black font-mono text-violet-400">
                {fempsCalc.fempsScore}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </span>
            </div>
            <Button 
              size="sm"
              onClick={() => setShowBadgeModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t.benchmark.getBadge}</span>
            </Button>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Escalations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-red-600 uppercase tracking-wider">{t.triage.kpiCritical}</span>
            {stats.criticalCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            )}
          </div>
          <span className="text-3xl font-black font-mono text-slate-900 block tabular-nums">
            {stats.criticalCount || 0}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Requires leadership action within 24h</span>
        </div>

        {/* High Risk */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            {t.triage.kpiHigh}
          </span>
          <span className="text-3xl font-black font-mono text-slate-900 block tabular-nums">
            {stats.highCount || 0}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Under active triage review (72h SLA)</span>
        </div>

        {/* Active Investigations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            {t.triage.kpiActiveInvestigations}
          </span>
          <span className="text-3xl font-black font-mono text-slate-900 block tabular-nums">
            {stats.activeInvestigations || 0}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Remediation action plans deployed</span>
        </div>

        {/* Resolution Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            {t.triage.kpiResolutionRate}
          </span>
          <span className="text-3xl font-black font-mono text-emerald-700 block tabular-nums">
            {stats.resolvedCount || 0}/{stats.total || 0}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Closed issues directly lift FemPS score</span>
        </div>
      </div>

      {/* Main Alert Triage Board */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-black text-slate-900">
                {t.triage.hubTitle}
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">
                Real-time stream of confidential reports processed by AI Agent and routed to leadership.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {t.triage.filterAll} ({alerts.length})
              </button>
              <button 
                onClick={() => setFilter('critical')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'critical' ? 'bg-red-600 text-white shadow-2xs' : 'text-red-700 hover:bg-red-50'}`}
              >
                {t.triage.filterCritical} ({stats.criticalCount || 0})
              </button>
              <button 
                onClick={() => setFilter('high')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'high' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700 hover:bg-amber-50'}`}
              >
                {t.triage.filterHigh} ({stats.highCount || 0})
              </button>
              <button 
                onClick={() => setFilter('medium')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'medium' ? 'bg-blue-600 text-white shadow-2xs' : 'text-blue-700 hover:bg-blue-50'}`}
              >
                {t.triage.filterMedium}
              </button>
              <button 
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'resolved' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'}`}
              >
                {t.triage.filterResolved} ({stats.resolvedCount || 0})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-5">
            {filteredAlerts.map((alert: any) => {
              const isResolved = alert.resolved || alert.status === 'resolved';
              const isCritical = alert.riskLevel === 'CRITICAL';
              const isHigh = alert.riskLevel === 'HIGH';

              return (
                <div 
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    isResolved 
                      ? 'bg-slate-50/50 border-slate-200' 
                      : isCritical
                      ? 'bg-red-50/20 border-red-200 shadow-2xs'
                      : isHigh
                      ? 'bg-amber-50/20 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Alert Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Risk Badge */}
                      <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 ${
                        isCritical 
                          ? 'bg-red-600 text-white shadow-2xs'
                          : isHigh
                          ? 'bg-amber-500 text-white'
                          : alert.riskLevel === 'MEDIUM'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isCritical && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>
                          {alert.riskLevel === 'CRITICAL' 
                            ? t.triage.riskBadgeCritical 
                            : alert.riskLevel === 'HIGH'
                            ? t.triage.riskBadgeHigh
                            : alert.riskLevel === 'MEDIUM'
                            ? t.triage.riskBadgeMedium
                            : t.triage.riskBadgeLow}
                        </span>
                        <span className="opacity-80">· {alert.riskScore}/100</span>
                      </span>

                      {/* Category Tag */}
                      <span className="font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                        {alert.category}
                      </span>

                      {/* Secret Token Tag */}
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Token: {alert.trackingToken || 'ANON-KEY'}
                      </span>

                      <span className="text-slate-400 font-medium">· {alert.date}</span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.triage.stageResolved}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-lg border border-violet-200">
                          <Clock className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                          <span>
                            {alert.status === 'action_plan_active'
                              ? t.triage.stageActionPlanActive
                              : alert.status === 'leadership_review'
                              ? t.triage.stageLeadershipReview
                              : t.triage.stageAiTriaged}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Decrypted Original Statement (Zero-Knowledge Verified) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-violet-600" />
                        <span>Decrypted Whistleblower Perspective</span>
                      </span>
                      <span className="font-mono text-emerald-700 font-semibold">Zero-Knowledge Verified</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      "{alert.text}"
                    </p>
                  </div>

                  {/* AI Executive Briefing & Actionable Mitigation Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Executive Summary */}
                    <div className="p-3.5 bg-violet-50/60 border border-violet-100 rounded-xl space-y-1.5">
                      <span className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-700" />
                        <span>{t.triage.aiSummaryTitle}</span>
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {alert.aiExecutiveSummary || alert.text}
                      </p>
                    </div>

                    {/* Mitigation Steps */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-slate-700" />
                        <span>{t.triage.aiMitigationTitle}</span>
                      </span>
                      <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc pl-4">
                        {(alert.recommendedMitigationSteps && alert.recommendedMitigationSteps.length > 0) ? (
                          alert.recommendedMitigationSteps.map((step: string, i: number) => (
                            <li key={i}>{step}</li>
                          ))
                        ) : (
                          <li>Convene internal ethics & equality review committee</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Resolution Note if Closed */}
                  {isResolved && alert.resolutionNote && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <strong className="text-emerald-950 font-bold block flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Official Corporate Resolution Documented:</span>
                      </strong>
                      <p className="text-emerald-900 font-medium leading-relaxed">
                        {alert.resolutionNote}
                      </p>
                    </div>
                  )}

                  {/* Action Controls & Two-Way Dialogue Toggle */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Dialogue Drawer Toggle */}
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveDialogueId(activeDialogueId === alert.id ? null : alert.id)}
                        className="text-xs h-8 text-violet-700 border-violet-200 hover:bg-violet-50 font-bold gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {t.triage.dialogueTitle} ({alert.dialogue?.length || 0})
                        </span>
                        {activeDialogueId === alert.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </Button>

                      {/* Lifecycle Progress Buttons */}
                      {!isResolved && (
                        <>
                          {alert.status === 'ai_triaged' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(alert.id, 'leadership_review')}
                              className="text-xs h-8 text-slate-700 font-bold"
                            >
                              <span>Assign to Review</span>
                            </Button>
                          )}
                          {alert.status === 'leadership_review' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(alert.id, 'action_plan_active')}
                              className="text-xs h-8 text-blue-700 border-blue-200 bg-blue-50/50 font-bold"
                            >
                              <span>Deploy Action Plan</span>
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Mark as Resolved Button */}
                    {!isResolved && (
                      <div>
                        {resolvingId === alert.id ? (
                          <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-2 shadow-sm w-full sm:w-96">
                            <label className="text-xs font-bold text-slate-900 block">
                              {t.triage.howResolvedPrompt}
                            </label>
                            <input 
                              type="text"
                              value={resolutionNote}
                              onChange={e => setResolutionNote(e.target.value)}
                              placeholder={t.triage.howResolvedPlaceholder}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => { setResolvingId(null); setResolutionNote(''); }}
                                className="text-xs h-7"
                              >
                                {t.common.cancel}
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(alert.id, 'resolved', resolutionNote)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 font-bold gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t.triage.markResolvedBtn}</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => { setResolvingId(alert.id); setResolutionNote(''); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-bold gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.triage.markResolvedBtn}</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Collapsible Anonymous Dialogue Drawer */}
                  {activeDialogueId === alert.id && (
                    <div className="mt-3 p-4 bg-slate-100/70 border border-slate-200 rounded-xl space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{t.triage.dialogueTitle}</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Token recipient: {alert.trackingToken || 'ANON-KEY'}
                        </span>
                      </div>

                      {/* Chat Messages */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {alert.dialogue && alert.dialogue.length > 0 ? (
                          alert.dialogue.map((msg: any) => (
                            <div 
                              key={msg.id}
                              className={`p-2.5 rounded-lg text-xs font-medium ${
                                msg.sender === 'leadership'
                                  ? 'bg-slate-900 text-white ml-6'
                                  : msg.sender === 'system'
                                  ? 'bg-slate-200 text-slate-700 text-center text-[11px]'
                                  : 'bg-white text-slate-800 border border-slate-200 mr-6 shadow-2xs'
                              }`}
                            >
                              <div className="flex justify-between text-[10px] opacity-75 mb-0.5">
                                <span className="font-bold">
                                  {msg.sender === 'leadership' ? 'Management / HR' : msg.sender === 'system' ? 'System' : 'Anonymous Employee'}
                                </span>
                                <span>{msg.timestamp}</span>
                              </div>
                              <p>{msg.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 py-2 text-center">
                            No messages exchanged yet. Use the field below to send a confidential inquiry.
                          </p>
                        )}
                      </div>

                      {/* Leadership Send Input */}
                      <div className="flex gap-2 pt-1">
                        <input 
                          type="text"
                          value={leadershipReplyText}
                          onChange={e => setLeadershipReplyText(e.target.value)}
                          placeholder={t.triage.inquiryPlaceholder}
                          disabled={sendingReply}
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-violet-600 font-medium"
                        />
                        <Button 
                          size="sm"
                          disabled={sendingReply || !leadershipReplyText.trim()}
                          onClick={() => handleSendLeadershipReply(alert.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1 px-4"
                        >
                          <Send className="w-3 h-3" />
                          <span>{sendingReply ? t.common.saving : t.triage.sendInquiryBtn}</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No alerts match the selected filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Benchmark & Policies Section (Repositioned as Outcome Management) */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Secondary Benchmark Management: Policies & Representation
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Update corporate policies and workforce representation ratios to maintain national FemPS compliance.
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowSecondaryMetrics(!showSecondaryMetrics)}
            className="text-xs font-bold"
          >
            {showSecondaryMetrics ? 'Hide Secondary Metrics' : 'Configure Policies & Ratios'}
          </Button>
        </div>

        {showSecondaryMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Policy Audit */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block">{t.employer.aiAuditTitle}</span>
              <textarea 
                rows={4}
                value={policiesText}
                onChange={e => setPoliciesText(e.target.value)}
                placeholder={t.employer.policyPlaceholder}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              />
              <div className="flex justify-end">
                <Button 
                  size="sm"
                  disabled={analyzingPolicy || !policiesText.trim()}
                  onClick={handleAnalyzePolicy}
                  className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{analyzingPolicy ? t.employer.aiAuditing : t.employer.aiAuditBtn}</span>
                </Button>
              </div>
            </div>

            {/* Representation Ratios */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block">{t.employer.metricsTitle}</span>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{t.employer.leadershipRatioLabel}</span>
                    <span className="font-mono font-bold">{leadershipRatio}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={leadershipRatio} 
                    onChange={e => setLeadershipRatio(Number(e.target.value))}
                    className="w-full accent-violet-700 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{t.employer.workforceRatioLabel}</span>
                    <span className="font-mono font-bold">{workforceRatio}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={workforceRatio} 
                    onChange={e => setWorkforceRatio(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end items-center gap-2 pt-1">
                {metricsSaved && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t.employer.metricsSavedAlert}
                  </span>
                )}
                <Button 
                  size="sm"
                  disabled={metricsSaving}
                  onClick={handleSaveMetrics}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  {metricsSaving ? t.common.saving : t.employer.saveMetricsBtn}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showBadgeModal && company && fempsCalc && (
        <BadgeModal 
          company={{
            id: company.id,
            name: company.name,
            fempsScore: fempsCalc.fempsScore,
            tier: fempsCalc.tier,
            badgeColor: fempsCalc.badgeColor
          }}
          onClose={() => setShowBadgeModal(false)}
        />
      )}
    </div>
  );
}
