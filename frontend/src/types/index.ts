export type QuestionType = 'MULTIPLE_CHOICE' | 'LONG_ANSWER' | 'MATH_PROBABILITY';

export type SubmissionStatus = 'PENDING' | 'PROCESSING' | 'GRADED' | 'REVIEWED' | 'FAILED';

export interface QuestionCriteria {
  id: number;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  expected_answer_or_rubric: string;
  max_score: string | number;
  created_at: string;
}

export interface ExamTemplate {
  id: number;
  course: number;
  course_name: string;
  course_code: string;
  title: string;
  description: string;
  total_max_score: string | number;
  is_active: boolean;
  questions: QuestionCriteria[];
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  teacher_username?: string;
  exam_templates: ExamTemplate[];
  created_at: string;
}

export interface GradedItem {
  id: number;
  question_number: number;
  question_type: QuestionType;
  student_detected_response: string;
  expected_answer: string;
  score: string | number;
  max_score: string | number;
  ai_feedback: string;
  is_manually_edited: boolean;
  created_at: string;
}

export interface StudentSubmission {
  id: number;
  exam_template: number;
  exam_title: string;
  course_name: string;
  total_max_score: string | number;
  student_name: string;
  student_identifier: string;
  exam_image: string;
  exam_image_url: string | null;
  status: SubmissionStatus;
  total_score: string | number;
  language_detected: string;
  raw_ai_response?: any;
  graded_items: GradedItem[];
  created_at: string;
  updated_at: string;
}

export interface WebSocketEvent {
  event: 'evaluation_started' | 'evaluation_completed' | 'score_updated' | 'evaluation_failed';
  data: StudentSubmission;
}

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  title: string;
  badge_label: string;
  default_route: string;
  student_identifier?: string;
  department?: string;
  permissions: string[];
  token?: string;
}

export interface ServerHealthStatus {
  status: 'healthy' | 'unhealthy' | 'error' | 'connecting';
  service?: string;
  server_url: string;
  timestamp?: string;
  version?: string;
  websocket_url?: string;
  environment?: string;
  latency_ms?: number;
}

