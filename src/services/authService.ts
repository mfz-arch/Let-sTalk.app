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

  // Get all registered users from dynamic local storage database
  getRegisteredUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const usersStr = localStorage.getItem('letstalk_registered_users');
    if (!usersStr) return [];
    try {
      return JSON.parse(usersStr);
    } catch {
      return [];
    }
  }

  private saveUserToDirectory(user: User): void {
    if (typeof window === 'undefined') return;
    const users = this.getRegisteredUsers();
    const existingIdx = users.findIndex((u) => u.id === user.id || (u.phoneNumber === user.phoneNumber && u.countryCode === user.countryCode));
    if (existingIdx !== -1) {
      users[existingIdx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('letstalk_registered_users', JSON.stringify(users));
  }

  async getCurrentUser(): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.currentUser;
  }

  async login(payload: LoginPayload): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const registeredUsers = this.getRegisteredUsers();

    // Find registered user matching phone and countryCode
    const existing = registeredUsers.find(
      (u) => u.phoneNumber === payload.phoneNumber && u.countryCode === payload.countryCode
    );

    if (!existing) {
      // If logging in for the first time, register automatically into user directory
      const newAuthUser: User = {
        id: `usr_${Date.now()}`,
        name: `User ${payload.phoneNumber.slice(-4)}`,
        username: `user_${payload.phoneNumber.slice(-4)}`,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.phoneNumber)}`,
        bio: "Hey there! I am using Let'sTalk.",
        onlineStatus: 'online',
        createdAt: new Date().toISOString(),
      };
      this.currentUser = newAuthUser;
      this.saveUserToDirectory(newAuthUser);
    } else {
      existing.onlineStatus = 'online';
      this.currentUser = existing;
      this.saveUserToDirectory(existing);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(this.currentUser));
    }
    return this.currentUser!;
  }

  async register(payload: RegisterPayload): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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
    this.saveUserToDirectory(newUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(newUser));
    }
    return newUser;
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (this.currentUser) {
      this.currentUser.onlineStatus = 'offline';
      this.saveUserToDirectory(this.currentUser);
    }
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('letstalk_user');
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!this.currentUser) throw new Error('No user logged in');
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveUserToDirectory(this.currentUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('letstalk_user', JSON.stringify(this.currentUser));
    }
    return this.currentUser;
  }
}

export const authService = new AuthService();
