import React, { useState, useEffect } from 'react';
import { Card, Button } from './ui';
import { Trophy, Award, ChevronRight, Server, Search, Sparkles, X } from 'lucide-react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import SelfHostGuideModal from './SelfHostGuideModal';
import BadgeModal from './BadgeModal';

export interface CompanyBenchmark {
  id: string;
  name: string;
  industry: string;
  logo: string;
  fempsScore: number;
  tier: string;
  badgeColor: string;
  femaleWorkforceRatio: number;
  femaleLeadershipRatio: number;
  policiesText: string;
  policyScore: number;
  policyAnalysis: string;
  policyRecommendations?: string[];
  resolvedConcernsCount: number;
  totalConcernsCount: number;
  pillars: {
    policies: { score: number; max: number; rawPolicyScore: number };
    representation: { score: number; max: number; leadershipRatio: number; workforceRatio: number };
    sentiment: { score: number; max: number; reviewsCount: number };
    resolution: { score: number; max: number; resolved: number; total: number; ratePercent: number };
  };
}

export default function BenchmarkLeaderboard() {
  const { lang } = useAuthStore();
  const t = translations[lang];

  const [companies, setCompanies] = useState<CompanyBenchmark[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyBenchmark | null>(null);
  const [showSelfHost, setShowSelfHost] = useState(false);
  const [badgeCompany, setBadgeCompany] = useState<CompanyBenchmark | null>(null);

  useEffect(() => {
    fetch('/api/femps/benchmark')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Benchmark fetch error:', err));
  }, []);

  const getLocalizedIndustry = (industry: string) => {
    if (lang === 'en') {
      if (industry.includes('Texnologiya')) return 'Technology & IT';
      if (industry.includes('Maliyyə')) return 'Finance & Banking';
      if (industry.includes('Logistika')) return 'Logistics & Retail';
      if (industry.includes('Media')) return 'Media & Creative';
    }
    return industry;
  };

  const getLocalizedTier = (score: number) => {
    if (score >= 90) return t.tiers.titanium;
    if (score >= 75) return t.tiers.gold;
    if (score >= 60) return t.tiers.silver;
    return t.tiers.bronze;
  };

  const industries: string[] = ['all', ...Array.from<string>(new Set(companies.map(c => c.industry)))];

  const filtered = companies.filter(c => {
    const matchesIndustry = selectedIndustry === 'all' || c.industry === selectedIndustry;
    const localizedInd = getLocalizedIndustry(c.industry);
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          localizedInd.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>{t.benchmark.badge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.benchmark.title}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {t.benchmark.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSelfHost(true)} 
            className="border-slate-300 hover:border-slate-400 text-slate-700 gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-violet-600" />
            <span>{t.benchmark.selfHostBtn}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1">
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedIndustry === ind 
                  ? 'bg-violet-700 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {ind === 'all' ? t.common.allSectors : getLocalizedIndustry(ind)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.benchmark.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Benchmark Table Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-semibold">
                <th className="py-3 px-4 w-12 text-center">{t.benchmark.colRank}</th>
                <th className="py-3 px-4">{t.benchmark.colCompany}</th>
                <th className="py-3 px-4 text-center">{t.benchmark.colScore}</th>
                <th className="py-3 px-4 text-center">{t.benchmark.colTier}</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">{t.benchmark.colPillars}</th>
                <th className="py-3 px-4 text-center hidden lg:table-cell">{t.benchmark.colRatios}</th>
                <th className="py-3 px-4 text-right">{t.benchmark.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((company, index) => {
                const isTop3 = index < 3;
                const tierName = getLocalizedTier(company.fempsScore);
                const shortTier = tierName.split('(')[0].trim();
                return (
                  <tr 
                    key={company.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCompany(company)}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {isTop3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                          index === 0 ? 'bg-amber-100 text-amber-800' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-slate-100 rounded-xl shrink-0">{company.logo}</span>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                            {company.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {getLocalizedIndustry(company.industry)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-black text-lg text-slate-900 tabular-nums">
                        <span>{company.fempsScore}</span>
                        <span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span 
                        className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: `${company.badgeColor}15`, color: company.badgeColor }}
                      >
                        {shortTier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400">P1</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{company.pillars.policies.score}/25</span>
                        </div>
                        <span className="text-slate-300">·</span>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400">P2</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{company.pillars.representation.score}/25</span>
                        </div>
                        <span className="text-slate-300">·</span>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400">P3</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{company.pillars.sentiment.score}/25</span>
                        </div>
                        <span className="text-slate-300">·</span>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400">P4</span>
                          <span className="text-xs font-mono font-bold text-emerald-600">{company.pillars.resolution.score}/25</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center hidden lg:table-cell">
                      <div className="text-xs text-slate-600 font-medium">
                        <span>{lang === 'en' ? 'Exec' : 'Liderlik'}: <strong className="font-mono text-slate-900">{company.femaleLeadershipRatio}%</strong></span>
                        <span className="mx-1.5 text-slate-300">|</span>
                        <span>{lang === 'en' ? 'Staff' : 'Ştat'}: <strong className="font-mono text-slate-900">{company.femaleWorkforceRatio}%</strong></span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setBadgeCompany(company)}
                          className="h-8 text-xs text-violet-700 hover:text-violet-900 hover:bg-violet-50 gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t.benchmark.getBadge}</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setSelectedCompany(company)}
                          className="h-8 text-xs gap-1 border-slate-200"
                        >
                          <span>{t.common.details}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Company Scorecard Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white shadow-2xl border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-100 rounded-2xl">{selectedCompany.logo}</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedCompany.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {getLocalizedIndustry(selectedCompany.industry)} • {t.benchmark.scorecardSubtitle}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCompany(null)} 
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-4 space-y-6 text-sm">
              {/* Overall Score Banner */}
              <div 
                className="p-5 rounded-2xl flex items-center justify-between"
                style={{ backgroundColor: `${selectedCompany.badgeColor}10`, border: `1px solid ${selectedCompany.badgeColor}30` }}
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.employer.liveScoreTitle}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold font-mono tabular-nums" style={{ color: selectedCompany.badgeColor }}>
                      {selectedCompany.fempsScore}
                    </span>
                    <span className="text-slate-400 font-medium">/100 {t.common.points}</span>
                  </div>
                  <p className="text-xs font-bold mt-1 text-slate-700">{getLocalizedTier(selectedCompany.fempsScore)}</p>
                </div>

                <Button 
                  size="sm" 
                  onClick={() => {
                    const comp = selectedCompany;
                    setSelectedCompany(null);
                    setBadgeCompany(comp);
                  }}
                  className="bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 gap-1.5 text-xs shadow-sm font-bold"
                >
                  <Award className="w-4 h-4 text-violet-700" />
                  {t.benchmark.getBadge}
                </Button>
              </div>

              {/* 4 Pillars Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">{t.employer.p1Label}</span>
                  <div className="mt-1 flex items-baseline gap-1 font-mono">
                    <strong className="text-lg text-slate-900">{selectedCompany.pillars.policies.score}</strong>
                    <span className="text-xs text-slate-400">/25</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{t.employer.p1Raw} {selectedCompany.pillars.policies.rawPolicyScore}/100</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">{t.employer.p2Label}</span>
                  <div className="mt-1 flex items-baseline gap-1 font-mono">
                    <strong className="text-lg text-slate-900">{selectedCompany.pillars.representation.score}</strong>
                    <span className="text-xs text-slate-400">/25</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{t.employer.p2Leadership} {selectedCompany.femaleLeadershipRatio}%</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">{t.employer.p3Label}</span>
                  <div className="mt-1 flex items-baseline gap-1 font-mono">
                    <strong className="text-lg text-slate-900">{selectedCompany.pillars.sentiment.score}</strong>
                    <span className="text-xs text-slate-400">/25</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{t.employer.p3Desc}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">{t.employer.p4Label}</span>
                  <div className="mt-1 flex items-baseline gap-1 font-mono">
                    <strong className="text-lg text-emerald-600">{selectedCompany.pillars.resolution.score}</strong>
                    <span className="text-xs text-slate-400">/25</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{selectedCompany.pillars.resolution.ratePercent}% {t.employer.p4Desc}</span>
                </div>
              </div>

              {/* Policy Audit Details */}
              <div className="space-y-2 p-4 bg-violet-50/50 rounded-xl border border-violet-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                  <Sparkles className="w-3.5 h-3.5 text-violet-700" />
                  <span>{t.benchmark.aiReviewTitle}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{selectedCompany.policyAnalysis}"
                </p>
                {selectedCompany.policyRecommendations && selectedCompany.policyRecommendations.length > 0 && (
                  <div className="pt-2 border-t border-violet-200/50">
                    <span className="text-[11px] font-bold text-violet-950 block mb-1">
                      {t.benchmark.recommendationsTitle}
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      {selectedCompany.policyRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedCompany(null)} className="text-xs font-bold">
                  {t.benchmark.closeModal}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      {showSelfHost && <SelfHostGuideModal onClose={() => setShowSelfHost(false)} />}
      {badgeCompany && (
        <BadgeModal 
          company={{
            id: badgeCompany.id,
            name: badgeCompany.name,
            fempsScore: badgeCompany.fempsScore,
            tier: getLocalizedTier(badgeCompany.fempsScore),
            badgeColor: badgeCompany.badgeColor
          }} 
          onClose={() => setBadgeCompany(null)} 
        />
      )}
    </div>
  );
}
