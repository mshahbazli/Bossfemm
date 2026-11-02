import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui';

export default function AdminDashboard() {
  const { lang } = useAuthStore();
  const t = translations[lang];
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/all')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-500 font-bold">{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          {lang === 'en' ? 'Platform Governance & Data Logs' : 'Qlobal Admin Paneli'}
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          {lang === 'en' ? 'Sovereign Telemetry & Audits' : 'Sistem monitorinqi'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Companies' : 'Şirkətlər'}
            </h3>
            <div className="bg-violet-50 p-3.5 rounded-xl border border-violet-100">
              <p className="text-xs font-medium text-violet-700">
                {lang === 'en' ? 'Benchmarked Companies' : 'Ümumi Şirkətlər'}
              </p>
              <h3 className="text-3xl font-black mt-1 font-mono text-slate-900 tabular-nums">{data.companies.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Employees' : 'İstifadəçilər'}
            </h3>
            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
              <p className="text-xs font-medium text-blue-700">
                {lang === 'en' ? 'Active Participants' : 'Ümumi İşçilər'}
              </p>
              <h3 className="text-3xl font-black mt-1 font-mono text-slate-900 tabular-nums">{data.users.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Activity' : 'Aktivlik'}
            </h3>
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
              <p className="text-xs font-medium text-emerald-700">
                {lang === 'en' ? 'Encrypted Submissions' : 'Ümumi Rəylər'}
              </p>
              <h3 className="text-3xl font-black mt-1 font-mono text-slate-900 tabular-nums">{data.reviews.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-bold text-slate-900">
            {lang === 'en' ? 'System Audit Log (Encrypted Storage)' : 'Sistemdəki Bütün Rəylər (Data Log)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{lang === 'en' ? 'Company' : 'Şirkət'}</th>
                  <th className="px-4 py-3">{lang === 'en' ? 'Date' : 'Tarix'}</th>
                  <th className="px-4 py-3">{lang === 'en' ? 'Category' : 'Kateqoriya'}</th>
                  <th className="px-4 py-3">{lang === 'en' ? 'Status' : 'Status'}</th>
                  <th className="px-4 py-3">{lang === 'en' ? 'Verified' : 'Təsdiqli'}</th>
                  <th className="px-4 py-3">{lang === 'en' ? 'Raw Ciphertext' : 'Şifrələnmiş Mətn'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                {data.reviews.map((r: any) => {
                  const compName = data.companies.find((c:any) => c.id === r.companyId)?.name || 'Unknown';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{r.id}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">{compName}</span></td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{r.date}</td>
                      <td className="px-4 py-3"><span className="text-violet-700 font-bold">{r.category}</span></td>
                      <td className="px-4 py-3">
                        {r.resolved ? (
                          <span className="text-emerald-700 font-bold text-xs">{lang === 'en' ? 'Resolved' : 'Həll Edildi'}</span>
                        ) : (
                          <span className="text-amber-700 font-bold text-xs">{lang === 'en' ? 'Open' : 'Açıq'}</span>
                        )}
                        {r.redFlag && <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold">! {lang === 'en' ? 'Critical' : 'Kritik'}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {r.isVerified ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 truncate max-w-xs font-mono text-[10px] text-slate-400">
                        <span className="text-violet-700 font-bold px-1.5 py-0.5 mr-1.5 bg-violet-50 rounded border border-violet-100">AES-256</span>
                        {r.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
