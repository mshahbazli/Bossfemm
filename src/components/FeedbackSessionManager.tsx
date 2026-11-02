import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { Button, Card, CardContent } from './ui';
import { Clock, Copy, Plus, X, Eye, User } from 'lucide-react';

export default function FeedbackSessionManager() {
  const { user, lang } = useAuthStore();
  const t = translations[lang];

  const [sessions, setSessions] = useState<any[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<any[]>([]);
  const [showDraft, setShowDraft] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExpire, setNewExpire] = useState('');
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionReviews, setSessionReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = () => {
    if (!user) return;
    fetch(`/api/feedback-sessions?userId=${user.id}`)
      .then(r => r.json())
      .then(setSessions);
      
    fetch(`/api/feedback-sessions/joined?userId=${user.id}`)
      .then(r => r.json())
      .then(setJoinedSessions);
  };

  useEffect(() => {
    fetchSessions();
  }, [user?.id]);

  useEffect(() => {
    if (selectedSessionId) {
      fetch(`/api/feedback-sessions/${selectedSessionId}/reviews?page=${page}`)
        .then(r => r.json())
        .then(res => {
          setSessionReviews(res.reviews);
          setTotalPages(res.totalPages);
        });
    }
  }, [selectedSessionId, page]);

  const handleCreate = async () => {
    if (!newTitle) return;
    await fetch('/api/feedback-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, title: newTitle, expiresAt: newExpire || null })
    });
    setNewTitle('');
    setNewExpire('');
    setShowDraft(false);
    fetchSessions();
  };

  const handleDeactivate = async (id: string) => {
    await fetch(`/api/feedback-sessions/${id}/deactivate`, { method: 'PATCH' });
    fetchSessions();
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/?sessionId=${id}`;
    navigator.clipboard.writeText(url);
    alert(lang === 'en' ? 'Link copied to clipboard! Share with colleagues.' : 'Link kopyalandı! İş yoldaşlarınızla paylaşın.');
  };

  return (
    <div className="space-y-10 mt-8">
      {/* Created Sessions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {lang === 'en' ? 'My Created 360 Feedback Sessions' : 'Mənim Yaratdığım "Mənə Bildir" Seansları'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {lang === 'en' ? 'Peer-to-peer confidential 360 reviews initiated by you' : 'Sizin başlatdığınız fərdi məxfi 360 rəy seansları'}
            </p>
          </div>
          <Button onClick={() => setShowDraft(!showDraft)} className="bg-violet-700 hover:bg-violet-800 text-white gap-2 text-xs font-bold">
            <Plus className="w-4 h-4" /> {lang === 'en' ? 'Create Session' : 'Yeni Yarat'}
          </Button>
        </div>

        {showDraft && (
          <Card className="border-violet-200 bg-violet-50/40">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Session Title' : 'Başlıq'}
                </label>
                <input 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder={lang === 'en' ? 'e.g. Q2 360 Peer Leadership Feedback' : 'Məs: 360 Dərəcə Rəy 2026'} 
                  className="w-full p-3 bg-white border border-violet-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-600 text-xs font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Expiration Date (Optional)' : 'Müddət (İstəyə bağlı)'}
                </label>
                <input 
                  type="date" 
                  value={newExpire} 
                  onChange={e => setNewExpire(e.target.value)} 
                  className="w-full p-3 bg-white border border-violet-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-600 text-xs font-medium" 
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDraft(false)} className="text-xs font-bold">
                  {t.common.cancel}
                </Button>
                <Button size="sm" onClick={handleCreate} className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold">
                  {lang === 'en' ? 'Create' : 'Yarat'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {sessions.map(s => {
            const expired = s.expiresAt && new Date(s.expiresAt) < new Date();
            const active = s.isActive && !expired;
            return (
              <Card key={s.id} className={active ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-70"}>
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {s.title}
                      {active ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'en' ? 'Active' : 'Aktiv'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'en' ? 'Expired' : 'Deaktiv'}
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-4 font-medium">
                      <span>{lang === 'en' ? 'Created:' : 'Yaradılıb:'} {new Date(s.createdAt).toLocaleDateString()}</span>
                      {s.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3"/> {lang === 'en' ? 'Expires:' : 'Bitir:'} {new Date(s.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {active && (
                      <Button size="sm" variant="outline" onClick={() => copyLink(s.id)} className="flex-1 sm:flex-none gap-2 text-violet-700 border-violet-300 hover:bg-violet-50 text-xs font-bold">
                        <Copy className="w-3.5 h-3.5" /> {lang === 'en' ? 'Share Link' : 'Paylaş'}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setSelectedSessionId(s.id); setPage(1); }} className="flex-1 sm:flex-none gap-2 text-xs font-bold border-slate-200">
                      <Eye className="w-3.5 h-3.5" /> {lang === 'en' ? 'Reviews' : 'Rəylər'}
                    </Button>
                    {active && (
                      <Button size="sm" variant="outline" onClick={() => handleDeactivate(s.id)} className="text-red-500 border-red-200 hover:bg-red-50">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {sessions.length === 0 && (
            <p className="text-slate-400 text-xs py-4 text-center font-medium bg-white rounded-xl border border-slate-200">
              {lang === 'en' ? 'You have not created any feedback sessions yet.' : 'Sizin yaratdığınız "Mənə Bildir" seansınız yoxdur.'}
            </p>
          )}
        </div>
      </div>

      {/* Joined Sessions */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-800">
            {lang === 'en' ? 'Sessions I Have Joined' : 'Qoşulduğum Seanslar'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {lang === 'en' ? 'Re-visit and write confidential feedback while active' : 'Aktiv olduğu müddətdə daxil olub yenidən rəy bildirin'}
          </p>
        </div>
        
        <div className="grid gap-4">
          {joinedSessions.map(s => {
            const expired = s.expiresAt && new Date(s.expiresAt) < new Date();
            const active = s.isActive && !expired;
            return (
              <Card key={s.id} className={active ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-70"}>
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {s.title}
                      {active ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'en' ? 'Active' : 'Aktiv'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'en' ? 'Closed' : 'Deaktiv'}
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-4 font-medium">
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/> {s.targetUserName}</span>
                      {s.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3"/> {lang === 'en' ? 'Expires:' : 'Bitir:'} {new Date(s.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {active ? (
                      <Button size="sm" onClick={() => window.location.href = `/?sessionId=${s.id}`} className="bg-violet-700 hover:bg-violet-800 text-white flex-1 sm:flex-none text-xs font-bold">
                        {lang === 'en' ? 'Write Review Again' : 'Yenidən Rəy Yaz'}
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{lang === 'en' ? 'Session Closed' : 'Seans Bitib'}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {joinedSessions.length === 0 && (
            <p className="text-slate-400 text-xs py-4 text-center font-medium bg-white rounded-xl border border-slate-200">
              {lang === 'en' ? 'You have not joined any peer feedback sessions yet.' : 'Sizin qoşulduğunuz "Mənə Bildir" seansı yoxdur.'}
            </p>
          )}
        </div>
      </div>

      {selectedSessionId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F9FAFB] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
             <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-3xl">
               <h2 className="text-lg font-bold text-slate-900">
                 {lang === 'en' ? 'Session Feedback History' : 'Seans Rəyləri'}
               </h2>
               <button onClick={() => setSelectedSessionId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 overflow-y-auto space-y-4">
               {sessionReviews.length === 0 ? (
                 <p className="text-center text-slate-400 text-xs py-8">
                   {lang === 'en' ? 'No peer feedback submitted for this session yet.' : 'Bu seansa hələ ki, rəy bildirilməyib.'}
                 </p>
               ) : (
                 sessionReviews.map(r => (
                   <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
                      <div className="flex justify-between items-center mb-3">
                         <div className="flex gap-2 items-center">
                           <span className="px-2.5 py-0.5 bg-violet-100 text-violet-800 text-[10px] font-bold rounded-lg">
                             {r.category || (lang === 'en' ? 'General' : 'Ümumi')}
                           </span>
                           <span className="text-xs text-slate-500 font-medium">
                             {lang === 'en' ? 'From:' : 'Kimdən:'} {r.role === 'manager' ? (lang === 'en' ? 'Lead' : 'Rəhbər') : r.role === 'subordinate' ? (lang === 'en' ? 'Report' : 'İşçi') : (lang === 'en' ? 'Peer' : 'Həmkar')}
                           </span>
                         </div>
                         <span className="text-xs text-slate-400 font-medium">{r.date}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">"{r.text}"</p>
                   </div>
                 ))
               )}
             </div>
             {totalPages > 1 && (
               <div className="p-4 border-t border-slate-200 bg-white rounded-b-3xl flex justify-center gap-2 items-center text-xs">
                 <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline" size="sm">
                   {t.common.back}
                 </Button>
                 <span className="font-bold text-slate-500">Page {page} / {totalPages}</span>
                 <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} variant="outline" size="sm">
                   {lang === 'en' ? 'Next' : 'İrəli'}
                 </Button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
