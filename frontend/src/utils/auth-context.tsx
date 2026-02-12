import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from './api';

// Define user roles
export type UserRole = 'admin' | 'manager' | 'chef' | 'waiter' | 'cashier' | 'delivery' | 'staff';

// Role permissions - which tabs each role can access
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'menu', 'orders', 'kitchen', 'tables', 'inventory', 'staff', 'billing', 'delivery', 'offers', 'reports', 'notifications', 'settings'],
  manager: ['dashboard', 'menu', 'orders', 'kitchen', 'tables', 'inventory', 'staff', 'billing', 'delivery', 'offers', 'reports', 'notifications'],
  chef: ['kitchen', 'orders', 'inventory'],
  waiter: ['orders', 'tables', 'menu'],
  cashier: ['orders', 'billing', 'tables'],
  delivery: ['delivery', 'orders'],
  staff: ['orders', 'menu'], // Default permissions for generic staff
};

// Get default tab for each role
export const DEFAULT_TAB: Record<UserRole, string> = {
  admin: 'dashboard',
  manager: 'dashboard',
  chef: 'kitchen',
  waiter: 'orders',
  cashier: 'billing',
  delivery: 'delivery',
  staff: 'orders',
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (tab: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('rms_current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('rms_current_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authApi.login(email, password);
      
      if (result.success && result.user) {
        const userData: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role as UserRole,
        };
        setUser(userData);
        localStorage.setItem('rms_current_user', JSON.stringify(userData));
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rms_current_user');
  };

  const hasPermission = (tab: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(tab) ?? false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
