import { create } from 'zustand';
import { Language, translations } from './i18n';

interface User {
  id: string;
  name: string;
  name_en?: string;
  name_az?: string;
  title_en?: string;
  title_az?: string;
  email?: string;
  avatar?: string;
  role: 'employee' | 'admin' | 'employer';
  companyId?: string;
  department?: string;
  accessToken?: string;
  isGuest?: boolean;
  verified?: boolean;
}

interface AuthStore {
  user: User | null;
  lang: Language;
  setLang: (lang: Language) => void;
  login: (role: 'employee' | 'admin' | 'employer') => Promise<void>;
  loginWithToken: (accessToken: string, passcodeHash: string) => Promise<{ success: boolean; error?: string }>;
  registerWithInvite: (companyId: string, department: string, passcodeHash: string) => Promise<{ success: boolean; accessToken?: string; error?: string }>;
  loginAsGuest: (companyId?: string) => Promise<void>;
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
    const currentUser = get().user;
    if (currentUser) {
      const updatedName = lang === 'az' 
        ? (currentUser.name_az || currentUser.name)
        : (currentUser.name_en || currentUser.name);
      set({ lang, user: { ...currentUser, name: updatedName } });
    } else {
      set({ lang });
    }
  },
  login: async (role) => {
    const lang = get().lang;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, lang })
    });
    const user = await res.json();
    set({ user });
  },
  loginWithToken: async (accessToken, passcodeHash) => {
    const lang = get().lang;
    try {
      const res = await fetch('/api/auth/token-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, passcodeHash, lang })
      });
      const data = await res.json();
      if (res.ok) {
        set({ user: data });
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Connection error' };
    }
  },
  registerWithInvite: async (companyId, department, passcodeHash) => {
    const lang = get().lang;
    try {
      const res = await fetch('/api/auth/invite-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, department, passcodeHash, lang })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set({ user: data.user });
        return { success: true, accessToken: data.accessToken };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Connection error' };
    }
  },
  loginAsGuest: async (companyId) => {
    const lang = get().lang;
    const res = await fetch('/api/auth/guest-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, lang })
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
