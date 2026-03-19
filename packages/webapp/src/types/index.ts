// ── Category types matching auto-test.online Moldova ──
// Training categories: AB, C, D, E, F
// Exam categories: AB, BE, C, CE, D, DE, F
export type TrainingCategory = 'AB' | 'C' | 'D' | 'E' | 'F';
export type ExamCategory = 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
export type CategoryCode = TrainingCategory | ExamCategory;

export const TRAINING_CATEGORIES: TrainingCategory[] = ['AB', 'C', 'D', 'E', 'F'];
export const EXAM_CATEGORIES: ExamCategory[] = ['AB', 'BE', 'C', 'CE', 'D', 'DE', 'F'];

export type Language = 'ro' | 'ru';

export interface User {
  id: string;
  telegramId: number;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  languageCode: string;
  preferredLang: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  code: CategoryCode;
  nameRu: string;
  nameRo: string;
  sortOrder: number;
  availableForTraining: boolean;
  availableForExam: boolean;
}

export interface ExamConfig {
  id: string;
  categoryId: string;
  totalQuestions: number;
  durationSeconds: number;
  passThresholdCorrect: number;
  maxErrors: number;
  verified: boolean;
}

export interface Topic {
  id: string;
  code: string;
  nameRu: string;
  nameRo: string;
  sortOrder: number;
  questionCount?: number;
}

// Questions - NO correctOptionId exposed to prevent client-side cheating
export interface Answer {
  id: string;
  answerOrder: number;
  answerText: string;
  // isCorrect is ONLY returned in training mode after answering
}

export interface Question {
  id: string;
  questionText: string;
  imageAssetKey: string | null;
  questionType: 'SINGLE' | 'MULTIPLE';
  ticketNumber: number | null;
  topicId: string | null;
  categoryId: string | null;
  language: string;
  answers: Answer[];
  // Only shown in training mode after answering
  explanationText?: string;
  ruleReference?: string;
}

// Training session types
export interface TrainingSession {
  sessionId: string;
  totalQuestions: number;
  questions: TrainingQuestion[];
}

export interface TrainingQuestion {
  sessionQuestionId: string;
  questionOrder: number;
  questionText: string;
  imageAssetKey: string | null;
  questionType: 'SINGLE' | 'MULTIPLE';
  answers: Answer[];
}

export interface TrainingAnswerResponse {
  isCorrect: boolean;
  correctAnswerIds: string[];
  explanationText: string | null;
  ruleReference: string | null;
}

// Exam session types
export interface ExamSession {
  sessionId: string;
  totalQuestions: number;
  durationLimit: number; // seconds from server
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  sessionQuestionId: string;
  questionOrder: number;
  questionText: string;
  imageAssetKey: string | null;
  questionType: 'SINGLE' | 'MULTIPLE';
  answers: Answer[]; // NO isCorrect field
}

export interface ExamAnswerResponse {
  accepted: boolean;
}

export interface ExamResult {
  sessionId: string;
  status: string;
  isPassed: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  passThreshold: number;
  results: ExamResultDetail[];
}

export interface ExamResultDetail {
  questionOrder: number;
  questionText: string;
  isCorrect: boolean;
  selectedAnswerIds: string[];
  correctAnswerIds: string[];
  explanationText: string | null;
}

export interface Ticket {
  ticketNumber: number;
  category: string;
  questionCount: number;
}

export interface MistakeEntry {
  questionId: string;
  questionText: string;
  selectedAnswerIds: string[];
  correctAnswerIds: string[];
  answeredAt: string;
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  correctRate: number;
  byTopic: TopicStat[];
  recentSessions: SessionSummary[];
}

export interface TopicStat {
  topicId: string;
  topicName: string;
  answered: number;
  correct: number;
}

export interface SessionSummary {
  sessionId: string;
  sessionType: 'TRAINING' | 'EXAM';
  totalQuestions: number;
  correctAnswers: number;
  isPassed: boolean | null;
  createdAt: string;
}

export interface RuleArticle {
  id: string;
  chapterCode: string;
  articleCode: string;
  title: string;
  content: string;
}

export interface RoadSign {
  id: string;
  signCode: string;
  signType: string;
  imageKey: string | null;
  name: string;
  description: string | null;
}

export type ReportReason =
  | 'WRONG_ANSWER'
  | 'WRONG_TEXT'
  | 'WRONG_IMAGE'
  | 'OUTDATED'
  | 'OTHER';

// ── UI-only types ──
export interface MenuItem {
  title: string;
  icon: string;
  href: string;
  description: string;
  color: string;
}
