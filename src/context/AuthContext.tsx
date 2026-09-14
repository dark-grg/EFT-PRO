import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/AuthService';
import toast from 'react-hot-toast';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const DEFAULT_LOCAL_PLAYER: User = {
  id: 'local_player_default',
  username: 'لاعب eFootball',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=efootball_champion',
  level: 1,
  xp: 250,
  rating: 1200,
  coins: 1500,
  tickets: 10,
  wins: 14,
  draws: 3,
  losses: 2,
  winRate: 74,
  goals: 42,
  championships: 2,
  isAdmin: false,
  isGuest: false,
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_LOCAL_PLAYER);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (username: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.login(username);
      setCurrentUser(user);
      toast.success(`أهلاً بعودتك، ${user.username}`);
    } catch (err: any) {
      toast.error(err.message || 'فشل تسجيل الدخول');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.register(username);
      setCurrentUser(user);
      toast.success('تم إنشاء الحساب بنجاح');
    } catch (err: any) {
      toast.error(err.message || 'فشل التسجيل');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const guestLogin = async () => {
    setIsLoading(true);
    try {
      const user = await AuthService.guestLogin();
      setCurrentUser(user);
      toast.success('تم الدخول كزائر بنجاح');
    } catch (err: any) {
      toast.error('فشل الدخول كزائر');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    const user = await AuthService.getCurrentUser();
    setCurrentUser(user);
    toast.success('تمت إعادة ضبط جلسة اللعب');
  };

  const updateUser = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      const updated = await AuthService.updateUser(currentUser.id, data);
      setCurrentUser(updated);
      toast.success('تم حفظ التعديلات بنجاح');
    } catch (err: any) {
      toast.error('حدث خطأ أثناء تحديث البيانات');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      register,
      guestLogin,
      logout,
      refreshUser,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

