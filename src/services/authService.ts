import { User } from '../types/user';
import { MOCK_CURRENT_USER, MOCK_USERS } from '../data/mockData';

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
    // Check localStorage for persisted user state on client side
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('letstalk_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch {
          this.currentUser = MOCK_CURRENT_USER;
        }
      } else {
        this.currentUser = MOCK_CURRENT_USER;
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.currentUser;
  }

  async login(payload: LoginPayload): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Try finding user by phone number or default to mock user
    const existing = MOCK_USERS.find(
      (u) => u.phoneNumber === payload.phoneNumber && u.countryCode === payload.countryCode
    );

    const userToLogin = existing || {
      ...MOCK_CURRENT_USER,
      phoneNumber: payload.phoneNumber,
      countryCode: payload.countryCode,
    };

    this.currentUser = userToLogin;
    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(userToLogin));
    }
    return userToLogin;
  }

  async register(payload: RegisterPayload): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      username: payload.name.toLowerCase().replace(/\s+/g, '_'),
      phoneNumber: payload.phoneNumber,
      countryCode: payload.countryCode,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`,
      bio: 'Hey there! I am using Let\'sTalk.',
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
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('letstalk_user');
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!this.currentUser) throw new Error('No user logged in');
    this.currentUser = { ...this.currentUser, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(this.currentUser));
    }
    return this.currentUser;
  }
}

export const authService = new AuthService();
