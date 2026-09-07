export interface CountryCode {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
  format?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  phoneNumber: string;
  countryCode: string;
  avatar: string;
  bio?: string;
  onlineStatus: 'online' | 'offline' | 'away';
  lastSeen?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
