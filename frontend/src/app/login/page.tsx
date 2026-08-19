'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ServerStatusBadge } from '@/components/auth/ServerStatusBadge';
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Lock,
  User,
  KeyRound,
  FileCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { quickLogin, login, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submittingRole, setSubmittingRole] = useState<UserRole | null>(null);

  const handleQuickLogin = async (role: UserRole) => {
    setSubmittingRole(role);
    setLoginError(null);
    try {
      await quickLogin(role);
      // Redirigir según el rol definido
      if (role === 'ADMIN') {
        router.push('/');
      } else if (role === 'TEACHER') {
        router.push('/exams');
      } else {
        router.push('/my-exams');
      }
    } catch (err: any) {
      setLoginError('Error al iniciar sesión rápida. Revisa la conexión con el servidor.');
    } finally {
      setSubmittingRole(null);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoginError(null);
    try {
      const user = await login(username, password);
      if (user.role === 'ADMIN') {
        router.push('/');
      } else if (user.role === 'TEACHER') {
        router.push('/exams');
      } else {
        router.push('/my-exams');
      }
    } catch (err: any) {
      setLoginError('Credenciales incorrectas o error en el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              EduGrade <span className="text-blue-400 font-normal">AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Plataforma de evaluación asistida para exámenes manuscritos
          </p>
        </div>

        {/* Server Status */}
        <ServerStatusBadge />

        {/* Main Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2 rounded-md font-medium transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'quick'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Acceso Rápido</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-2 rounded-md font-medium transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Login Manual</span>
            </button>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          {activeTab === 'quick' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 text-center">
                Selecciona un rol para ingresar directamente:
              </p>

              {/* 3 Quick Role Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Administrador */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin('ADMIN')}
                  className={`text-left p-3.5 rounded-lg border transition flex flex-col justify-between bg-slate-900 hover:bg-slate-850 hover:border-blue-500 border-slate-700 ${
                    submittingRole === 'ADMIN' ? 'border-blue-500 bg-slate-800' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        Admin
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-white">
                        Administrador
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        Dashboard en vivo y analíticas.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-medium">
                    <span>Entrar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 2. Profesor */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin('TEACHER')}
                  className={`text-left p-3.5 rounded-lg border transition flex flex-col justify-between bg-slate-900 hover:bg-slate-850 hover:border-emerald-500 border-slate-700 ${
                    submittingRole === 'TEACHER' ? 'border-emerald-500 bg-slate-800' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Docente
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-white">
                        Profesor
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        Exámenes, plantillas y rúbricas.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span>Entrar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 3. Estudiante */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin('STUDENT')}
                  className={`text-left p-3.5 rounded-lg border transition flex flex-col justify-between bg-slate-900 hover:bg-slate-850 hover:border-indigo-500 border-slate-700 ${
                    submittingRole === 'STUDENT' ? 'border-indigo-500 bg-slate-800' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Alumno
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-white">
                        Estudiante
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        Calificaciones y revisiones.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-medium">
                    <span>Entrar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormLogin} className="space-y-3.5">
              <div className="space-y-1 text-left">
                <label className="block text-xs font-medium text-slate-300">
                  Usuario o Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin, profesor o estudiante"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-xs font-medium text-slate-300">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition flex items-center justify-center space-x-1.5 mt-2"
              >
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-500">
          EduGrade AI 2026 • Evaluación Automática de Exámenes
        </div>
      </div>
    </div>
  );
}
