import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from './ui';
import { X, Copy, Check, Award, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';

interface BadgeModalProps {
  company: {
    id: string;
    name: string;
    fempsScore: number;
    tier: string;
    badgeColor: string;
  };
  onClose: () => void;
}

export default function BadgeModal({ company, onClose }: BadgeModalProps) {
  const { lang } = useAuthStore();
  const t = translations[lang];
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const badgeUrl = `${window.location.origin}/api/badge/${company.id}.svg?lang=${lang}`;
  const htmlEmbed = `<a href="${window.location.origin}" target="_blank" rel="noopener noreferrer">
  <img src="${badgeUrl}" alt="${company.name} FemPS Verified Badge" width="280" height="76" />
</a>`;

  const copy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                {t.badgeModal.title}
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">{t.badgeModal.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">{t.badgeModal.livePreview}</p>
            <img 
              src={badgeUrl} 
              alt={`${company.name} FemPS Verified Badge`}
              className="drop-shadow-md rounded-xl"
              width={280}
              height={76}
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span>{t.badgeModal.scoreLabel} <strong className="font-mono tabular-nums">{company.fempsScore}/100</strong></span>
              <span>·</span>
              <span>{t.badgeModal.tierLabel} <strong>{company.tier}</strong></span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">{t.badgeModal.htmlTitle}</label>
                <button 
                  onClick={() => copy(htmlEmbed, 'html')} 
                  className="text-xs text-violet-700 hover:text-violet-800 font-bold flex items-center gap-1"
                >
                  {copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'html' ? t.common.copied : t.common.copy}
                </button>
              </div>
              <textarea 
                readOnly 
                value={htmlEmbed} 
                className="w-full p-2.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono h-20 outline-none resize-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">{t.badgeModal.svgTitle}</label>
                <button 
                  onClick={() => copy(badgeUrl, 'svg')} 
                  className="text-xs text-violet-700 hover:text-violet-800 font-bold flex items-center gap-1"
                >
                  {copiedType === 'svg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'svg' ? t.common.copied : t.common.copy}
                </button>
              </div>
              <input 
                readOnly 
                value={badgeUrl} 
                className="w-full p-2.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="text-xs font-bold">
              {t.common.close}
            </Button>
            <Button 
              onClick={() => window.open(badgeUrl, '_blank')} 
              className="bg-violet-700 hover:bg-violet-800 text-white gap-1.5 text-xs font-bold"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{lang === 'en' ? 'Open SVG' : 'SVG-yə Bax'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
