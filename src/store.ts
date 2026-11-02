import { create } from 'zustand';
import { Language, translations } from './i18n';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: 'employee' | 'admin' | 'employer';
  companyId?: string;
  verified?: boolean;
}

interface AuthStore {
  user: User | null;
  lang: Language;
  setLang: (lang: Language) => void;
  login: (role: 'employee' | 'admin' | 'employer') => Promise<void>;
  oauthLogin: (userId?: string, token?: string) => Promise<void>;
  manualRegister: (data: any) => Promise<void>;
  logout: () => void;
  verifySimulate: () => Promise<void>;
}

const initialLang: Language = (typeof window !== 'undefined' && (localStorage.getItem('bossfemm_lang') as Language)) || 'en';

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  lang: initialLang,
  setLang: (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bossfemm_lang', lang);
    }
    set({ lang });
  },
  login: async (role) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const user = await res.json();
    set({ user });
  },
  oauthLogin: async (userId, token) => {
    const res = await fetch('/api/auth/oauth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token })
    });
    if (res.ok) {
      const user = await res.json();
      set({ user });
    }
  },
  manualRegister: async (data) => {
    const res = await fetch('/api/auth/manual-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const user = await res.json();
      set({ user });
    } else {
      alert('Qeydiyyat zamanı xəta baş verdi');
    }
  },
  logout: () => set({ user: null }),
  verifySimulate: async () => {
    const user = get().user;
    if (!user) return;
    await fetch('/api/verify/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    set({ user: { ...user, verified: true } });
  }
}));
