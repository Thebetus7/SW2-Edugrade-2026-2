'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  User as UserIcon,
  Sun,
  Moon,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push('/login');
  };

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }
  };

  const showProfileAlert = () => {
    setDropdownOpen(false);
    if (user) {
      alert(
        `EduGrade AI - Detalle de Perfil:\n\n` +
        `Nombre: ${user.full_name}\n` +
        `Rol: ${user.badge_label || user.role}\n` +
        `Email: ${user.email}\n` +
        `Título: ${user.title || 'Usuario Registrado'}`
      );
    }
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
      <div className="flex items-center space-x-3 relative">
        {isAuthenticated && user ? (
          <div className="relative">
            {/* User Dropdown Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition text-left"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-650 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1 py-0.2 rounded border ${
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
                <p className="text-[10px] text-slate-400 max-w-[150px] truncate">{user.email}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                {/* Click outside overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 py-1 shadow-lg z-20 text-xs">
                  {/* Option 1: Profile Details */}
                  <button
                    onClick={showProfileAlert}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 hover:text-white flex items-center space-x-2 transition"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Mi Perfil</span>
                  </button>

                  {/* Option 2: Toggle Theme */}
                  <button
                    onClick={toggleTheme}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 hover:text-white flex items-center space-x-2 transition border-b border-slate-700/60"
                  >
                    <Sun className="w-4 h-4 text-amber-400 block dark:hidden" />
                    <Moon className="w-4 h-4 text-indigo-400 hidden dark:block" />
                    <span>Alternar Tema</span>
                  </button>

                  {/* Option 3: Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-rose-400 hover:bg-red-950/40 hover:text-rose-300 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
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



