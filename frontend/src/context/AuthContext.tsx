'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { authService } from '@/services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  quickLogin: (role: UserRole) => Promise<UserProfile>;
  login: (username: string, password?: string) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'edugrade_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error restaurando sesion:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const quickLogin = async (role: UserRole): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await authService.quickLogin(role);
      const userProfile: UserProfile = res.user;
      setUser(userProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProfile));
      return userProfile;
    } catch (err) {
      // Fallback offline preconfigurado si el backend no responde
      const fallbackUsers: Record<UserRole, UserProfile> = {
        ADMIN: {
          id: 1,
          username: 'admin',
          full_name: 'Administrador del Sistema',
          email: 'admin@edugrade.ai',
          role: 'ADMIN',
          title: 'Superusuario / Administrador TI',
          badge_label: 'Administrador',
          default_route: '/',
          permissions: ['all', 'view_dashboard', 'manage_exams', 'view_all_submissions'],
          token: 'offline-admin-token',
        },
        TEACHER: {
          id: 2,
          username: 'profesor',
          full_name: 'Prof. Carlos Mendoza',
          email: 'carlos.mendoza@universidad.edu',
          role: 'TEACHER',
          title: 'Docente Titular',
          badge_label: 'Profesor',
          default_route: '/exams',
          permissions: ['manage_exams', 'grade_submissions', 'view_course_submissions'],
          token: 'offline-teacher-token',
        },
        STUDENT: {
          id: 3,
          username: 'estudiante',
          full_name: 'María Rodríguez',
          student_identifier: 'EST-2026-8841',
          email: 'mrodriguez@alumno.universidad.edu',
          role: 'STUDENT',
          title: 'Estudiante Regular',
          badge_label: 'Estudiante',
          default_route: '/my-exams',
          permissions: ['view_my_submissions'],
          token: 'offline-student-token',
        },
      };

      const fallback = fallbackUsers[role];
      setUser(fallback);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password?: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await authService.login(username, password);
      const userProfile: UserProfile = res.user;
      setUser(userProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProfile));
      return userProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        quickLogin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
