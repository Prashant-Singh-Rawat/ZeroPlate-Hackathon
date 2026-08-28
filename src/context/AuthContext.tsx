import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SubscriptionPlan } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  login: (email: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, role: UserRole, donorType?: string, location?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserPlan: (plan: SubscriptionPlan) => void;
}

const DEFAULT_DONOR: User = {
  id: 'donor_spicevilla',
  name: 'SpiceVilla Restaurant',
  email: 'donor@spicevilla.com',
  role: 'donor',
  donorType: 'Restaurant',
  subscriptionPlan: 'free',
  location: 'Bandra West, Mumbai',
  latitude: 19.076,
  longitude: 72.8777,
  emailVerified: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_NGO: User = {
  id: 'ngo_hope',
  name: 'Hope Foundation',
  email: 'ngo@hope.org',
  role: 'ngo',
  subscriptionPlan: 'premium',
  location: 'Bandra East, Mumbai',
  latitude: 19.062,
  longitude: 72.854,
  emailVerified: true,
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zeroplate_user');
    return saved ? JSON.parse(saved) : DEFAULT_DONOR;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('zeroplate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zeroplate_user');
    }
  }, [user]);

  const login = async (email: string, selectedRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: selectedRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed.' };
    } catch (e) {
      console.warn('API login offline fallback');
      const fallbackUser = email.toLowerCase().includes('ngo') ? DEFAULT_NGO : DEFAULT_DONOR;
      setUser(fallbackUser);
      return { success: true };
    }
  };

  const loginWithGoogle = async (selectedRole: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, googleToken: 'mock_token' }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
    } catch (e) {
      console.warn('Google auth fallback');
    }
    const fallbackUser = selectedRole === 'ngo' ? DEFAULT_NGO : DEFAULT_DONOR;
    setUser(fallbackUser);
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    role: UserRole,
    donorType?: string,
    location?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, donorType, location }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed.' };
    } catch (e) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        role,
        donorType: role === 'donor' ? (donorType as any) || 'Restaurant' : undefined,
        subscriptionPlan: 'free',
        location: location || 'Mumbai Central',
        latitude: 19.076,
        longitude: 72.8777,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'ngo') {
      setUser(DEFAULT_NGO);
    } else {
      setUser(DEFAULT_DONOR);
    }
  };

  const updateUserPlan = (plan: SubscriptionPlan) => {
    if (user) {
      const updated = { ...user, subscriptionPlan: plan };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'donor',
        subscriptionPlan: user?.subscriptionPlan || 'free',
        login,
        loginWithGoogle,
        signup,
        logout,
        switchRole,
        updateUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
