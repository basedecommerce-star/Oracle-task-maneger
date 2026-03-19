const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

// --- Response types matching backend ---

export interface StatsOverview {
  totalSessions: number;
  trainingSessions: number;
  exams: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
  questions: {
    uniqueAnswered: number;
    totalAnswered: number;
    totalCorrect: number;
    totalWrong: number;
    correctRate: number;
  };
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  examConfigs: ExamConfig[];
}

export interface ExamConfig {
  id: string;
  categoryId: string;
  timeLimit: number;
  totalQuestions: number;
  passingScore: number;
  activeTo: string | null;
}

export interface Topic {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  categoryId: string;
}

export interface QuestionTranslation {
  language: string;
  questionText: string;
}

export interface QuestionAnswer {
  id: string;
  answerOrder: number;
  answerText: string;
}

export interface Question {
  id: string;
  ticketNumber: number;
  verificationStatus: string;
  isPublished: boolean;
  answers: QuestionAnswer[];
  topic: {
    id: string;
    name: string;
    code: string;
    sortOrder: number;
  };
  translations: QuestionTranslation[];
}

export interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
}

export interface QuestionFilters {
  categoryId?: string;
  topicId?: string;
  ticketNumber?: number;
  lang?: string;
  page?: number;
  limit?: number;
  verificationStatus?: string;
}

export interface ParserRun {
  id: string;
  snapshotId: string;
  parserType: string;
  parserVersion: string;
  status: string;
}

export interface ConflictOutput {
  id: string;
  parserRun: ParserRun;
}

export interface Conflict {
  id: string;
  isConflict: boolean;
  resolvedAt: string | null;
  outputA: ConflictOutput;
  outputB: ConflictOutput;
  createdAt: string;
}

export interface EvidenceBundle {
  id: string;
  [key: string]: unknown;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// --- Stats ---

export function getStatsOverview(token?: string): Promise<StatsOverview> {
  return fetchWithAuth<StatsOverview>('/stats/overview', { token });
}

// --- Categories & Exam Configs ---

export function getCategories(token?: string): Promise<Category[]> {
  return fetchWithAuth<Category[]>('/categories', { token });
}

// --- Topics ---

export function getTopics(token?: string): Promise<Topic[]> {
  return fetchWithAuth<Topic[]>('/topics', { token });
}

// --- Questions ---

export function getQuestions(
  filters: QuestionFilters = {},
  token?: string
): Promise<QuestionsResponse> {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.topicId) params.set('topicId', filters.topicId);
  if (filters.ticketNumber) params.set('ticketNumber', String(filters.ticketNumber));
  if (filters.lang) params.set('lang', filters.lang);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.verificationStatus) params.set('verificationStatus', filters.verificationStatus);

  const query = params.toString();
  return fetchWithAuth<QuestionsResponse>(
    `/questions${query ? `?${query}` : ''}`,
    { token }
  );
}

// --- Admin: Import ---

export function importSourceSnapshot(
  data: {
    sourceProviderId: string;
    sourceUrl: string;
    sourceType: string;
    rawContent?: string;
    storageKey?: string;
    screenshotKey?: string;
    parserVersion: string;
    adminUserId: string;
  },
  token?: string
): Promise<unknown> {
  return fetchWithAuth('/admin/import/source-snapshot', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

// --- Admin: Parser ---

export function runParser(
  data: { snapshotId: string; parserType: string },
  token?: string
): Promise<{ parserRunId: string; status: string }> {
  return fetchWithAuth('/admin/parser/run', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

// --- Admin: Conflicts ---

export function getConflicts(token?: string): Promise<Conflict[]> {
  return fetchWithAuth<Conflict[]>('/admin/conflicts', { token });
}

// --- Admin: Question moderation ---

export function approveQuestion(
  id: string,
  moderatorId: string,
  comment?: string,
  token?: string
): Promise<Question> {
  return fetchWithAuth<Question>(`/admin/questions/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify({ moderatorId, comment }),
    token,
  });
}

export function rejectQuestion(
  id: string,
  moderatorId: string,
  comment?: string,
  token?: string
): Promise<Question> {
  return fetchWithAuth<Question>(`/admin/questions/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ moderatorId, comment }),
    token,
  });
}

export function publishQuestion(
  id: string,
  moderatorId: string,
  token?: string
): Promise<Question> {
  return fetchWithAuth<Question>(`/admin/questions/${encodeURIComponent(id)}/publish`, {
    method: 'POST',
    body: JSON.stringify({ moderatorId }),
    token,
  });
}

// --- Admin: Evidence ---

export function getEvidence(id: string, token?: string): Promise<EvidenceBundle> {
  return fetchWithAuth<EvidenceBundle>(`/admin/evidence/${encodeURIComponent(id)}`, { token });
}
