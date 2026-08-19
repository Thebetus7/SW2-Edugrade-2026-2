'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StudentSubmission } from '@/types';
import { evaluationService } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  Search,
  FileText,
  HelpCircle,
  Eye,
  Award,
  BookOpen,
  User,
  Calendar,
} from 'lucide-react';

export default function MyExamsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (user?.role === 'STUDENT' && user.student_identifier) {
        params.student_identifier = user.student_identifier;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const data = await evaluationService.getSubmissions(params);
      setSubmissions(data);
      if (data.length > 0 && !selectedSubmission) {
        setSelectedSubmission(data[0]);
      }
    } catch (err) {
      console.error('Error cargando examenes del estudiante:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSubmissions();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {user?.role === 'STUDENT' ? 'Mis Exámenes y Calificaciones' : 'Auditoría de Entregas y Evaluaciones'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.role === 'STUDENT'
                ? `Expediente: ${user.full_name} (${user.student_identifier || 'EST-2026'})`
                : 'Revisión de evaluaciones procesadas con IA'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por curso o examen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-60"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Buscar
          </Button>
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List of Student Submissions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Evaluaciones ({submissions.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-slate-500 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-xs font-medium">Cargando evaluaciones...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-800 border border-slate-700 rounded-lg">
              <HelpCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No se encontraron exámenes registrados.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {submissions.map((sub) => {
                const isSelected = selectedSubmission?.id === sub.id;
                const score = Number(sub.total_score || 0);
                const maxScore = Number(sub.total_max_score || 20);
                const percentage = Math.round((score / (maxScore || 1)) * 100);
                const isPassed = percentage >= 55;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-slate-800'
                        : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">
                          {sub.course_name || 'CURSO'}
                        </span>
                        <h3 className="text-xs font-semibold text-white mt-0.5">{sub.exam_title}</h3>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{sub.student_name || 'Estudiante'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-bold ${
                            isPassed ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {score.toFixed(1)} / {maxScore.toFixed(0)}
                        </div>
                        <Badge
                          variant={
                            sub.status === 'REVIEWED'
                              ? 'success'
                              : sub.status === 'GRADED'
                              ? 'info'
                              : 'warning'
                          }
                          className="mt-1"
                        >
                          {sub.status === 'REVIEWED'
                            ? 'Aprobado Docente'
                            : sub.status === 'GRADED'
                            ? 'Evaluado IA'
                            : 'En Proceso'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-slate-300 font-medium">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Detailed Exam View & Rubric Feedback */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>Desglose de Calificación</span>
          </h2>

          {selectedSubmission ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-5">
              {/* Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-700 gap-3">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-medium text-blue-400 uppercase">
                      {selectedSubmission.course_name}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{selectedSubmission.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {selectedSubmission.exam_title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Alumno:{' '}
                    <span className="text-slate-200 font-medium">
                      {selectedSubmission.student_name || 'No especificado'}
                    </span>{' '}
                    ({selectedSubmission.student_identifier || 'S/C'})
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Nota Final
                    </span>
                    <div className="text-xl font-bold text-emerald-400">
                      {Number(selectedSubmission.total_score).toFixed(2)} pts
                    </div>
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {Math.round(
                      (Number(selectedSubmission.total_score) /
                        (Number(selectedSubmission.total_max_score) || 1)) *
                        100
                    )}
                    %
                  </div>
                </div>
              </div>

              {/* Scanned Image Preview if available */}
              {selectedSubmission.exam_image_url && (
                <div className="rounded-lg border border-slate-700 p-3 bg-slate-900 space-y-2">
                  <span className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Hoja de Examen Escaneada</span>
                  </span>
                  <div className="max-h-60 overflow-hidden rounded border border-slate-700 bg-slate-950 flex items-center justify-center">
                    <img
                      src={selectedSubmission.exam_image_url}
                      alt="Examen Escaneado"
                      className="max-h-60 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Question-by-Question Graded Items */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <span>Preguntas Evaluadas ({selectedSubmission.graded_items?.length || 0})</span>
                </h3>

                {selectedSubmission.graded_items && selectedSubmission.graded_items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSubmission.graded_items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium">
                              Pregunta #{item.question_number}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              [{item.question_type}]
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs text-slate-400">Puntaje:</span>
                            <span className="text-xs font-bold text-emerald-400">
                              {Number(item.score).toFixed(1)} / {Number(item.max_score).toFixed(1)} pts
                            </span>
                          </div>
                        </div>

                        {/* Student OCR Response */}
                        <div className="p-2.5 rounded bg-slate-850 border border-slate-750 space-y-0.5">
                          <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                            Respuesta detectada:
                          </span>
                          <p className="text-xs text-slate-200">
                            {item.student_detected_response || 'Respuesta vacía o no legible.'}
                          </p>
                        </div>

                        {/* Official Rubric */}
                        <div className="p-2.5 rounded bg-slate-850 border border-slate-750 space-y-0.5">
                          <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                            Rúbrica esperada:
                          </span>
                          <p className="text-xs text-slate-300 font-mono">
                            {item.expected_answer || 'Criterio oficial'}
                          </p>
                        </div>

                        {/* AI Feedback */}
                        {item.ai_feedback && (
                          <div className="p-2.5 rounded bg-slate-850 border border-slate-750 space-y-0.5">
                            <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                              Retroalimentación:
                            </span>
                            <p className="text-xs text-slate-300">{item.ai_feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    <p className="text-xs">No hay ítems registrados para este examen.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-xs">Selecciona un examen de la lista para ver el desglose.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

