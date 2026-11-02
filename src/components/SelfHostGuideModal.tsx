import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from './ui';
import { X, Copy, Check, Terminal, Shield, Server, FileText } from 'lucide-react';
import { useAuthStore } from '../store';
import { translations } from '../i18n';

export default function SelfHostGuideModal({ onClose }: { onClose: () => void }) {
  const { lang } = useAuthStore();
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  const dockerCompose = `version: '3.8'

services:
  bossfemm-core:
    image: ghcr.io/bossfemm/platform:latest
    container_name: bossfemm-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - AES_256_MASTER_KEY=\${AES_256_MASTER_KEY} # 32-byte hex for zero-knowledge encryption
      - GEMINI_API_KEY=\${GEMINI_API_KEY}         # For AI policy & sentiment audit
      - SELF_HOSTED_MODE=true
      - COMPANY_NAME="Your Organization"
    volumes:
      - bossfemm-data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  bossfemm-data:
    driver: local`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dockerCompose);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl bg-white shadow-2xl border-slate-200 my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Server className="w-4 h-4" />
              <span>{t.selfHostModal.overviewTitle}</span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {t.selfHostModal.title}
            </CardTitle>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.selfHostModal.subtitle}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6 text-sm">
          <p className="text-slate-600 leading-relaxed">
            {t.selfHostModal.overviewDesc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Shield className="w-5 h-5 text-violet-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                {lang === 'en' ? 'Sovereign Encryption' : 'Daxili Şifrələmə'}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'en' 
                  ? 'AES-256 master key is managed entirely within your enterprise HSM or local keystore.'
                  : 'AES-256 şifrələmə açarı şirkətin öz HSM və ya daxili serverində saxlanılır.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Terminal className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                {lang === 'en' ? 'Automated AI Audit' : 'Avtomatlaşdırılmış Audit'}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Gemini AI evaluates internal employee handbooks and calculates real-time FemPS scores.'
                  : 'AI Siyasət Auditi daxili təlimat və HR sənədlərini avtomatik FemPS xalına çevirir.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <FileText className="w-5 h-5 text-blue-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                {lang === 'en' ? 'Benchmark Sync' : 'Benchmark İxracı'}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Optionally sync certified FemPS scores to public index while isolating raw records.'
                  : 'İstəyə bağlı olaraq yalnız FemPS yekun xalı milli ictimai reyestrlə sinxronlaşdırıla bilər.'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-700">{t.selfHostModal.composeTitle}</span>
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="h-8 gap-1.5 text-xs font-bold">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.common.copied : t.common.copy}
              </Button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              {dockerCompose}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-100 text-xs text-slate-700 space-y-1.5">
            <h5 className="font-bold text-violet-950 mb-1">{t.selfHostModal.quickStartTitle}</h5>
            <p>{t.selfHostModal.step1}</p>
            <p>{t.selfHostModal.step2}</p>
            <p>{t.selfHostModal.step3}</p>
            <p>{t.selfHostModal.step4}</p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose} className="text-xs font-bold">
              {t.common.close}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
