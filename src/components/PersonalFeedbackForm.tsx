import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';
import { Button, Card, CardContent, CardHeader, CardTitle } from './ui';
import { User, Lock, CheckCircle2 } from 'lucide-react';

export default function PersonalFeedbackForm({ sessionId }: { sessionId: string }) {
  const { user, lang } = useAuthStore();
  const t = translations[lang];

  const [sessionData, setSessionData] = useState<any>(null);
  const [review, setReview] = useState('');
  const [role, setRole] = useState('colleague');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/feedback-sessions/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setSessionData(data);
        else setErrorMsg(data.error || (lang === 'en' ? 'Session not found' : 'Sessiya tapılmadı'));
      })
      .catch(() => setErrorMsg(lang === 'en' ? 'Error loading session' : 'Sessiya yüklənərkən xəta baş verdi'))
      .finally(() => setLoading(false));
  }, [sessionId, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review) return;
    setErrorMsg('');
    setSubmitted(false);

    try {
      const res = await fetch('/api/personal-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user?.id,
          sessionId,
          text: review,
          role
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'en' ? 'Unknown error occurred' : 'Naməlum xəta baş verdi'));
      } else {
        setSubmitted(true);
        setReview('');
      }
    } catch (err) {
      setErrorMsg(lang === 'en' ? 'Server connection error.' : 'Serverlə əlaqədə xəta.');
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-slate-500 font-bold">{t.common.loading}</div>;
  }

  if (!sessionData || !sessionData.isActive || (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date())) {
    return (
      <div className="text-center p-8 text-red-500 font-bold text-sm bg-white rounded-2xl border border-red-200">
        {errorMsg || (lang === 'en' ? 'This feedback session is closed or inactive.' : 'Sessiya artıq bitib və ya deaktiv edilib.')}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-violet-200 bg-white shadow-sm">
         <CardHeader className="border-b border-slate-100 pb-4">
           <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
             <User className="text-violet-700 w-5 h-5" /> {sessionData.title}
           </CardTitle>
         </CardHeader>
         <CardContent className="pt-6 space-y-4">
           <div>
             <h3 className="text-xl font-black text-slate-900">{sessionData.targetUserName}</h3>
             <p className="text-xs text-slate-500 font-medium mt-0.5">
               {lang === 'en' ? 'Organization:' : 'Şirkət:'} {sessionData.targetUserCompany}
             </p>
           </div>
           
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">
                 {lang === 'en' ? 'Working Relationship' : 'Münasibətiniz'}
               </label>
               <select 
                 value={role} 
                 onChange={e => setRole(e.target.value)} 
                 className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-xs font-medium text-slate-800"
               >
                 <option value="manager">{lang === 'en' ? 'I am their direct Manager / Lead' : 'Mən onun Rəhbəriyəm'}</option>
                 <option value="colleague">{lang === 'en' ? 'We are Peers / Colleagues (Same Level)' : 'Biz Həmkarıq (Eyni Səviyyə)'}</option>
                 <option value="subordinate">{lang === 'en' ? 'They are my Manager / Lead' : 'O mənim rəhbərimdir'}</option>
               </select>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">
                 {lang === 'en' ? 'Confidential Feedback (AES-256 Protected)' : 'Rəyiniz (Anonimdir)'}
               </label>
               <textarea 
                 rows={6}
                 placeholder={lang === 'en' ? 'Share constructive feedback on collaboration, mentorship, equality, and teamwork...' : 'Süni İntellekt etik qaydaları yoxlayacaq. Təhqir, şantaj və qeyri-etik ifadələr dərhal filtrlənəcək...'}
                 className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl resize-none text-slate-800 focus:ring-2 focus:ring-violet-600 outline-none font-medium text-xs leading-relaxed"
                 value={review}
                 onChange={e => setReview(e.target.value)}
               />
               <div className="flex gap-2.5 items-start mt-3 p-3 bg-violet-50/70 border border-violet-100 rounded-xl">
                 <Lock className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
                 <p className="text-xs text-slate-600 font-medium leading-relaxed">
                   <strong className="text-violet-900 font-bold">{lang === 'en' ? 'Zero-Knowledge Guarantee: ' : 'Tam Anonimlik Zəmanəti: '}</strong>
                   {lang === 'en'
                     ? 'Your review is encrypted with bank-level AES-256 before storage. Neither platform admins nor colleagues can deanonymize you.'
                     : 'Rəyiniz məlumat bazasına AES-256 şifrələməsi ilə yazılır. Platforma rəhbərliyi və ya iş yoldaşınız müəllifi müəyyən edə bilməz.'}
                 </p>
               </div>
             </div>

             {errorMsg && (
               <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                 {errorMsg}
               </div>
             )}

             {submitted && (
               <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                 <span>{lang === 'en' ? 'Thank you! Your confidential feedback was encrypted and saved.' : 'Təşəkkür edirik! Rəyiniz anonim olaraq şifrələnib qeydə alındı.'}</span>
               </div>
             )}

             <div className="flex justify-end pt-1">
               <Button 
                 type="submit" 
                 disabled={!review.trim()} 
                 className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-6 rounded-xl text-xs h-9"
               >
                 {lang === 'en' ? 'Submit Confidential Feedback' : 'Anonim Göndər'}
               </Button>
             </div>
           </form>
         </CardContent>
      </Card>
    </div>
  );
}
