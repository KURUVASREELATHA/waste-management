import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData, UserRole } from '@/types/auth';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => void;
  currentRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role
      }, false);

      localStorage.setItem('token', response.token);
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        phone: response.user.phone,
        address: response.user.address,
        municipalId: response.user.municipalId,
        houseId: response.user.houseId,
        upiId: response.user.upiId,
        workerId: response.user.workerId,
        centerName: response.user.centerName,
        qrCode: response.user.qrCode,
        createdAt: new Date(),
      };

      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({ title: 'Login successful', description: 'Welcome back!' });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast({ 
        title: 'Login failed', 
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/auth/register', data, false);

      localStorage.setItem('token', response.token);
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        phone: response.user.phone,
        address: response.user.address,
        municipalId: response.user.municipalId,
        upiId: response.user.upiId,
        houseId: response.user.houseId,
        qrCode: response.user.qrCode,
        workerId: response.user.workerId,
        centerName: response.user.centerName,
        createdAt: new Date(),
      };

      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({ title: 'Registration successful', description: 'Account created successfully!' });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast({ 
        title: 'Registration failed', 
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const logout = () => {
    // Stop location tracking on logout
    const savedWatchId = localStorage.getItem('locationWatchId');
    if (savedWatchId) {
      navigator.geolocation.clearWatch(parseInt(savedWatchId));
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('locationTracking');
    localStorage.removeItem('locationWatchId');
    localStorage.removeItem('currentLocation');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({ title: 'Logged out', description: 'You have been logged out successfully' });
  };

  const updateUser = (userData: any) => {
    const updatedUser = { ...authState.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuthState(prev => ({ ...prev, user: updatedUser }));
  };

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.role) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      register, 
      logout, 
      updateUser,
      currentRole: authState.user?.role || null 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};