import axios from 'axios';
import { Course, ExamTemplate, StudentSubmission } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const examService = {
  getCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get('/exams/courses/');
    return response.data.results || response.data;
  },

  getTemplates: async (): Promise<ExamTemplate[]> => {
    const response = await apiClient.get('/exams/templates/');
    return response.data.results || response.data;
  },

  getTemplateById: async (id: number): Promise<ExamTemplate> => {
    const response = await apiClient.get(`/exams/templates/${id}/`);
    return response.data;
  },

  createTemplate: async (data: Partial<ExamTemplate>): Promise<ExamTemplate> => {
    const response = await apiClient.post('/exams/templates/', data);
    return response.data;
  },
};

export const authService = {
  checkHealth: async (): Promise<any> => {
    const startTime = Date.now();
    try {
      const response = await apiClient.get('/core/health/', { timeout: 4000 });
      const latency = Date.now() - startTime;
      return {
        ...response.data,
        status: 'healthy',
        latency_ms: latency,
      };
    } catch (err: any) {
      return {
        status: 'error',
        server_url: API_BASE_URL,
        error: err?.message || 'Error conectando con el servidor',
        latency_ms: Date.now() - startTime,
      };
    }
  },

  getDemoUsers: async () => {
    const response = await apiClient.get('/core/auth/users/');
    return response.data;
  },

  quickLogin: async (role: string) => {
    const response = await apiClient.post('/core/auth/quick-login/', { role });
    return response.data;
  },

  login: async (username: string, password?: string) => {
    const response = await apiClient.post('/core/auth/login/', { username, password });
    return response.data;
  },
};

export const evaluationService = {
  getSubmissions: async (params?: {
    exam_template_id?: number;
    student_identifier?: string;
    student_name?: string;
    search?: string;
    status?: string;
  }): Promise<StudentSubmission[]> => {
    const response = await apiClient.get('/evaluations/submissions/', { params });
    return response.data.results || response.data;
  },

  getSubmissionById: async (id: number): Promise<StudentSubmission> => {
    const response = await apiClient.get(`/evaluations/submissions/${id}/`);
    return response.data;
  },

  uploadExamScan: async (templateId: number, imageFile: File): Promise<StudentSubmission> => {
    const formData = new FormData();
    formData.append('exam_template_id', templateId.toString());
    formData.append('exam_image', imageFile);

    const response = await apiClient.post('/evaluations/submissions/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateItemGrade: async (
    submissionId: number,
    gradedItemId: number,
    score: number,
    aiFeedback?: string
  ): Promise<StudentSubmission> => {
    const response = await apiClient.post(`/evaluations/submissions/${submissionId}/update-grade/`, {
      graded_item_id: gradedItemId,
      score,
      ai_feedback: aiFeedback,
    });
    return response.data;
  },
};
export { API_BASE_URL };

