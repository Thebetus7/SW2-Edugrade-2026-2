'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  LogOut,
  LayoutDashboard,
  BookOpen,
  KeyRound,
  FileCheck,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Si estamos en la pantalla de login, no mostrar la barra de navegación completa
  if (pathname === '/login') {
    return null;
  }

  const role = user?.role || 'STUDENT';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 px-6 py-2.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <Link href={role === 'ADMIN' ? '/' : role === 'TEACHER' ? '/exams' : '/my-exams'} className="flex items-center space-x-2.5">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">
              EduGrade <span className="text-blue-400 font-normal">AI</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Links based on Role */}
      <nav className="hidden md:flex items-center space-x-1">
        {/* Admin only: Live Dashboard */}
        {role === 'ADMIN' && (
          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              pathname === '/'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Dashboard</span>
          </Link>
        )}

        {/* Admin and Teacher: Exams and Rubrics */}
        {(role === 'ADMIN' || role === 'TEACHER') && (
          <Link
            href="/exams"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              pathname === '/exams'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Exámenes y Rúbricas</span>
          </Link>
        )}

        {/* All roles, especially Student: My Exams */}
        <Link
          href="/my-exams"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            pathname === '/my-exams'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span>{role === 'STUDENT' ? 'Mis Exámenes' : 'Auditoría de Entregas'}</span>
        </Link>
      </nav>

      {/* User info & quick switch */}
      <div className="flex items-center space-x-3">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1.5">
                <span>{user.full_name}</span>
                <span
                  className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border ${
                    role === 'ADMIN'
                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                      : role === 'TEACHER'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                  }`}
                >
                  {user.badge_label || role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition border border-blue-500"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ingresar</span>
          </Link>
        )}
      </div>
    </header>
  );
}

