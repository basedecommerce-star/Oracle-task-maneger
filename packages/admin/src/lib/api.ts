const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface DashboardStats {
  totalQuestions: number;
  pendingReview: number;
  activeConflicts: number;
  recentImports: number;
}

interface Question {
  id: string;
  text: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface Conflict {
  id: string;
  questionId: string;
  type: string;
  status: string;
  createdAt: string;
}

interface EvidenceBundle {
  id: string;
  questionId: string;
  sources: string[];
  createdAt: string;
}

interface ImportRecord {
  id: string;
  filename: string;
  status: string;
  totalRecords: number;
  processedRecords: number;
  createdAt: string;
}

interface Report {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: string;
}

interface ExamConfig {
  id: string;
  name: string;
  questionCount: number;
  timeLimit: number;
  passingScore: number;
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

export function getDashboardStats(token?: string): Promise<DashboardStats> {
  return fetchWithAuth<DashboardStats>('/admin/dashboard/stats', { token });
}

export function getQuestions(
  filters: QuestionFilters = {},
  token?: string
): Promise<PaginatedResponse<Question>> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.category) params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));

  const query = params.toString();
  return fetchWithAuth<PaginatedResponse<Question>>(
    `/admin/questions${query ? `?${query}` : ''}`,
    { token }
  );
}

export function getQuestion(id: string, token?: string): Promise<Question> {
  return fetchWithAuth<Question>(`/admin/questions/${encodeURIComponent(id)}`, { token });
}

export function updateQuestionStatus(
  id: string,
  status: string,
  token?: string
): Promise<Question> {
  return fetchWithAuth<Question>(`/admin/questions/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}

export function getReviewQueue(
  page = 1,
  token?: string
): Promise<PaginatedResponse<Question>> {
  return fetchWithAuth<PaginatedResponse<Question>>(
    `/admin/review?page=${page}`,
    { token }
  );
}

export function approveQuestion(id: string, token?: string): Promise<Question> {
  return fetchWithAuth<Question>(`/admin/review/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    token,
  });
}

export function rejectQuestion(
  id: string,
  reason: string,
  token?: string
): Promise<Question> {
  return fetchWithAuth<Question>(`/admin/review/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
    token,
  });
}

export function getConflicts(
  page = 1,
  token?: string
): Promise<PaginatedResponse<Conflict>> {
  return fetchWithAuth<PaginatedResponse<Conflict>>(
    `/admin/conflicts?page=${page}`,
    { token }
  );
}

export function resolveConflict(
  id: string,
  resolution: string,
  token?: string
): Promise<Conflict> {
  return fetchWithAuth<Conflict>(`/admin/conflicts/${encodeURIComponent(id)}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
    token,
  });
}

export function getEvidenceBundles(
  page = 1,
  token?: string
): Promise<PaginatedResponse<EvidenceBundle>> {
  return fetchWithAuth<PaginatedResponse<EvidenceBundle>>(
    `/admin/evidence?page=${page}`,
    { token }
  );
}

export function getImports(
  page = 1,
  token?: string
): Promise<PaginatedResponse<ImportRecord>> {
  return fetchWithAuth<PaginatedResponse<ImportRecord>>(
    `/admin/imports?page=${page}`,
    { token }
  );
}

export function getReports(
  page = 1,
  token?: string
): Promise<PaginatedResponse<Report>> {
  return fetchWithAuth<PaginatedResponse<Report>>(
    `/admin/reports?page=${page}`,
    { token }
  );
}

export function updateReportStatus(
  id: string,
  status: string,
  token?: string
): Promise<Report> {
  return fetchWithAuth<Report>(`/admin/reports/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}

export function getAuditLog(
  page = 1,
  token?: string
): Promise<PaginatedResponse<AuditLogEntry>> {
  return fetchWithAuth<PaginatedResponse<AuditLogEntry>>(
    `/admin/audit-log?page=${page}`,
    { token }
  );
}

export function getExamConfigs(token?: string): Promise<ExamConfig[]> {
  return fetchWithAuth<ExamConfig[]>('/admin/exam-configs', { token });
}

export function updateExamConfig(
  id: string,
  data: Partial<ExamConfig>,
  token?: string
): Promise<ExamConfig> {
  return fetchWithAuth<ExamConfig>(`/admin/exam-configs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}
