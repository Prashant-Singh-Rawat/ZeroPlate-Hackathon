import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SubscriptionPlan } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  login: (email: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, role: UserRole, donorType?: string, location?: string) => Promise<{ success: boolean; error?: string }>;
  onboardNGO: (data: any) => Promise<{ success: boolean; error?: string }>;
  onboardDonor: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserPlan: (plan: SubscriptionPlan) => void;
}

const DEFAULT_DONOR: User = {
  id: 'donor_spicevilla',
  name: 'SpiceVilla Restaurant',
  email: 'donor@spicevilla.com',
  role: 'donor',
  phone: '+91 98200 12345',
  donorType: 'Restaurant',
  subscriptionPlan: 'free',
  location: 'Bandra West, Mumbai',
  latitude: 19.076,
  longitude: 72.8777,
  emailVerified: true,
  onboarded: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_NGO: User = {
  id: 'ngo_hope',
  name: 'Hope Foundation',
  email: 'ngo@hope.org',
  role: 'ngo',
  phone: '+91 98111 88888',
  organizationType: 'NGO',
  subscriptionPlan: 'premium',
  location: 'Bandra East, Mumbai',
  latitude: 19.062,
  longitude: 72.854,
  emailVerified: true,
  onboarded: true,
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
      const fallbackUser = selectedRole === 'ngo' || email.toLowerCase().includes('ngo') ? DEFAULT_NGO : DEFAULT_DONOR;
      setUser(fallbackUser);
      return { success: true };
    }
  };

  const loginWithGoogle = async (selectedRole: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
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
        onboarded: false,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      return { success: true };
    }
  };

  const onboardNGO = async (formData: any): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user session found.' };
    try {
      const res = await fetch('/api/auth/onboard/ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Onboarding failed.' };
    } catch (e) {
      const updated = { ...user, name: formData.organizationName, onboarded: true };
      setUser(updated);
      return { success: true };
    }
  };

  const onboardDonor = async (formData: any): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user session found.' };
    try {
      const res = await fetch('/api/auth/onboard/donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Onboarding failed.' };
    } catch (e) {
      const updated = { ...user, name: formData.organizationName, onboarded: true };
      setUser(updated);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
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
        onboardNGO,
        onboardDonor,
        logout,
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
