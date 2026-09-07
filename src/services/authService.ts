import { User } from '../types/user';

export interface RegisterPayload {
  name: string;
  phoneNumber: string;
  countryCode: string;
  password?: string;
}

export interface LoginPayload {
  phoneNumber: string;
  countryCode: string;
  password?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('letstalk_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch {
          this.currentUser = null;
        }
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async login(payload: LoginPayload): Promise<User> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      this.currentUser = data.user;

      if (typeof window !== 'undefined') {
        localStorage.setItem('letstalk_user', JSON.stringify(data.user));
      }
      return data.user;
    } catch (err: any) {
      console.error('AuthService Login Error:', err);
      throw err;
    }
  }

  async register(payload: RegisterPayload): Promise<User> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await res.json();
      this.currentUser = data.user;

      if (typeof window !== 'undefined') {
        localStorage.setItem('letstalk_user', JSON.stringify(data.user));
      }
      return data.user;
    } catch (err: any) {
      console.error('AuthService Register Error:', err);
      throw err;
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('letstalk_user');
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) throw new Error('No user logged in');
    this.currentUser = { ...this.currentUser, ...updates };

    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(this.currentUser));
    }
    return this.currentUser;
  }
}

export const authService = new AuthService();
