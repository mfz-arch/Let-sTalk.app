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
    // Unauthenticated by default on client load
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('letstalk_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch {
          this.currentUser = null;
        }
      } else {
        this.currentUser = null;
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.currentUser;
  }

  async login(payload: LoginPayload): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.phoneNumber === '712345678' ? 'Sarah Jenkins' : 'User Account',
      username: `user_${payload.phoneNumber.slice(-4)}`,
      phoneNumber: payload.phoneNumber,
      countryCode: payload.countryCode,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.phoneNumber)}`,
      bio: "Hey there! I am using Let'sTalk.",
      onlineStatus: 'online',
      createdAt: new Date().toISOString(),
    };

    this.currentUser = loggedUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(loggedUser));
    }
    return loggedUser;
  }

  async register(payload: RegisterPayload): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      username: payload.name.toLowerCase().replace(/\s+/g, '_'),
      phoneNumber: payload.phoneNumber,
      countryCode: payload.countryCode,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`,
      bio: "Hey there! I am using Let'sTalk.",
      onlineStatus: 'online',
      createdAt: new Date().toISOString(),
    };

    this.currentUser = newUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(newUser));
    }
    return newUser;
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('letstalk_user');
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!this.currentUser) throw new Error('No user logged in');
    this.currentUser = { ...this.currentUser, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(this.currentUser));
    }
    return this.currentUser;
  }
}

export const authService = new AuthService();
