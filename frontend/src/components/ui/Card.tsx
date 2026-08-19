import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/90 border border-slate-700 rounded-xl ${
        onClick ? 'cursor-pointer hover:border-slate-500 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

