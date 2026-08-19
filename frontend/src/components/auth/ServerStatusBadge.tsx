'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { authService, API_BASE_URL } from '@/services/api';
import { RefreshCw } from 'lucide-react';

interface ServerStatusBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export function ServerStatusBadge({ showDetails = true, className = '' }: ServerStatusBadgeProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await authService.checkHealth();
      if (res.status === 'healthy') {
        setStatus('online');
        setLatency(res.latency_ms || 12);
      } else {
        setStatus('offline');
        setLatency(null);
      }
    } catch {
      setStatus('offline');
      setLatency(null);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 8000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div
      className={`rounded-lg border p-3 bg-slate-800 border-slate-700 text-slate-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              status === 'online'
                ? 'bg-emerald-500'
                : status === 'offline'
                ? 'bg-red-500'
                : 'bg-amber-400'
            }`}
          />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-white">
                {status === 'online'
                  ? 'Servidor Conectado'
                  : status === 'offline'
                  ? 'Servidor Desconectado'
                  : 'Comprobando Conexión...'}
              </span>
              {latency !== null && (
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                  {latency}ms
                </span>
              )}
            </div>
            {showDetails && (
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                <span>API:</span>
                <span className="text-slate-300 font-mono truncate max-w-[240px] sm:max-w-md">
                  {API_BASE_URL}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={checkConnection}
          disabled={isRefreshing}
          title="Verificar conexión"
          className="flex items-center space-x-1 rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Ping</span>
        </button>
      </div>
    </div>
  );
}

