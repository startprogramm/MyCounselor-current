'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

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
  approved?: boolean;
  subject?: string;
  childrenIds?: string[];
  childrenNames?: string[];
  relationship?: string;
}

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'counselor' | 'teacher' | 'parent';
  schoolId: string;
  schoolName?: string;
  gradeLevel?: string;
  title?: string;
  department?: string;
  profileImage?: string;
  approved?: boolean;
  subject?: string;
  childrenNames?: string[];
  relationship?: string;
}

interface AuthResult {
  user: User | null;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (payload: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  findRegisteredUser: (email: string) => Promise<User | null>;
  getSchoolCounselors: (schoolId: string) => User[];
  getSchoolStudents: (schoolId: string) => User[];
  updateRegisteredUser: (userId: string, updates: Partial<User>) => Promise<void>;
  removeRegisteredUser: (userId: string) => Promise<void>;
  refreshSchoolUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    role: profile.role,
    schoolId: profile.school_id,
    schoolName: profile.school_name || undefined,
    gradeLevel: profile.grade_level || undefined,
    title: profile.title || undefined,
    department: profile.department || undefined,
    profileImage: profile.profile_image || undefined,
    approved: profile.approved,
    subject: profile.subject || undefined,
    childrenNames: profile.children_names || undefined,
    relationship: profile.relationship || undefined,
  };
}

function toProfileUpdate(updates: Partial<User>): ProfileUpdate {
  const payload: ProfileUpdate = {};

  if (updates.firstName !== undefined) payload.first_name = updates.firstName;
  if (updates.lastName !== undefined) payload.last_name = updates.lastName;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.schoolId !== undefined) payload.school_id = updates.schoolId;
  if (updates.schoolName !== undefined) payload.school_name = updates.schoolName;
  if (updates.gradeLevel !== undefined) payload.grade_level = updates.gradeLevel;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.department !== undefined) payload.department = updates.department;
  if (updates.profileImage !== undefined) payload.profile_image = updates.profileImage;
  if (updates.approved !== undefined) payload.approved = updates.approved;
  if (updates.subject !== undefined) payload.subject = updates.subject;
  if (updates.childrenNames !== undefined) payload.children_names = updates.childrenNames;
  if (updates.relationship !== undefined) payload.relationship = updates.relationship;

  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolUsers, setSchoolUsers] = useState<User[]>([]);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProfileToUser(data);
  };

  const loadSchoolUsers = async (schoolId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', schoolId);

    if (error || !data) {
      setSchoolUsers([]);
      return;
    }

    setSchoolUsers(data.map(mapProfileToUser));
  };

  const refreshSchoolUsers = async () => {
    if (!user?.schoolId) return;
    await loadSchoolUsers(user.schoolId);
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(profile);
          await loadSchoolUsers(profile.schoolId);
        } else {
          setUser(null);
          setSchoolUsers([]);
        }
      } else {
        setUser(null);
        setSchoolUsers([]);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(profile);
          await loadSchoolUsers(profile.schoolId);
          return;
        }
      }

      setUser(null);
      setSchoolUsers([]);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'No user returned from authentication.' };
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      return {
        user: null,
        error: 'Account profile was not found. Please contact support.',
      };
    }

    setUser(profile);
    await loadSchoolUsers(profile.schoolId);

    return { user: profile, error: null };
  };

  const register = async (payload: RegisterInput): Promise<AuthResult> => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });

    if (signUpError) {
      return { user: null, error: signUpError.message };
    }

    if (!signUpData.user) {
      return { user: null, error: 'Unable to create account.' };
    }

    let approved = Boolean(payload.approved);

    if (payload.role === 'counselor') {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', payload.schoolId)
        .eq('role', 'counselor')
        .eq('approved', true);

      approved = (count ?? 0) === 0;
    }

    const insertPayload: Database['public']['Tables']['profiles']['Insert'] = {
      id: signUpData.user.id,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      role: payload.role,
      school_id: payload.schoolId,
      school_name: payload.schoolName || '',
      grade_level: payload.gradeLevel || null,
      title: payload.title || null,
      department: payload.department || null,
      profile_image: payload.profileImage || null,
      approved,
      subject: payload.subject || null,
      children_names: payload.childrenNames || null,
      relationship: payload.relationship || null,
    };

    const { error: profileError } = await supabase.from('profiles').insert(insertPayload);

    if (profileError) {
      return { user: null, error: profileError.message };
    }

    const profile = await fetchProfile(signUpData.user.id);
    if (!profile) {
      return {
        user: null,
        error: 'Account created, but profile could not be loaded.',
      };
    }

    if (signUpData.session) {
      setUser(profile);
      await loadSchoolUsers(profile.schoolId);
    }

    return { user: profile, error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSchoolUsers([]);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const payload = toProfileUpdate(updates);
    if (Object.keys(payload).length === 0) return;

    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
    if (error) return;

    if (updates.email && updates.email !== user.email) {
      await supabase.auth.updateUser({ email: updates.email });
    }

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setSchoolUsers((prev) => prev.map((item) => (item.id === user.id ? updatedUser : item)));
  };

  const findRegisteredUser = async (email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) return null;
    return mapProfileToUser(data);
  };

  const getSchoolCounselors = (schoolId: string): User[] => {
    return schoolUsers.filter((profile) => profile.role === 'counselor' && profile.schoolId === schoolId);
  };

  const getSchoolStudents = (schoolId: string): User[] => {
    return schoolUsers.filter((profile) => profile.role === 'student' && profile.schoolId === schoolId);
  };

  const updateRegisteredUser = async (userId: string, updates: Partial<User>) => {
    const payload = toProfileUpdate(updates);
    if (Object.keys(payload).length === 0) return;

    const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
    if (error) return;

    setSchoolUsers((prev) =>
      prev.map((profile) => (profile.id === userId ? { ...profile, ...updates } : profile))
    );

    if (user?.id === userId) {
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  };

  const removeRegisteredUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) return;

    setSchoolUsers((prev) => prev.filter((profile) => profile.id !== userId));

    if (user?.id === userId) {
      await logout();
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      findRegisteredUser,
      getSchoolCounselors,
      getSchoolStudents,
      updateRegisteredUser,
      removeRegisteredUser,
      refreshSchoolUsers,
    }),
    [user, isLoading, schoolUsers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
