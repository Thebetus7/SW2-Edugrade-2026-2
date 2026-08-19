'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketEvent } from '@/types';

interface UseWebSocketOptions {
  onEvent?: (event: WebSocketEvent) => void;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onEvent, reconnectInterval = 3000 } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/exams/live/';

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[EduGrade WS] Conectado al servidor en tiempo real');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event && payload.data) {
            const wsEvent: WebSocketEvent = {
              event: payload.event,
              data: payload.data,
            };
            setLastEvent(wsEvent);
            if (onEvent) {
              onEvent(wsEvent);
            }
          }
        } catch (err) {
          console.error('[EduGrade WS] Error parseando mensaje JSON:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[EduGrade WS] Desconectado. Reintentando conexion...');
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      };

      ws.onerror = (error) => {
        console.error('[EduGrade WS] Error de socket:', error);
        ws.close();
      };
    } catch (err) {
      console.error('[EduGrade WS] Error inicializando WebSocket:', err);
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, reconnectInterval);
    }
  }, [onEvent, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'ping' }));
    }
  }, []);

  return {
    isConnected,
    lastEvent,
    sendPing,
  };
}
