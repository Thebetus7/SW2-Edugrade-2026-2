'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SplitScreenDashboard } from '@/components/dashboard/SplitScreenDashboard';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'TEACHER') {
        router.push('/exams');
      } else if (user?.role === 'STUDENT') {
        router.push('/my-exams');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-2 text-slate-400">
        <p className="text-xs font-medium">Verificando sesión...</p>
      </div>
    );
  }

  return <SplitScreenDashboard />;
}


