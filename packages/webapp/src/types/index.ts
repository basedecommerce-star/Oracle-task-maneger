export interface User {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode: string;
  category: VehicleCategory;
  createdAt: string;
  updatedAt: string;
}

export type VehicleCategory = "A" | "B" | "C" | "D" | "E";

export type Language = "ro" | "ru";

export interface Question {
  id: string;
  ticketNumber: number;
  questionNumber: number;
  topicId: string;
  category: VehicleCategory[];
  imageUrl?: string;
  text: string;
  options: AnswerOption[];
  explanation?: string;
  correctOptionId: string;
}

export interface AnswerOption {
  id: string;
  text: string;
}

export interface Ticket {
  id: string;
  number: number;
  category: VehicleCategory;
  questionCount: number;
  completedCount?: number;
  correctCount?: number;
}

export interface Topic {
  id: string;
  name: string;
  questionCount: number;
  completedCount?: number;
  correctCount?: number;
}

export interface ExamSession {
  id: string;
  userId: string;
  category: VehicleCategory;
  questions: Question[];
  answers: ExamAnswer[];
  startedAt: string;
  timeLimit: number;
  status: "in_progress" | "completed" | "expired";
  score?: number;
  passed?: boolean;
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface TrainingSession {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface UserStats {
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  examsPassed: number;
  examsFailed: number;
  totalExams: number;
  streakDays: number;
  topicProgress: TopicProgress[];
}

export interface TopicProgress {
  topicId: string;
  topicName: string;
  totalQuestions: number;
  answeredCorrectly: number;
  progress: number;
}

export interface MistakeEntry {
  question: Question;
  selectedOptionId: string;
  answeredAt: string;
}

export interface RoadSign {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: RoadSignCategory;
}

export type RoadSignCategory =
  | "warning"
  | "priority"
  | "prohibition"
  | "mandatory"
  | "informational"
  | "service"
  | "additional";

export interface RuleArticle {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  articleNumber: number;
  title: string;
  content: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MenuItem {
  title: string;
  icon: string;
  href: string;
  description: string;
  color: string;
}
