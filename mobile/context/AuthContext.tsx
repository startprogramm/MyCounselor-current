import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
  profileImage?: string;
  approved?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'counselor' | 'teacher' | 'parent';
  schoolId: string;
  schoolName: string;
  gradeLevel?: string;
  title?: string;
  department?: string;
  subject?: string;
  relationship?: string;
  childrenNames?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (data: RegisterData) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      }).catch(() => setIsLoading(false));

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          fetchingRef.current = false;
          setUser(null);
          setIsLoading(false);
        }
      });
      unsubscribe = () => subscription.unsubscribe();
    } catch {
      setIsLoading(false);
    }
    return () => unsubscribe?.();
  }, []);

  async function fetchProfile(userId: string) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to load profile:', error.message);
      } else if (data) {
        setUser({
          id: data.id,
          firstName: data.first_name ?? '',
          lastName: data.last_name ?? '',
          email: data.email ?? '',
          role: data.role,
          schoolId: data.school_id ?? '',
          schoolName: data.school_name ?? undefined,
          gradeLevel: data.grade_level ?? undefined,
          title: data.title ?? undefined,
          profileImage: data.profile_image ?? undefined,
          approved: data.approved,
        });
      }
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<{ error: string | null }> {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      return { error: null };
    } catch {
      setIsLoading(false);
      return { error: 'Supabase is not configured. Add mobile/.env with your credentials.' };
    }
  }

  async function register(data: RegisterData): Promise<{ error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) return { error: authError.message };
      if (!authData.user) return { error: 'Signup failed. Please try again.' };

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        role: data.role,
        school_id: data.schoolId,
        school_name: data.schoolName,
        grade_level: data.gradeLevel ?? null,
        title: data.title ?? null,
        department: data.department ?? null,
        subject: data.subject ?? null,
        relationship: data.relationship ?? null,
        children_names: data.childrenNames ?? null,
        approved: data.role === 'student' ? false : true,
        student_confirmed: false,
      });

      if (profileError) return { error: profileError.message };
      return { error: null };
    } catch {
      return { error: 'Registration failed. Please try again.' };
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
