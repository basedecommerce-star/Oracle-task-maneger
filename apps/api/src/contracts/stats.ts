export interface StatsOverviewDto {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
  streakDays: number;
}

export interface StatsByCategoryItemDto {
  category: string;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
}

export interface StatsByTopicItemDto {
  topicId: string;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
}

export interface SessionHistoryItemDto {
  sessionId: string;
  category: string;
  mode: 'training' | 'exam';
  correctAnswers: number;
  wrongAnswers: number;
  passed?: boolean;
  startedAt: string;
  finishedAt?: string;
}
