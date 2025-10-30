import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeMockData } from '@/utils/mockData'; // AÑADIDO

export type UserRole = 'cliente' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, inviteCode?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // INICIALIZA MOCK DATA AL CARGAR
    initializeMockData();

    const stored = localStorage.getItem('cybercafe_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('cybercafe_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const users = JSON.parse(localStorage.getItem('cybercafe_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);

    if (!found) throw new Error('Credenciales incorrectas');

    const userData: User = {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
    };

    setUser(userData);
    localStorage.setItem('cybercafe_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string, inviteCode?: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const users = JSON.parse(localStorage.getItem('cybercafe_users') || '[]');
    if (users.some((u: any) => u.email === email)) throw new Error('Email ya registrado');

    const role: UserRole = inviteCode === 'CYBER2025' ? 'admin' : 'cliente';
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(), // AÑADIDO
      isBanned: false, // AÑADIDO
    };

    users.push(newUser);
    localStorage.setItem('cybercafe_users', JSON.stringify(users));

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    setUser(userData);
    localStorage.setItem('cybercafe_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cybercafe_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('cybercafe_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};