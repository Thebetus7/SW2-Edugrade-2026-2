'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Course, ExamTemplate } from '@/types';
import { examService } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  BookOpen,
  ListOrdered,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function ExamsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExamTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user?.role === 'STUDENT') {
        router.push('/my-exams');
        return;
      }
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [coursesData, templatesData] = await Promise.all([
          examService.getCourses(),
          examService.getTemplates(),
        ]);
        setCourses(coursesData);
        setTemplates(templatesData);
        if (templatesData.length > 0) {
          setSelectedTemplate(templatesData[0]);
        }
      } catch (err) {
        console.error('Error cargando cursos y plantillas:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (isAuthenticated && user?.role !== 'STUDENT') {
      loadData();
    }
  }, [isAuthenticated, user]);

  if (isAuthLoading || !isAuthenticated || user?.role === 'STUDENT') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 text-slate-400">
        <p className="text-xs font-medium">Cargando módulo de exámenes...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Gestión de Exámenes y Rúbricas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuración de enunciados y criterios oficiales para la evaluación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Plantillas Registradas ({templates.length})</span>
          </h2>

          <div className="space-y-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? 'border-blue-500 bg-slate-800'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-blue-400 uppercase">
                        {tpl.course_code || 'CURSO'}
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{tpl.title}</h3>
                    </div>
                    <Badge variant={tpl.is_active ? 'success' : 'default'}>
                      {tpl.is_active ? 'Activo' : 'Borrador'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                    {tpl.description || 'Sin descripción adicional.'}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{tpl.questions?.length || 0} Preguntas</span>
                    <span className="font-medium text-slate-300">Max: {tpl.total_max_score} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Template Questions & Criteria Details */}
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
            <span>Rúbrica Detallada</span>
          </h2>

          {selectedTemplate ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-700">
                <div>
                  <span className="text-xs text-blue-400 font-medium">{selectedTemplate.course_name}</span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedTemplate.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedTemplate.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Puntaje Total</span>
                  <div className="text-lg font-bold text-emerald-400">
                    {selectedTemplate.total_max_score} pts
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {selectedTemplate.questions && selectedTemplate.questions.length > 0 ? (
                  selectedTemplate.questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-lg bg-slate-900 border border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded">
                            Pregunta #{q.question_number}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">[{q.question_type}]</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">Max: {q.max_score} pts</span>
                      </div>

                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">
                          Enunciado:
                        </span>
                        <p className="text-xs text-slate-200 mt-0.5">{q.question_text}</p>
                      </div>

                      <div className="bg-slate-850 p-2.5 rounded border border-slate-750">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
                          Rúbrica de Evaluación / Criterio:
                        </span>
                        <p className="text-xs text-slate-300 font-mono">
                          {q.expected_answer_or_rubric}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <HelpCircle className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">Esta plantilla no tiene preguntas registradas.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-10 text-center text-slate-400">
              <p className="text-xs">Selecciona una plantilla para ver su rúbrica.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

