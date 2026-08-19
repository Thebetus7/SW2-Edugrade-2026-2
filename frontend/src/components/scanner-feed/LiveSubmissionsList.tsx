'use client';

import React from 'react';
import { StudentSubmission } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Radio, User, RefreshCw } from 'lucide-react';

interface LiveSubmissionsListProps {
  submissions: StudentSubmission[];
  selectedId: number | null;
  onSelect: (submission: StudentSubmission) => void;
  isConnected: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export const LiveSubmissionsList: React.FC<LiveSubmissionsListProps> = ({
  submissions,
  selectedId,
  onSelect,
  isConnected,
  onRefresh,
  isLoading,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GRADED':
        return <Badge variant="success">Calificado</Badge>;
      case 'REVIEWED':
        return <Badge variant="info">Revisado</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning">Evaluando</Badge>;
      case 'FAILED':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="default">Pendiente</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-72 shrink-0">
      {/* Header with live socket indicator */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
            <span>Entregas en Vivo</span>
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </h2>
          <p className="text-[11px] text-slate-400">
            {isConnected ? 'Sincronizado vía WebSocket' : 'Reconectando...'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Recargar entregas"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Submissions list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {submissions.length === 0 ? (
          <div className="text-center py-10 px-3 text-slate-500">
            <Radio className="w-6 h-6 mx-auto mb-1 opacity-40 text-slate-400" />
            <p className="text-xs font-medium">Esperando escaneos...</p>
          </div>
        ) : (
          submissions.map((sub) => {
            const isSelected = sub.id === selectedId;
            return (
              <div
                key={sub.id}
                onClick={() => onSelect(sub)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  isSelected
                    ? 'bg-slate-800 border-blue-500'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[11px] font-mono text-slate-400">#{sub.id}</span>
                  {getStatusBadge(sub.status)}
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-medium text-white mb-1">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{sub.student_name || 'Estudiante'}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-700/50">
                  <span className="truncate max-w-[110px]">{sub.exam_title}</span>
                  <span className="font-semibold text-slate-200">
                    {sub.total_score} / {sub.total_max_score}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

