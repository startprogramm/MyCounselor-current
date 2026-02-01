'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'counselor' | 'teacher' | 'parent';
  schoolId: string;
  schoolName?: string;
  gradeLevel?: string;
  title?: string;
  department?: string;
  profileImage?: string;
  // Teacher-specific fields
  subject?: string;
  // Parent-specific fields
  childrenIds?: string[];
  childrenNames?: string[];
  relationship?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  register: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  findRegisteredUser: (email: string) => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mycounselor_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('mycounselor_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('mycounselor_user', JSON.stringify(userData));
  };

  // Register a user and also save to registered users list
  const register = (userData: User) => {
    login(userData);
    // Save to registered users list for login lookup
    const registeredUsers = JSON.parse(localStorage.getItem('mycounselor_registered_users') || '[]');
    // Remove existing user with same email if any
    const filtered = registeredUsers.filter((u: User) => u.email !== userData.email);
    filtered.push(userData);
    localStorage.setItem('mycounselor_registered_users', JSON.stringify(filtered));
  };

  // Find a registered user by email
  const findRegisteredUser = (email: string): User | null => {
    const registeredUsers = JSON.parse(localStorage.getItem('mycounselor_registered_users') || '[]');
    return registeredUsers.find((u: User) => u.email === email) || null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mycounselor_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('mycounselor_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, findRegisteredUser }}>
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
