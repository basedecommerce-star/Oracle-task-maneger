import { getTelegramInitData } from "./telegram";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── Auth ──
export const auth = {
  /** Authenticate with Telegram initData, returns accessToken + user */
  loginWithTelegram: (initData: string) =>
    request<{ accessToken: string; user: import("../types").User }>(
      "/auth/telegram",
      {
        method: "POST",
        body: JSON.stringify({ initData }),
      },
    ),
};

// ── Categories ──
export const categories = {
  getAll: (mode?: 'training' | 'exam') => {
    const params = mode ? `?mode=${mode}` : '';
    return request<import("../types").Category[]>(`/categories${params}`);
  },
};

// ── Topics ──
export const topics = {
  getAll: () => request<import("../types").Topic[]>("/topics"),
};

// ── Questions ──
export const questions = {
  /** List published questions with filters */
  list: (params?: {
    categoryId?: string;
    topicId?: string;
    ticketNumber?: number;
    lang?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.topicId) query.set("topicId", params.topicId);
    if (params?.ticketNumber)
      query.set("ticketNumber", String(params.ticketNumber));
    if (params?.lang) query.set("lang", params.lang);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<import("../types").Question[]>(
      `/questions${qs ? `?${qs}` : ""}`,
    );
  },

  /** Report a question issue */
  report: (questionId: string, complaintType: string, comment?: string) =>
    request<void>(`/questions/${questionId}/report`, {
      method: "POST",
      body: JSON.stringify({ complaintType, comment }),
    }),
};

// ── Training ──
export const training = {
  /** Start a new training session */
  start: (params: {
    categoryCode?: string;
    topicId?: string;
    ticketNumber?: number;
    questionCount?: number;
  }) =>
    request<import("../types").TrainingSession>("/training/start", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  /** Submit an answer in training mode – server returns correctness */
  answer: (
    sessionId: string,
    sessionQuestionId: string,
    answerIds: string[],
    timeSpentMs?: number,
  ) =>
    request<import("../types").TrainingAnswerResponse>(
      `/training/${sessionId}/answer`,
      {
        method: "POST",
        body: JSON.stringify({ sessionQuestionId, answerIds, timeSpentMs }),
      },
    ),
};

// ── Exams ──
export const exams = {
  /** Start an exam session – server enforces time */
  start: (categoryCode: string) =>
    request<import("../types").ExamSession>("/exams/start", {
      method: "POST",
      body: JSON.stringify({ categoryCode }),
    }),

  /** Submit an answer during exam – no feedback returned */
  answer: (
    examId: string,
    sessionQuestionId: string,
    answerIds: string[],
    timeSpentMs?: number,
  ) =>
    request<import("../types").ExamAnswerResponse>(`/exams/${examId}/answer`, {
      method: "POST",
      body: JSON.stringify({ sessionQuestionId, answerIds, timeSpentMs }),
    }),

  /** Finish exam – returns results */
  finish: (examId: string) =>
    request<import("../types").ExamResult>(`/exams/${examId}/finish`, {
      method: "POST",
    }),
};

// ── Tickets ──
export const tickets = {
  list: (categoryCode?: string) => {
    const params = categoryCode ? `?categoryCode=${categoryCode}` : "";
    return request<import("../types").Ticket[]>(`/tickets${params}`);
  },
};

// ── Stats ──
export const stats = {
  getOverview: () =>
    request<import("../types").UserStats>("/stats/overview"),
};

// ── Mistakes ──
export const mistakes = {
  list: () => request<import("../types").MistakeEntry[]>("/mistakes"),
  clear: () => request<void>("/mistakes", { method: "DELETE" }),
};

// ── Rules ──
export const rules = {
  search: (query: string, lang?: string) => {
    const params = new URLSearchParams({ q: query });
    if (lang) params.set("lang", lang);
    return request<import("../types").RuleArticle[]>(
      `/rules/search?${params}`,
    );
  },
  list: (lang?: string) => {
    const params = lang ? `?lang=${lang}` : "";
    return request<import("../types").RuleArticle[]>(`/rules${params}`);
  },
};

// ── Signs ──
export const signs = {
  getAll: (type?: string) => {
    const params = type ? `?type=${type}` : "";
    return request<import("../types").RoadSign[]>(`/signs${params}`);
  },
};

// ── User settings ──
export const user = {
  getMe: () => request<import("../types").User>("/me"),
  updateSettings: (settings: {
    languageCode?: string;
    categoryId?: string;
  }) =>
    request<import("../types").User>("/me/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    }),
};

export const api = {
  auth,
  categories,
  topics,
  questions,
  training,
  exams,
  tickets,
  stats,
  mistakes,
  rules,
  signs,
  user,
};

export default api;
