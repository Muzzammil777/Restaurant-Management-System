import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles
export type UserRole = 'admin' | 'manager' | 'chef' | 'waiter' | 'cashier' | 'delivery';

// Sample users with credentials
export const SAMPLE_USERS = [
  { id: 'admin001', email: 'admin@restaurant.com', password: 'admin123', name: 'Admin User', role: 'admin' as UserRole },
  { id: 'mgr001', email: 'manager@restaurant.com', password: 'manager123', name: 'Restaurant Manager', role: 'manager' as UserRole },
  { id: 'chef001', email: 'chef@restaurant.com', password: 'chef123', name: 'Head Chef', role: 'chef' as UserRole },
  { id: 'waiter001', email: 'waiter@restaurant.com', password: 'waiter123', name: 'John Waiter', role: 'waiter' as UserRole },
  { id: 'cashier001', email: 'cashier@restaurant.com', password: 'cashier123', name: 'Cash Handler', role: 'cashier' as UserRole },
  { id: 'delivery001', email: 'delivery@restaurant.com', password: 'delivery123', name: 'Delivery Agent', role: 'delivery' as UserRole },
];

// Role permissions - which tabs each role can access
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'menu', 'orders', 'kitchen', 'tables', 'inventory', 'staff', 'billing', 'delivery', 'offers', 'reports', 'notifications', 'settings'],
  manager: ['dashboard', 'menu', 'orders', 'kitchen', 'tables', 'inventory', 'staff', 'billing', 'delivery', 'offers', 'reports', 'notifications'],
  chef: ['kitchen', 'orders', 'inventory'],
  waiter: ['orders', 'tables', 'menu'],
  cashier: ['orders', 'billing', 'tables'],
  delivery: ['delivery', 'orders'],
};

// Get default tab for each role
export const DEFAULT_TAB: Record<UserRole, string> = {
  admin: 'dashboard',
  manager: 'dashboard',
  chef: 'kitchen',
  waiter: 'orders',
  cashier: 'billing',
  delivery: 'delivery',
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
    // Find matching user
    const matchedUser = SAMPLE_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (matchedUser) {
      const userData: User = {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
      };
      setUser(userData);
      localStorage.setItem('rms_current_user', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
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
