'use client';

import React, { useState } from 'react';
import { StudentSubmission, GradedItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { evaluationService } from '@/services/api';
import {
  Edit3,
  Save,
  Bot,
  UserCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface GradingPanelProps {
  submission: StudentSubmission | null;
  onGradeUpdated: (updatedSubmission: StudentSubmission) => void;
}

export const GradingPanel: React.FC<GradingPanelProps> = ({ submission, onGradeUpdated }) => {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedScore, setEditedScore] = useState<number>(0);
  const [editedFeedback, setEditedFeedback] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!submission) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 bg-slate-900 h-full">
        <div className="text-center">
          <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-xs font-medium text-slate-300">Ningún examen seleccionado</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Selecciona una entrega en la barra lateral izquierda
          </p>
        </div>
      </div>
    );
  }

  const startEdit = (item: GradedItem) => {
    setEditingItemId(item.id);
    setEditedScore(Number(item.score));
    setEditedFeedback(item.ai_feedback || '');
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const saveEdit = async (itemId: number) => {
    try {
      setIsSaving(true);
      const updated = await evaluationService.updateItemGrade(
        submission.id,
        itemId,
        editedScore,
        editedFeedback
      );
      onGradeUpdated(updated);
      setEditingItemId(null);
    } catch (err) {
      console.error('Error guardando calificación manual:', err);
      alert('Hubo un error al actualizar la calificación.');
    } finally {
      setIsSaving(false);
    }
  };

  const scorePercentage = Math.min(
    Math.round((Number(submission.total_score) / Number(submission.total_max_score || 20)) * 100),
    100
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-y-auto">
      {/* Student & Overall Grade Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                {submission.student_name || 'Estudiante No Identificado'}
              </h2>
              {submission.student_identifier && (
                <span className="text-xs bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                  {submission.student_identifier}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {submission.course_name} • {submission.exam_title}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-emerald-400">
              {submission.total_score}
              <span className="text-xs font-normal text-slate-400"> / {submission.total_max_score} pts</span>
            </div>
            <span className="text-[11px] text-slate-400">{scorePercentage}% de nota</span>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded mt-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded ${
              scorePercentage >= 70
                ? 'bg-emerald-500'
                : scorePercentage >= 50
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Questions Grading Breakdown */}
      <div className="p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Desglose de Calificación</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            {submission.graded_items?.length || 0} Preguntas
          </span>
        </div>

        {submission.graded_items && submission.graded_items.length > 0 ? (
          submission.graded_items.map((item) => {
            const isEditing = editingItemId === item.id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border transition ${
                  isEditing
                    ? 'bg-slate-800 border-blue-500'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Question Top Bar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700 px-2 py-0.5 rounded">
                      Pregunta #{item.question_number}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">[{item.question_type}]</span>
                    {item.is_manually_edited && (
                      <Badge variant="warning" className="text-[10px]">
                        <UserCheck className="w-3 h-3 mr-1 inline" /> Editado por Docente
                      </Badge>
                    )}
                  </div>

                  {/* Score pill or Score input */}
                  {isEditing ? (
                    <div className="flex items-center space-x-1.5">
                      <label className="text-xs text-slate-400">Nota:</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max={Number(item.max_score)}
                        value={editedScore}
                        onChange={(e) => setEditedScore(parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-blue-500 rounded px-1.5 py-0.5 text-xs font-bold text-white text-center focus:outline-none"
                      />
                      <span className="text-xs text-slate-400">/ {item.max_score} pts</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-emerald-400">
                        {item.score}{' '}
                        <span className="text-xs text-slate-400 font-normal">/ {item.max_score} pts</span>
                      </span>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                        title="Modificar calificación"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Detected response from student */}
                <div className="mb-2 bg-slate-900 p-2.5 rounded border border-slate-700 space-y-0.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
                    Texto Detectado (Manuscrito):
                  </span>
                  <p className="text-xs text-slate-200 font-mono">
                    {item.student_detected_response || '(No se detectó texto manuscrito)'}
                  </p>
                </div>

                {/* AI Feedback */}
                <div className="bg-slate-900 p-2.5 rounded border border-slate-700 space-y-0.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
                    Justificación y Feedback:
                  </span>

                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editedFeedback}
                      onChange={(e) => setEditedFeedback(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 mt-1"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">{item.ai_feedback}</p>
                  )}
                </div>

                {/* Edit Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-2 mt-2.5 pt-2 border-t border-slate-700">
                    <Button variant="secondary" size="sm" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isSaving}
                      onClick={() => saveEdit(item.id)}
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-40" />
            <p className="text-xs">No hay preguntas registradas para esta entrega.</p>
          </div>
        )}
      </div>
    </div>
  );
};

