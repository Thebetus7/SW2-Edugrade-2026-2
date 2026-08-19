'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StudentSubmission, WebSocketEvent } from '@/types';
import { LiveSubmissionsList } from '@/components/scanner-feed/LiveSubmissionsList';
import { ExamImagePanel } from '@/components/dashboard/ExamImagePanel';
import { GradingPanel } from '@/components/dashboard/GradingPanel';
import { evaluationService } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';

export const SplitScreenDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await evaluationService.getSubmissions();
      setSubmissions(data);
      if (data.length > 0 && !selectedSubmission) {
        setSelectedSubmission(data[0]);
      }
    } catch (err) {
      console.error('Error cargando entregas de examen:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubmission]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Manejar eventos en tiempo real recibidos por WebSocket
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    const incoming = event.data;

    setSubmissions((prev) => {
      const index = prev.findIndex((s) => s.id === incoming.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = incoming;
        return updated;
      }
      return [incoming, ...prev];
    });

    setSelectedSubmission((current) => {
      if (current && current.id === incoming.id) {
        return incoming;
      }
      return current || incoming;
    });
  }, []);

  const { isConnected } = useWebSocket({
    onEvent: handleWebSocketEvent,
  });

  const handleGradeUpdated = (updated: StudentSubmission) => {
    setSelectedSubmission(updated);
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <div className="flex h-[calc(100vh-53px)] w-full overflow-hidden bg-slate-900">
      {/* 1. Left Sidebar: Live Scanner Feed */}
      <LiveSubmissionsList
        submissions={submissions}
        selectedId={selectedSubmission?.id || null}
        onSelect={setSelectedSubmission}
        isConnected={isConnected}
        onRefresh={fetchSubmissions}
        isLoading={isLoading}
      />

      {/* 2. Center: Exam Image Panel */}
      <div className="w-1/2 h-full border-r border-slate-800">
        <ExamImagePanel
          imageUrl={selectedSubmission?.exam_image_url || selectedSubmission?.exam_image || null}
          studentName={selectedSubmission?.student_name}
        />
      </div>

      {/* 3. Right: Grading Panel */}
      <div className="w-1/2 h-full">
        <GradingPanel submission={selectedSubmission} onGradeUpdated={handleGradeUpdated} />
      </div>
    </div>
  );
};

