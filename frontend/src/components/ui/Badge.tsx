import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const styles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60',
    warning: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
    error: 'bg-red-900/60 text-red-300 border-red-700/60',
    info: 'bg-blue-900/60 text-blue-300 border-blue-700/60',
    purple: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

