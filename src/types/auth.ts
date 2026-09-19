export type UserRole = 'citizen' | 'worker' | 'admin' | 'recycler';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profileImage?: string;
  createdAt: Date;
  // Municipal ID for citizens and workers
  municipalId?: string;
  // Citizen specific
  upiId?: string;
  houseId?: string;
  qrCode?: string;
  // Worker specific
  workerId?: string;
  // Recycling center specific
  centerName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
  address?: string;
  // Municipal ID for citizens and workers
  municipalId?: string;
  // Citizen specific
  upiId?: string;
  houseId?: string;
  // Worker specific
  workerId?: string;
  // Recycling center specific
  centerName?: string;
}