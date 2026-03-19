import { getTelegramInitData } from "./telegram";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const initData = getTelegramInitData();
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.message || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),

  auth: {
    login: () => api.post<{ token: string; user: import("@/types").User }>("/auth/telegram"),
  },

  questions: {
    getByTicket: (ticketNumber: number) =>
      api.get<import("@/types").Question[]>(`/questions/ticket/${ticketNumber}`),
    getByTopic: (topicId: string) =>
      api.get<import("@/types").Question[]>(`/questions/topic/${topicId}`),
    getRandom: (category: string, count?: number) =>
      api.get<import("@/types").Question[]>(
        `/questions/random?category=${category}&count=${count || 20}`
      ),
    report: (questionId: string, reason: string) =>
      api.post(`/questions/${questionId}/report`, { reason }),
  },

  tickets: {
    list: (category: string) =>
      api.get<import("@/types").Ticket[]>(`/tickets?category=${category}`),
  },

  topics: {
    list: () => api.get<import("@/types").Topic[]>("/topics"),
  },

  exam: {
    start: (category: string) =>
      api.post<import("@/types").ExamSession>("/exam/start", { category }),
    submit: (examId: string, answers: { questionId: string; selectedOptionId: string }[]) =>
      api.post<import("@/types").ExamSession>(`/exam/${examId}/submit`, { answers }),
  },

  training: {
    answer: (questionId: string, selectedOptionId: string) =>
      api.post<{ isCorrect: boolean; correctOptionId: string }>(
        "/training/answer",
        { questionId, selectedOptionId }
      ),
  },

  mistakes: {
    list: () => api.get<import("@/types").MistakeEntry[]>("/mistakes"),
    clear: () => api.delete("/mistakes"),
  },

  stats: {
    get: () => api.get<import("@/types").UserStats>("/stats"),
  },

  rules: {
    search: (query: string) =>
      api.get<import("@/types").RuleArticle[]>(`/rules/search?q=${encodeURIComponent(query)}`),
    list: () => api.get<import("@/types").RuleArticle[]>("/rules"),
  },

  signs: {
    list: (category?: string) =>
      api.get<import("@/types").RoadSign[]>(
        `/signs${category ? `?category=${category}` : ""}`
      ),
  },

  user: {
    updateSettings: (settings: { language?: string; category?: string }) =>
      api.put<import("@/types").User>("/user/settings", settings),
  },
};
