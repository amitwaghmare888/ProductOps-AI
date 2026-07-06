export const AUTH_CREDENTIALS = {
  email: 'admin@productops.ai',
  password: 'productops2026',
};

export const AUTH_STORAGE_KEY = 'productops_auth';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  initials: string;
}

export const DEFAULT_USER: AuthUser = {
  email: 'admin@productops.ai',
  name: 'Amit Waghmare',
  role: 'AI Product Engineer',
  initials: 'AW',
};

export function login(email: string, password: string): boolean {
  if (email === AUTH_CREDENTIALS.email && password === AUTH_CREDENTIALS.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}
