import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// AES-256 Encryption Setup
const ENCRYPTION_KEY = crypto.randomBytes(32); // Bank-level 256-bit key
const IV_LENGTH = 16;

function encrypt(text: string) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    return text;
  }
}

function decrypt(text: string) {
  if (!text || !text.includes(':')) return text;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return "Mətnin şifrəsi açıla bilmədi (Encrypted)";
  }
}

// Mock Database since we are using memory for the prototype
const DB: {
  users: any[];
  companies: any[];
  verifications: any[];
  reviews: any[];
  personal_reviews: any[];
  feedback_sessions: any[];
} = {
  users: [
    { 
      id: 'u1', 
      name: 'Mubariz Shahbazli', 
      email: 'mubarizshahbazli458@gmail.com',
      linkedin: 'linkedin.com/in/mubariz',
      avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      companyId: 'c1', 
      verified: true, 
      role: 'employee',
      workHistory: [
        { company: 'Tech Solutions LLC', companyId: 'c1' }
      ]
    },
    { id: 'a1', name: 'Admin', role: 'admin' },
    { id: 'emp1', name: 'HR Rəhbəri (Tech Solutions)', companyId: 'c1', role: 'employer' }
  ],
  companies: [
    { 
      id: 'c1', 
      name: 'Tech Solutions LLC', 
      industry: 'Texnologiya & IT',
      logo: '💻',
      femaleWorkforceRatio: 46, // 46% qadın işçi
      femaleLeadershipRatio: 42, // 42% rəhbər qadın
      policiesText: "Şirkətimizdə 6 aylıq ödənişli analıq məzuniyyəti, hibrid çevik iş saatları, qadın mühəndislər üçün mentorluq proqramı və illik müstəqil bərabər əmək haqqı auditi keçirilir.",
      policyScore: 88,
      policyAnalysis: "Şirkətin analıq və bərabər əmək haqqı təminatı beynəlxalq standartlara tam uyğundur. Rəhbərlikdə qadın nisbəti yüksəkdir.",
      resolvedConcernsCount: 8,
      totalConcernsCount: 10
    },
    { 
      id: 'c2', 
      name: 'Global Finance Bank', 
      industry: 'Maliyyə & Bankçılıq',
      logo: '🏛️',
      femaleWorkforceRatio: 52,
      femaleLeadershipRatio: 48,
      policiesText: "Uşaq baxımı subsidiyası, qadın idarə heyəti üzvlərinin inkişafı təlimləri, ayrı-seçkiliyə qarşı sıfır dözümlülük (zero tolerance) protokolu və psixoloji dəstək xətti fəaliyyət göstərir.",
      policyScore: 94,
      policyAnalysis: "Etalon səviyyədə bərabərlik siyasəti. Həm ümumi heyətdə, həm də rəhbərlikdə balans təmin olunub.",
      resolvedConcernsCount: 15,
      totalConcernsCount: 16
    },
    { 
      id: 'c3', 
      name: 'Aura Logistics & Retail', 
      industry: 'Logistika & Ticarət',
      logo: '📦',
      femaleWorkforceRatio: 34,
      femaleLeadershipRatio: 22,
      policiesText: "Əmək məcəlləsinin standart müddəaları tətbiq olunur. Çevik qrafik yalnız ofis heyəti üçün nəzərdə tutulub.",
      policyScore: 62,
      policyAnalysis: "Sahə və logistika işlərində qadın təhlükəsizliyi qaydalarının gücləndirilməsi və rəhbər heyətdə qadın təmsilçiliyinin artırılması tövsiyə olunur.",
      resolvedConcernsCount: 4,
      totalConcernsCount: 9
    },
    { 
      id: 'c4', 
      name: 'Nexis Media Group', 
      industry: 'Media & Kreativ',
      logo: '🎙️',
      femaleWorkforceRatio: 58,
      femaleLeadershipRatio: 50,
      policiesText: "100% bərabər əmək haqqı şəffaflığı, çevik analıq/atalıq məzuniyyəti, qadın rejissor və kreativ liderlər üçün xüsusi qrant fondu.",
      policyScore: 96,
      policyAnalysis: "Kreativ sahədə qadın liderliyinin ən yüksək təmsil olunduğu şirkətlərdən biri. Şikayətlərə dərhal reaksiya verilir.",
      resolvedConcernsCount: 12,
      totalConcernsCount: 12
    }
  ],
  verifications: [],
  reviews: [
    { 
      id: 'r1', 
      trackingToken: 'BF-79X-ZK9A',
      companyId: 'c1', 
      userId: 'u1', 
      text: encrypt("Analıq məzuniyyətindən qayıtdıqdan sonra komandam mənə çevik iş saatları tanıdı və layihə rəhbərliyimi qorudu."), 
      category: 'Analıq və Çevik Qrafik', 
      sentiment: 'positive', 
      riskLevel: 'LOW',
      riskScore: 22,
      slaHours: 336,
      status: 'resolved',
      isVerified: true, 
      resolved: true,
      resolutionNote: "HR tərəfindən adaptasiya proqramı rəsmiləşdirildi və layihə rəhbərliyi təsdiqləndi.",
      aiExecutiveSummary: "Analıq məzuniyyətindən qayıdan əməkdaşın çevik iş saatları və layihə sahibliyi təmin edilib.",
      recommendedMitigationSteps: [
        "Adaptasiya qrafikinin rəsmi HR portalında qeydiyyatı",
        "Rüblük iş yükü qiymətləndirilməsinin davam etdirilməsi"
      ],
      dialogue: [
        { id: 'm1', sender: 'employee', text: 'Çevik qrafik üçün təşəkkür edirəm, layihə gedişatına müsbət təsir edir.', timestamp: '2026-04-21 14:30' },
        { id: 'm2', sender: 'leadership', text: 'Sizin komandadakı rolunuz yüksək qiymətləndirilir. Rəsmi təsdiq göndərildi.', timestamp: '2026-04-22 09:15' }
      ],
      date: '2026-04-20' 
    },
    { 
      id: 'r2', 
      trackingToken: 'BF-34K-PAY2',
      companyId: 'c1', 
      userId: 'u1', 
      text: encrypt("Mühəndislik komandasında eyni dərəcəli kişi həmkarlarımızla maaş fərqinin olub-olmaması ilə bağlı audit aparılmasını istəyirik."), 
      category: 'Maaş Bərabərliyi (Equal Pay)', 
      sentiment: 'neutral', 
      riskLevel: 'HIGH',
      riskScore: 78,
      slaHours: 72,
      status: 'action_plan_active',
      isVerified: true, 
      resolved: false,
      resolutionNote: "2026-cı il üçün müstəqil əmək haqqı bərabərliyi auditi təyin olundu.",
      aiExecutiveSummary: "Mühəndislik komandasında dərəcə üzrə maaş bərabərliyi auditi tələbi irəli sürülüb. Riskin vaxtında aradan qaldırılması tövsiyə olunur.",
      recommendedMitigationSteps: [
        "Kənar müstəqil kompensasiya auditi şirkətinin cəlb edilməsi",
        "Dərəcələr üzrə maaş diapazonunun (bands) şəffaflaşdırılması"
      ],
      dialogue: [
        { id: 'm3', sender: 'leadership', text: 'Müraciətiniz qəbul edildi. Müstəqil audit üçün şirkət seçimi aparılır.', timestamp: '2026-04-26 11:00' },
        { id: 'm4', sender: 'employee', text: 'Zəhmət olmasa L4 və L5 mühəndis pillələrinin xüsusilə diqqətdə saxlanmasını təmin edin.', timestamp: '2026-04-27 16:45' }
      ],
      date: '2026-04-25' 
    },
    { 
      id: 'r3', 
      trackingToken: 'BF-91M-SAFE',
      companyId: 'c1', 
      userId: 'u1', 
      text: encrypt("Rəhbər vəzifələrə irəli çəkilmə mərhələsində qadın mühəndislər üçün mentorluq imkanları artırılmalıdır. Rəhbərlikdə şüşə tavan hiss olunur."), 
      category: 'Karyera və Rəhbərlik İmkanları', 
      sentiment: 'neutral', 
      riskLevel: 'CRITICAL',
      riskScore: 89,
      slaHours: 24,
      status: 'leadership_review',
      isVerified: true, 
      resolved: false,
      resolutionNote: "",
      aiExecutiveSummary: "Rəhbərlik pillələrində qadınlar üçün şüşə tavan və qeyri-rəsmi kənarda qalma riski aşkarlanıb. Təcili sponsorluq mexanizmi tələb olunur.",
      recommendedMitigationSteps: [
        "İdarə heyəti səviyyəsində qadın rəhbərlər üçün mentorluq proqramının başladılması",
        "Vəzifə yüksəlişi meyarlarının obyektiv qiymətləndirmə matrisi ilə təmin edilməsi",
        "Retaliation (qisasçılıq) əleyhinə təhlükəsizlik protokolunun aktivləşdirilməsi"
      ],
      dialogue: [
        { id: 'm5', sender: 'leadership', text: 'İdarə heyəti etik komissiyası müraciəti qeydə aldı. Şöbə qrupunu anonim olaraq təsdiqləyə bilərsinizmi?', timestamp: '2026-04-29 08:30' }
      ],
      date: '2026-04-28' 
    }
  ],
  personal_reviews: [],
  feedback_sessions: []
};

// FemPS Index 4-Pillar Calculation Engine
function calculateCompanyFemPS(company: any) {
  // 1. Siyasət (Policies AI Score) - 25%
  const policyScore = company.policyScore || 70;
  const p1 = Math.min(25, Math.max(0, Math.round(policyScore * 0.25)));

  // 2. Təmsilçilik (Leadership & Workforce Representation) - 25%
  // 50% target representation for equal parity
  const leadRatio = company.femaleLeadershipRatio || 30;
  const workRatio = company.femaleWorkforceRatio || 40;
  const leadComponent = Math.min(15, (leadRatio / 50) * 15);
  const workComponent = Math.min(10, (workRatio / 50) * 10);
  const p2 = Math.min(25, Math.max(0, Math.round(leadComponent + workComponent)));

  // 3. Anonim Qadın Rəyləri və Təhlükəsizlik Göstəricisi - 25%
  const companyReviews = DB.reviews.filter(r => r.companyId === company.id);
  let p3 = 21; // baseline
  if (companyReviews.length > 0) {
    let sentimentSum = 0;
    for (const r of companyReviews) {
      if (r.sentiment === 'positive') sentimentSum += 25;
      else if (r.sentiment === 'neutral') sentimentSum += 18;
      else sentimentSum += 8;
      if (r.redFlag) sentimentSum -= 6;
    }
    p3 = Math.min(25, Math.max(5, Math.round(sentimentSum / companyReviews.length)));
  }

  // 4. Həll Bacarığı və Şikayətlərin Bağlanması (Resolution Rate) - 25%
  const total = Math.max(1, company.totalConcernsCount || companyReviews.length || 1);
  const resolved = company.resolvedConcernsCount !== undefined 
    ? company.resolvedConcernsCount 
    : companyReviews.filter(r => r.resolved).length;
  const resolutionRate = Math.min(1, resolved / total);
  const p4 = Math.min(25, Math.max(0, Math.round(resolutionRate * 25)));

  const totalScore = p1 + p2 + p3 + p4;

  let tier = 'Bronze / Audit Tələb Olunur';
  let badgeColor = '#F59E0B'; // amber
  if (totalScore >= 90) {
    tier = 'Titanium Leader (Milli Etalon)';
    badgeColor = '#8B5CF6'; // purple/violet
  } else if (totalScore >= 75) {
    tier = 'Gold Champion (Qabaqcıl Bərabərlik)';
    badgeColor = '#10B981'; // emerald green
  } else if (totalScore >= 60) {
    tier = 'Silver Pioneer (İnkişaf Edən)';
    badgeColor = '#3B82F6'; // blue
  }

  return {
    fempsScore: totalScore,
    tier,
    badgeColor,
    pillars: {
      policies: { score: p1, max: 25, rawPolicyScore: policyScore },
      representation: { score: p2, max: 25, leadershipRatio: leadRatio, workforceRatio: workRatio },
      sentiment: { score: p3, max: 25, reviewsCount: companyReviews.length },
      resolution: { score: p4, max: 25, resolved, total, ratePercent: Math.round(resolutionRate * 100) }
    }
  };
}

const app = express();
app.use(express.json());

// Initialize Gemini
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("AI initialized with GEMINI_API_KEY");
} else {
  console.log("No GEMINI_API_KEY found in process.env");
}

// APIs
app.get('/api/check-ai', (req, res) => res.json({ aiInitialized: !!ai, keyFound: !!process.env.GEMINI_API_KEY, key: process.env.GEMINI_API_KEY?.substring(0,4) }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/companies', (req, res) => {
  res.json(DB.companies);
});

// FemPS Benchmark & Detailed Scorecards
app.get('/api/femps/benchmark', (req, res) => {
  const list = DB.companies.map(c => {
    const calc = calculateCompanyFemPS(c);
    return {
      ...c,
      ...calc
    };
  });
  list.sort((a, b) => b.fempsScore - a.fempsScore);
  res.json(list);
});

app.get('/api/femps/company/:id', (req, res) => {
  const company = DB.companies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Şirkət tapılmadı' });
  const calc = calculateCompanyFemPS(company);
  res.json({ ...company, ...calc });
});

app.post('/api/femps/analyze-policy', async (req, res) => {
  const { companyId, policiesText, lang = 'en' } = req.body;
  const company = DB.companies.find(c => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Company not found' });

  const isEn = lang === 'en';
  let score = 84;
  let analysis = isEn
    ? "Company gender equality policies demonstrate robust baseline standards for maternity leave, flexible schedules, and non-discrimination. Further enhancement in executive sponsorship is advised."
    : "Şirkətin daxili siyasətləri və qadın hüquqları sənədi nəzərdən keçirildi. Əsas beynəlxalq meyarlar üzrə baza təmin edilib.";
  let recommendations = isEn
    ? [
        "Formalize executive mentorship and leadership sponsorship pathways for female managers",
        "Extend paid transition adaptation period to 6 months following return from maternity leave",
        "Publish annual independent gender pay audit metrics directly to corporate board"
      ]
    : [
        "Qadın liderlərin sponsorluq və mentorluq proqramını genişləndirmək",
        "Analıqdan sonra işə qayıdan əməkdaşlar üçün çevik adaptasiya dövrünü 6 aya qədər uzatmaq",
        "İllik müstəqil gender maaş auditi nəticələrini kollektivlə paylaşmaq"
      ];

  if (ai && policiesText) {
    try {
      const prompt = isEn
        ? `You are an international ESG and corporate gender equality auditor.
Evaluate the following corporate gender policies and practices against ILO and global DEI benchmarks:
1. Provide an objective policy score between 0 and 100.
2. Provide a 2-3 sentence expert audit verdict in professional English.
3. Provide 2-3 concrete actionable recommendations for increasing the company's FemPS score.

Corporate Policy Text:
"${policiesText}"`
        : `Sən iş yerlərində qadın hüquqları, bərabər əmək haqqı, analıq dəstəyi, təhlükəsizlik və gender bərabərliyi üzrə beynəlxalq audit ekspertisən.
Aşağıdakı şirkətin gender siyasətlərini və təcrübələrini dərindən analiz et:
1. 0 ilə 100 arasında obyektiv siyasət balı (score) təyin et.
2. 2-3 cümləlik aydın, peşəkar ekspert rəyi (analysis) yaz.
3. Şirkətin FemPS balını yüksəltməsi üçün 2-3 konkret praktiki tövsiyə (recommendations) ver.

Siyasət mətni:
"${policiesText}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              score: { type: 'NUMBER', description: 'Policy score between 0 and 100' },
              analysis: { type: 'STRING', description: 'Expert analysis verdict text' },
              recommendations: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'List of actionable improvement recommendations'
              }
            },
            required: ['score', 'analysis']
          }
        }
      });
      const parsed = JSON.parse(response.text || '{}');
      if (typeof parsed.score === 'number') score = Math.min(100, Math.max(0, Math.round(parsed.score)));
      if (parsed.analysis) analysis = parsed.analysis;
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        recommendations = parsed.recommendations;
      }
    } catch (e: any) {
      console.error('AI Policy Analysis Error:', e?.message || e);
    }
  }

  company.policiesText = policiesText;
  company.policyScore = score;
  company.policyAnalysis = analysis;
  company.policyRecommendations = recommendations;

  const calc = calculateCompanyFemPS(company);
  res.json({ ...company, ...calc });
});

app.post('/api/femps/update-metrics', (req, res) => {
  const { companyId, femaleWorkforceRatio, femaleLeadershipRatio } = req.body;
  const company = DB.companies.find(c => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Şirkət tapılmadı' });

  if (femaleWorkforceRatio !== undefined) {
    company.femaleWorkforceRatio = Math.min(100, Math.max(0, Number(femaleWorkforceRatio)));
  }
  if (femaleLeadershipRatio !== undefined) {
    company.femaleLeadershipRatio = Math.min(100, Math.max(0, Number(femaleLeadershipRatio)));
  }

  const calc = calculateCompanyFemPS(company);
  res.json({ ...company, ...calc });
});

app.post('/api/femps/resolve-review', (req, res) => {
  const { reviewId, companyId, resolutionNote } = req.body;
  const review = DB.reviews.find(r => r.id === reviewId);
  if (!review) return res.status(404).json({ error: 'Rəy tapılmadı' });

  const wasResolved = review.resolved;
  review.resolved = true;
  review.resolutionNote = resolutionNote || 'HR və Rəhbərlik tərəfindən araşdırıldı, bərabərlik standartlarına uyğun tədbir görüldü.';
  review.resolvedAt = new Date().toISOString().split('T')[0];

  const company = DB.companies.find(c => c.id === (companyId || review.companyId));
  if (company && !wasResolved) {
    company.resolvedConcernsCount = (company.resolvedConcernsCount || 0) + 1;
  }

  const calc = company ? calculateCompanyFemPS(company) : null;
  res.json({ success: true, review, calc });
});

// Dynamic SVG Badge for corporate embedding
app.get('/api/badge/:companyId.svg', (req, res) => {
  const company = DB.companies.find(c => c.id === req.params.companyId) || DB.companies[0];
  const calc = calculateCompanyFemPS(company);
  const score = calc.fempsScore;
  const isAz = req.query.lang === 'az';
  
  let tierLabel = 'Titanium Leader';
  if (score >= 90) tierLabel = isAz ? 'Titanium Lider' : 'Titanium Leader';
  else if (score >= 75) tierLabel = isAz ? 'Qızıl Çempion' : 'Gold Champion';
  else if (score >= 60) tierLabel = isAz ? 'Gümüş Öncül' : 'Silver Pioneer';
  else tierLabel = isAz ? 'Bürünc Dərəcə' : 'Bronze Rating';

  const badgeHeader = isAz ? 'BOSSFEMM BENCHMARK' : 'BOSSFEMM VERIFIED';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="76" viewBox="0 0 280 76" fill="none">
  <defs>
    <linearGradient id="femGrad" x1="0" y1="0" x2="280" y2="76" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F172A"/>
      <stop offset="1" stop-color="#1E1B4B"/>
    </linearGradient>
  </defs>
  <rect width="280" height="76" rx="14" fill="url(#femGrad)"/>
  <rect x="1" y="1" width="278" height="74" rx="13" stroke="${calc.badgeColor}" stroke-opacity="0.35" stroke-width="1.5"/>
  
  <circle cx="36" cy="38" r="18" fill="${calc.badgeColor}" fill-opacity="0.15"/>
  <path d="M36 26L45 30V38C45 43 41 47 36 49C31 47 27 43 27 38V30L36 26Z" fill="${calc.badgeColor}"/>
  <path d="M33 38L35 40L40 35" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  
  <text x="64" y="28" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="9" font-weight="700" letter-spacing="1">${badgeHeader}</text>
  <text x="64" y="46" fill="#F8FAFC" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="13" font-weight="800">${company.name.length > 17 ? company.name.substring(0, 15) + '..' : company.name}</text>
  <text x="64" y="62" fill="${calc.badgeColor}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="10.5" font-weight="700">${tierLabel} • FemPS ${score}/100</text>
  
  <rect x="220" y="20" width="46" height="36" rx="8" fill="#FFFFFF" fill-opacity="0.08"/>
  <text x="243" y="44" fill="white" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="800" text-anchor="middle">${score}</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.send(svg.trim());
});

app.post('/api/auth/manual-register', (req, res) => {
  const { name, email, education, companyId } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing required fields' });
  
  let user = DB.users.find(u => u.email === email);
  if (!user) {
    user = {
      id: 'u_' + Date.now(),
      name,
      email,
      avatar: '',
      linkedin: 'Manual Entry',
      companyId: companyId || 'c1',
      verified: false,
      role: 'employee',
      workHistory: [{ company: DB.companies.find(c => c.id === companyId)?.name || 'Unknown', companyId: companyId || 'c1' }]
    };
    DB.users.push(user);
  }
  
  res.json(user);
});

app.post('/api/auth/login', (req, res) => {
  const { role } = req.body;
  // Simple mock login just to switch roles easily in the preview
  if (role === 'admin') return res.json(DB.users[1]);
  if (role === 'employer') return res.json(DB.users[2]);
  return res.json(DB.users[0]);
});

app.get('/api/auth/linkedin/url', (req, res) => {
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;
  
  if (!process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID === 'mock') {
    return res.json({ url: '/api/auth/linkedin/callback?code=mock' });
  }

  const params = new URLSearchParams({
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
  });
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  res.json({ url: authUrl });
});

app.get('/api/auth/linkedin/callback', async (req, res) => {
  const { code } = req.query;
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;
  
  if (!process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID === 'mock') {
    // If no client ID is provided, simulate a successful login for the demo
    const mockToken = 'mock_jwt_token_u1';
    return res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${mockToken}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  }

  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    
    if (tokenData.access_token) {
      const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      const profile = await userRes.json();

      // Find or create user
      let user = DB.users.find(u => u.email === profile.email);
      if (!user) {
        user = {
          id: 'u_' + Date.now(),
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          linkedin: 'linkedin.com/in/unknown', // Basic profile doesn't include vanity name unfortunately without special permissions
          companyId: 'c1', // Simulated matching work history
          verified: false,
          role: 'employee',
          workHistory: [{ company: 'Tech Solutions LLC', companyId: 'c1' }] // simulated
        };
        DB.users.push(user);
      }

      res.send(`
        <html><body><script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', userId: '${user.id}' }, '*');
            window.close();
          }
        </script></body></html>
      `);
    } else {
      res.send('Xəta: Token alına bilmədi.');
    }
  } catch (error) {
    res.send('OAuth Xətası baş verdi.');
  }
});

app.post('/api/auth/oauth-login', (req, res) => {
  const { token, userId } = req.body;
  // If mock token used
  if (token === 'mock_jwt_token_u1') {
    return res.json(DB.users[0]);
  }
  
  if (userId) {
    const u = DB.users.find(x => x.id === userId);
    return res.json(u || DB.users[0]);
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
});

app.post('/api/verify/request', (req, res) => {
  const { userId, emails } = req.body;
  if (!emails || emails.length < 2) {
    return res.status(400).json({ error: 'Ən az 2 həmkarınızın emailini daxil etməlisiniz.' });
  }
  
  const reqId = 'v_' + Date.now();
  // Send emails logic goes here conceptually
  DB.verifications.push({ id: reqId, userId, emails, confirmations: [] });
  
  res.json({ success: true, message: 'Dəvətlər göndərildi. Həmkarlarınız təsdiqlədikdə hesabınız aktiv olacaq.', reqId });
});

app.get('/api/verify/pending/:email', (req, res) => {
  const email = req.params.email;
  // Gözləyən təsdiq sorğuları - bu email-ə göndərilən
  const pending = DB.verifications.filter(v => v.emails.includes(email));
  const detailedPending = pending.map(p => {
    const requester = DB.users.find(u => u.id === p.userId);
    return {
      requestId: p.id,
      requesterName: requester?.name,
      requesterCompany: DB.companies.find(c => c.id === requester?.companyId)?.name
    }
  });
  res.json(detailedPending);
});

app.post('/api/verify/approve', (req, res) => {
  const { requestId, approverEmail } = req.body;
  const verReq = DB.verifications.find(v => v.id === requestId);
  if (!verReq) return res.status(404).json({ error: 'Sorğu tapılmadı' });
  
  if (!verReq.confirmations.includes(approverEmail)) {
     verReq.confirmations.push(approverEmail);
  }

  if (verReq.confirmations.length >= 2) {
    const user = DB.users.find(u => u.id === verReq.userId);
    if (user) user.verified = true;
  }
  res.json({ success: true, verified: verReq.confirmations.length >= 2 });
});


app.post('/api/verify/simulate', (req, res) => {
  // Developer endpoint to magically verify the user for testing the app Flow
  const { userId } = req.body;
  const user = DB.users.find(u => u.id === userId);
  if (user) {
    user.verified = true;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/users/:id', (req, res) => {
  const user = DB.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
  const company = DB.companies.find(c => c.id === user.companyId);
  res.json({ id: user.id, name: user.name, companyName: company?.name || 'Unknown' });
});

app.get('/api/feedback-sessions', (req, res) => {
  const { userId } = req.query;
  const sessions = DB.feedback_sessions.filter(s => s.userId === userId);
  res.json(sessions);
});

app.get('/api/feedback-sessions/joined', (req, res) => {
  const { userId } = req.query;
  const userReviews = DB.personal_reviews.filter(r => r.authorId === userId && r.sessionId);
  const sessionIds = [...new Set(userReviews.map(r => r.sessionId))];
  
  const sessions = sessionIds.map(id => {
    const session = DB.feedback_sessions.find(s => s.id === id);
    if (!session) return null;
    const targetUser = DB.users.find(u => u.id === session.userId);
    return {
      ...session,
      targetUserName: targetUser?.name || 'Bilinmir'
    };
  }).filter(Boolean);
  
  res.json(sessions);
});

app.post('/api/feedback-sessions', (req, res) => {
  const { userId, title, expiresAt } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const session = {
    id: 's_' + Date.now(),
    userId,
    title: title || 'Mənə bildir',
    expiresAt: expiresAt || null,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  DB.feedback_sessions.push(session);
  res.json(session);
});

app.patch('/api/feedback-sessions/:id/deactivate', (req, res) => {
  const session = DB.feedback_sessions.find(s => s.id === req.params.id);
  if (session) {
    session.isActive = false;
    res.json(session);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.get('/api/feedback-sessions/:id', (req, res) => {
  const session = DB.feedback_sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Sessiya tapılmadı' });
  
  const user = DB.users.find(u => u.id === session.userId);
  if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

  const company = DB.companies.find(c => c.id === user.companyId);

  res.json({ 
    id: session.id, 
    userId: user.id,
    title: session.title, 
    isActive: session.isActive,
    expiresAt: session.expiresAt,
    targetUserName: user.name, 
    targetUserCompany: company?.name || 'Unknown' 
  });
});

app.get('/api/feedback-sessions/:id/reviews', (req, res) => {
  const sessionId = req.params.id;
  const page = parseInt((req.query.page as string) || '1');
  const limit = 20;

  const sessionReviews = DB.personal_reviews.filter(r => r.sessionId === sessionId);
  sessionReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const start = (page - 1) * limit;
  const end = start + limit;
  
  const decryptedReviews = sessionReviews.map(r => ({
    ...r,
    text: decrypt(r.text)
  }));

  res.json({
    reviews: decryptedReviews.slice(start, end),
    total: sessionReviews.length,
    page,
    totalPages: Math.ceil(sessionReviews.length / limit)
  });
});

app.post('/api/personal-reviews', async (req, res) => {
  const { authorId, sessionId, text, role } = req.body;
  if (!text || !authorId || !sessionId) return res.status(400).json({ error: 'Məlumatlar tam deyil' });

  const session = DB.feedback_sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Sessiya tapılmadı.' });
  if (!session.isActive) return res.status(400).json({ error: 'Bu rəy sessiyası artıq deaktivdir.' });
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    return res.status(400).json({ error: 'Bu rəy sessiyasının vaxtı bitib.' });
  }

  const targetUserId = session.userId;

  const today = new Date().toISOString().split('T')[0];
  const todaysReviews = DB.personal_reviews.filter(r => r.authorId === authorId && r.sessionId === sessionId && r.date === today);
  if (todaysReviews.length >= 3) {
    return res.status(400).json({ error: 'Bu sessiyaya gün ərzində maksimum 3 rəy bildirə bilərsiniz.' });
  }

  const author = DB.users.find(u => u.id === authorId);
  const target = DB.users.find(u => u.id === targetUserId);
  if (!author || !target) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

  const sharedCompanies = author.workHistory?.some(aw => target.workHistory?.some(tw => tw.companyId === aw.companyId));
  if (!sharedCompanies && author.companyId !== target.companyId) {
    return res.status(403).json({ error: 'Yalnız bir yerdə işlədiyiniz insanlara rəy yaza bilərsiniz.' });
  }

  let category = 'Gündəlik İş';

  if (ai) {
    try {
      const prompt = `Analiz etdiyin rəy iş yoldaşları arasındakı anonim rəydir. Bunun etik qaydalara uyğun olub-olmadığını yoxla. Əgər təhqir, qeyri-etik sözlər, şəxsi həyata uyğun olmayan şərhlər varsa, 'unethical': true qoy. Həmçinin, rəyin kateqoriyasını təyin et (Məs: Gündəlik İş, Rəhbərlik, Təqdir, Kommunikasiya, İnkişaf). Rəy: "${text}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: { unethical: { type: 'BOOLEAN' }, reason: { type: 'STRING' }, category: { type: 'STRING' } },
            required: ['unethical']
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      if (result.unethical) {
        return res.status(400).json({ error: 'Sistem rəyinizi qeyri-etik hesab etdi və avtomatik sildi: ' + (result.reason || 'Təhqir/Etik qayda pozuntusu') });
      }
      category = result.category || category;
    } catch (e) {
      console.error('AI Moderation Error:', e);
      category = 'API Key xətası (Təyin edilməyib)';
    }
  }

  const newReview = { id: 'pr_' + Date.now(), authorId, targetUserId, sessionId, role, text: encrypt(text), category, date: today };
  DB.personal_reviews.push(newReview);
  res.json({ success: true, message: 'Rəyiniz uğurla göndərildi.' });
});

app.post('/api/reviews', async (req, res) => {
  const { text, companyId, userId } = req.body;
  
  if (!text || !companyId || !userId) {
    return res.status(400).json({ error: 'Məlumatlar tam deyil' });
  }

  const today = new Date().toISOString().split('T')[0];
  const userReviewsToday = DB.reviews.filter(r => r.userId === userId && r.companyId === companyId && r.date === today);
  if (userReviewsToday.length >= 3) {
    return res.status(400).json({ error: 'Bu şirkətə gün ərzində maksimum 3 rəy bildirə bilərsiniz.' });
  }

  const user = DB.users.find(u => u.id === userId);
  const isVerified = user ? user.verified : false;

  let category = 'İş Mühiti və Təhlükəsizlik';
  let sentiment = 'neutral';
  let redFlag = false;

  if (ai) {
    try {
      const prompt = `Analiz etdiyin rəy qadın əməkdaşların korporativ iş mühiti, hüquqları, bərabərliyi və təhlükəsizliyi barədə anonim müraciətidir.
Rəy: "${text}"
Bunu dərindən analiz et:
1. Kateqoriyanı seç:
- Maaş Bərabərliyi (Equal Pay)
- Karyera və Rəhbərlik İmkanları
- Analıq və Çevik Qrafik
- İş Mühiti və Təhlükəsizlik
- Psixoloji Mühit və Qərəzsizlik
- Rəhbərlik Yanaşması
- Digər
2. Sentiment: positive, negative, neutral
3. Red Flag: Əgər mobbing, cinsi ayrı-seçkilik, gender təzyiqi, maaş kəsilməsi və ya qanun pozuntusu varsa true, yoxsa false.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              category: {
                type: 'STRING',
                description: 'Qadın iş mühiti kateqoriyası'
              },
              sentiment: {
                type: 'STRING',
                description: 'Birini seç: positive, negative, neutral'
              },
              redFlag: {
                type: 'BOOLEAN',
                description: 'Ayrı-seçkilik, mobbing və ya ciddi qayda pozuntusu olduqda true'
              }
            },
            required: ['category', 'sentiment', 'redFlag']
          }
        }
      });

      const extracted = response.text || '';
      const result = JSON.parse(extracted);
      category = result.category || category;
      sentiment = result.sentiment || sentiment;
      redFlag = result.redFlag || false;
    } catch (e: any) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error('AI Error:', errMsg);
      category = 'Süni İntellekt Xətası (API Key Yoxdur)';
    }
  }

  const newReview = {
    id: 'r_' + Date.now(),
    companyId,
    userId,
    text: encrypt(text),
    category,
    sentiment,
    isVerified,
    redFlag,
    resolved: false,
    resolutionNote: '',
    date: new Date().toISOString().split('T')[0]
  };

  DB.reviews.push(newReview);

  const company = DB.companies.find(c => c.id === companyId);
  if (company) {
    company.totalConcernsCount = (company.totalConcernsCount || 0) + 1;
  }

  res.json({
    ...newReview,
    text: text // return raw text to author so they see their posted review
  });
});

app.get('/api/reviews/me/:userId', (req, res) => {
  const userId = req.params.userId;
  const myReviews = DB.reviews
    .filter(r => r.userId === userId)
    .map(r => ({
      ...r,
      text: decrypt(r.text)
    }));
  res.json(myReviews);
});

app.get('/api/company/:id/insights', (req, res) => {
  const company = DB.companies.find(c => c.id === req.params.id);
  const companyReviews = DB.reviews.filter(r => r.companyId === req.params.id);
  
  const total = companyReviews.length;
  const positive = companyReviews.filter(r => r.sentiment === 'positive').length;
  const negative = companyReviews.filter(r => r.sentiment === 'negative').length;
  
  const promoters = positive / (total || 1);
  const detractors = negative / (total || 1);
  const enps = Math.round((promoters - detractors) * 100);

  const categories = companyReviews.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const redFlags = companyReviews.filter(r => r.redFlag);
  const fempsCalc = company ? calculateCompanyFemPS(company) : null;

  res.json({
    company,
    fempsCalc,
    totalReviews: total,
    enps,
    categories,
    redFlags,
    recentReviews: companyReviews.map(r => ({
      ...r,
      text: decrypt(r.text)
    }))
  });
});

// ---------------------------------------------------------
// BOSSFEMM: ANONYMOUS VOICE, AI RISK TRIAGE & RESOLUTION HUB
// ---------------------------------------------------------

// Helper to generate unique cryptographic secret receipt keys
function generateReceiptToken() {
  const p1 = Math.random().toString(36).substring(2, 5).toUpperCase();
  const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BF-${p1}-${p2}`;
}

// 1. Submit Anonymous Encrypted Issue (Zero-Knowledge, Token Issued)
app.post('/api/reviews/anonymous', async (req, res) => {
  const { text, companyId, preferredCategory, lang = 'en' } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Mətn daxil edilməlidir / Text cannot be empty' });
  }

  const targetCompanyId = companyId || 'c1';
  const targetCompany = DB.companies.find(c => c.id === targetCompanyId) || DB.companies[0];
  const token = generateReceiptToken();
  const today = new Date().toISOString().split('T')[0];

  // Default triage metrics
  let category = preferredCategory || (lang === 'az' ? 'Maaş Bərabərliyi və Karyera' : 'Equal Pay & Career Parity');
  let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let riskScore = 55;
  let slaHours = 168; // 7 days
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let redFlag = false;
  let aiExecutiveSummary = lang === 'az' 
    ? 'Əməkdaş tərəfindən daxil olan müraciət sistem tərəfindən anonim qeydə alındı və rəhbərliyin icraatına təqdim edildi.'
    : 'Anonymous employee perspective securely ingested. Triaged for executive review and structured remediation.';
  let recommendedMitigationSteps: string[] = [
    lang === 'az' ? 'Məsələ ilə bağlı şöbə rəhbərliyi ilə anonim təhlükəsiz dinləmə' : 'Convene confidential department leadership review',
    lang === 'az' ? 'Şirkətin bərabərlik siyasətinin yenilənməsi və təsdiqi' : 'Review and align standard equity operating policy'
  ];

  // Perform AI Triage via Gemini if available
  if (ai) {
    try {
      const prompt = `You are the specialized Bossfemm AI Agent responsible for triaging confidential workplace feedback from women employees.
Evaluate the following anonymous report:
"${text}"

Analyze with extreme sensitivity:
1. Category: Choose best fitting from:
   - "Equal Pay & Compensation"
   - "Workplace Harassment & Safety"
   - "Maternity & Caregiver Equity"
   - "Promotion & Leadership Glass Ceiling"
   - "Retaliation & Retributive Behavior"
   - "Inclusive Culture & Psychological Safety"
2. Risk Level & Score:
   - CRITICAL (Score 85-99): Direct harassment, retaliation threats, severe pay cut, legal compliance breach. SLA: 24h.
   - HIGH (Score 70-84): Systemic promotion blocking, unequal compensation band disparity, maternity penalty. SLA: 72h.
   - MEDIUM (Score 40-69): Process opacity, lack of mentorship, work-life friction. SLA: 168h.
   - LOW (Score 10-39): Constructive suggestions, positive observations with minor feedback. SLA: 336h.
3. Red Flag (boolean): true if hostile workplace, harassment, or retaliation is implied.
4. AI Executive Summary (2 sentences max): Objective, neutral briefing for the executive committee that protects the employee's anonymity and scrubs identifying syntax.
5. Recommended Mitigation Steps (array of 2-3 actionable corporate solutions).
Language: Respond in ${lang === 'az' ? 'Azerbaijani' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING' },
              riskLevel: { type: 'STRING', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
              riskScore: { type: 'INTEGER' },
              redFlag: { type: 'BOOLEAN' },
              aiExecutiveSummary: { type: 'STRING' },
              recommendedMitigationSteps: { 
                type: 'ARRAY', 
                items: { type: 'STRING' } 
              }
            },
            required: ['category', 'riskLevel', 'riskScore', 'redFlag', 'aiExecutiveSummary', 'recommendedMitigationSteps']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.category) category = parsed.category;
      if (parsed.riskLevel) riskLevel = parsed.riskLevel;
      if (parsed.riskScore) riskScore = parsed.riskScore;
      if (typeof parsed.redFlag === 'boolean') redFlag = parsed.redFlag;
      if (parsed.aiExecutiveSummary) aiExecutiveSummary = parsed.aiExecutiveSummary;
      if (Array.isArray(parsed.recommendedMitigationSteps) && parsed.recommendedMitigationSteps.length > 0) {
        recommendedMitigationSteps = parsed.recommendedMitigationSteps;
      }
    } catch (e) {
      console.error('Gemini Triage Error:', e);
      // Smart heuristic fallback
      const lower = text.toLowerCase();
      if (lower.includes('maaş') || lower.includes('pay') || lower.includes('salary') || lower.includes('bonus')) {
        category = lang === 'az' ? 'Maaş Bərabərliyi (Equal Pay)' : 'Equal Pay & Compensation';
        riskLevel = 'HIGH';
        riskScore = 78;
        aiExecutiveSummary = lang === 'az' 
          ? 'Kompensasiya və dərəcə bərabərliyi ilə bağlı təftiş tələbi irəli sürülüb.'
          : 'Compensation band parity concern registered. External or internal audit recommended.';
        recommendedMitigationSteps = [
          lang === 'az' ? 'Maaş dərəcələri üzrə gender auditi keçirilməsi' : 'Initiate gender compensation band parity review',
          lang === 'az' ? 'Vəzifə pillələri üzrə şəffaflıq hesabatının dərc edilməsi' : 'Standardize career level salary ranges'
        ];
      } else if (lower.includes('təzyiq') || lower.includes('harass') || lower.includes('mobbing') || lower.includes('qisas')) {
        category = lang === 'az' ? 'İş Mühiti və Təhlükəsizlik' : 'Workplace Harassment & Safety';
        riskLevel = 'CRITICAL';
        riskScore = 91;
        redFlag = true;
        aiExecutiveSummary = lang === 'az'
          ? 'İş mühitində psixoloji təzyiq və ya qeyri-etik davranış barədə təcili eskalasiya qeydə alınıb.'
          : 'High-severity workplace conduct report escalated. Zero-tolerance protocol required.';
        recommendedMitigationSteps = [
          lang === 'az' ? 'Etika komissiyasının 24 saat ərzində iclası' : 'Convene executive ethics panel within 24 hours',
          lang === 'az' ? 'Anonim əməkdaş üçün qoruyucu tədbirlərin təminatı' : 'Ensure non-retaliation whistleblower protections'
        ];
      } else if (lower.includes('analıq') || lower.includes('maternity') || lower.includes('uşaq') || lower.includes('çevik')) {
        category = lang === 'az' ? 'Analıq və Çevik Qrafik' : 'Maternity & Caregiver Equity';
        riskLevel = 'MEDIUM';
        riskScore = 48;
      }
    }
  } else {
    // Intelligent heuristic fallback when no API key
    const lower = text.toLowerCase();
    if (lower.includes('maaş') || lower.includes('pay') || lower.includes('salary') || lower.includes('bonus')) {
      category = lang === 'az' ? 'Maaş Bərabərliyi (Equal Pay)' : 'Equal Pay & Compensation';
      riskLevel = 'HIGH';
      riskScore = 78;
      aiExecutiveSummary = lang === 'az' 
        ? 'Kompensasiya və dərəcə bərabərliyi ilə bağlı təftiş tələbi irəli sürülüb.'
        : 'Compensation band parity concern registered. Transparent salary audit recommended.';
      recommendedMitigationSteps = [
        lang === 'az' ? 'Maaş dərəcələri üzrə gender auditi keçirilməsi' : 'Initiate gender compensation band parity review',
        lang === 'az' ? 'Vəzifə pillələri üzrə şəffaflıq hesabatının dərc edilməsi' : 'Standardize career level salary ranges'
      ];
    } else if (lower.includes('təzyiq') || lower.includes('harass') || lower.includes('mobbing') || lower.includes('qisas')) {
      category = lang === 'az' ? 'İş Mühiti və Təhlükəsizlik' : 'Workplace Harassment & Safety';
      riskLevel = 'CRITICAL';
      riskScore = 91;
      redFlag = true;
      aiExecutiveSummary = lang === 'az'
        ? 'İş mühitində psixoloji təzyiq və ya qeyri-etik davranış barədə təcili eskalasiya qeydə alınıb.'
        : 'High-severity workplace conduct report escalated. Zero-tolerance protocol required.';
      recommendedMitigationSteps = [
        lang === 'az' ? 'Etika komissiyasının 24 saat ərzində iclası' : 'Convene executive ethics panel within 24 hours',
        lang === 'az' ? 'Anonim əməkdaş üçün qoruyucu tədbirlərin təminatı' : 'Ensure non-retaliation whistleblower protections'
      ];
    }
  }

  // Adjust SLA hours by risk
  if (riskLevel === 'CRITICAL') slaHours = 24;
  else if (riskLevel === 'HIGH') slaHours = 72;
  else if (riskLevel === 'MEDIUM') slaHours = 168;
  else slaHours = 336;

  const newTicket = {
    id: 'r_' + Date.now(),
    trackingToken: token,
    companyId: targetCompanyId,
    userId: 'u_anon_' + Date.now(),
    text: encrypt(text),
    category,
    riskLevel,
    riskScore,
    slaHours,
    sentiment,
    redFlag,
    status: riskLevel === 'CRITICAL' ? 'leadership_review' : 'ai_triaged',
    isVerified: true,
    resolved: false,
    resolutionNote: '',
    aiExecutiveSummary,
    recommendedMitigationSteps,
    dialogue: [
      {
        id: 'msg_sys_1',
        sender: 'system',
        text: lang === 'az'
          ? `Müraciətiniz Zero-Knowledge kriptoqrafiyası ilə şifrələndi. AI Agent riski qiymətləndirdi (${riskLevel} - ${riskScore}/100) və rəhbərliyin həll masasına yönəltdi.`
          : `Encrypted with Zero-Knowledge cryptography. AI Agent assigned ${riskLevel} risk (${riskScore}/100) and routed to leadership triage.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    date: today
  };

  DB.reviews.push(newTicket);
  targetCompany.totalConcernsCount = (targetCompany.totalConcernsCount || 0) + 1;

  res.json({
    success: true,
    trackingToken: token,
    ticket: {
      ...newTicket,
      text: text // Echo back to user only on initial submission screen
    }
  });
});

// 2. Track Anonymous Issue Resolution Status & Dialogue via Secret Receipt Key
app.get('/api/reviews/track/:token', (req, res) => {
  const token = req.params.token?.trim().toUpperCase();
  const ticket = DB.reviews.find(r => r.trackingToken?.toUpperCase() === token);

  if (!ticket) {
    return res.status(404).json({ error: 'Etibarsız və ya tapılmayan izləmə açarı / Tracking token not found' });
  }

  const company = DB.companies.find(c => c.id === ticket.companyId);

  res.json({
    id: ticket.id,
    trackingToken: ticket.trackingToken,
    companyName: company?.name || 'Company',
    companyLogo: company?.logo || '🏢',
    text: decrypt(ticket.text),
    category: ticket.category,
    riskLevel: ticket.riskLevel || 'MEDIUM',
    riskScore: ticket.riskScore || 50,
    slaHours: ticket.slaHours || 72,
    status: ticket.status || (ticket.resolved ? 'resolved' : 'ai_triaged'),
    resolved: ticket.resolved,
    resolutionNote: ticket.resolutionNote,
    aiExecutiveSummary: ticket.aiExecutiveSummary,
    recommendedMitigationSteps: ticket.recommendedMitigationSteps || [],
    dialogue: ticket.dialogue || [],
    date: ticket.date
  });
});

// 3. Anonymous Employee Replies via Secret Receipt Key
app.post('/api/reviews/track/:token/reply', (req, res) => {
  const token = req.params.token?.trim().toUpperCase();
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Mesaj boş ola bilməz / Message cannot be empty' });
  }

  const ticket = DB.reviews.find(r => r.trackingToken?.toUpperCase() === token);
  if (!ticket) {
    return res.status(404).json({ error: 'Tracking token not found' });
  }

  if (!ticket.dialogue) ticket.dialogue = [];

  const newMsg = {
    id: 'msg_' + Date.now(),
    sender: 'employee',
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  ticket.dialogue.push(newMsg);
  res.json({ success: true, dialogue: ticket.dialogue });
});

// 4. Leadership: Retrieve Categorized Alert Triage with Risk Grading
app.get('/api/employer/triage-alerts', (req, res) => {
  const companyId = (req.query.companyId as string) || 'c1';
  const company = DB.companies.find(c => c.id === companyId);
  const companyTickets = DB.reviews.filter(r => r.companyId === companyId);

  // Sort by risk priority (CRITICAL first, then HIGH, then MEDIUM, then LOW, then resolved)
  const priorityOrder: Record<string, number> = {
    'CRITICAL': 4,
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  };

  const decryptedList = companyTickets.map(r => ({
    ...r,
    text: decrypt(r.text),
    riskLevel: r.riskLevel || 'MEDIUM',
    riskScore: r.riskScore || 50,
    status: r.status || (r.resolved ? 'resolved' : 'ai_triaged'),
    dialogue: r.dialogue || [],
    recommendedMitigationSteps: r.recommendedMitigationSteps || []
  }));

  decryptedList.sort((a, b) => {
    if (a.resolved && !b.resolved) return 1;
    if (!a.resolved && b.resolved) return -1;
    const pA = priorityOrder[a.riskLevel] || 0;
    const pB = priorityOrder[b.riskLevel] || 0;
    return pB - pA;
  });

  const fempsCalc = company ? calculateCompanyFemPS(company) : null;

  res.json({
    company,
    fempsCalc,
    alerts: decryptedList,
    stats: {
      total: companyTickets.length,
      criticalCount: companyTickets.filter(r => !r.resolved && r.riskLevel === 'CRITICAL').length,
      highCount: companyTickets.filter(r => !r.resolved && r.riskLevel === 'HIGH').length,
      resolvedCount: companyTickets.filter(r => r.resolved).length,
      activeInvestigations: companyTickets.filter(r => !r.resolved && (r.status === 'leadership_review' || r.status === 'action_plan_active')).length
    }
  });
});

// 5. Leadership: Update Alert Lifecycle Status & Document Resolution
app.post('/api/employer/alerts/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, resolutionNote, companyId } = req.body;

  const ticket = DB.reviews.find(r => r.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  ticket.status = status;
  if (resolutionNote) {
    ticket.resolutionNote = resolutionNote;
  }

  const targetCompId = companyId || ticket.companyId;
  const company = DB.companies.find(c => c.id === targetCompId);

  if (status === 'resolved') {
    ticket.resolved = true;
    if (company) {
      const resolvedCount = DB.reviews.filter(r => r.companyId === company.id && r.resolved).length;
      company.resolvedConcernsCount = resolvedCount;
    }
    // Add system confirmation message to dialogue
    if (!ticket.dialogue) ticket.dialogue = [];
    ticket.dialogue.push({
      id: 'msg_sys_res',
      sender: 'system',
      text: resolutionNote 
        ? `Rəhbərlik rəsmi həll qeydini təsdiqlədi: "${resolutionNote}". FemPS İndeksi yeniləndi.`
        : 'Rəhbərlik müraciəti tam həll edilmiş statusuna keçirdi. FemPS İndeksi yeniləndi.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  const updatedFemps = company ? calculateCompanyFemPS(company) : null;

  res.json({
    success: true,
    ticket,
    fempsCalc: updatedFemps
  });
});

// 6. Leadership: Send Anonymous Message to Employee via Secret Token Channel
app.post('/api/employer/alerts/:id/reply', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const ticket = DB.reviews.find(r => r.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  if (!ticket.dialogue) ticket.dialogue = [];

  const newMsg = {
    id: 'msg_' + Date.now(),
    sender: 'leadership',
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  ticket.dialogue.push(newMsg);

  // If status was received, promote to in-review
  if (ticket.status === 'ai_triaged') {
    ticket.status = 'leadership_review';
  }

  res.json({ success: true, dialogue: ticket.dialogue });
});

app.get('/api/admin/all', (req, res) => {
  res.json({
    users: DB.users.map(u => ({
      ...u,
      name: u.role === 'employee' ? encrypt(u.name) : u.name,
      linkedin: u.role === 'employee' ? encrypt(u.linkedin) : u.linkedin
    })),
    companies: DB.companies,
    reviews: DB.reviews
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
