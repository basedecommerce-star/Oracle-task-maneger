export interface UserAnswerStatsRecord {
  category: string;
  topicId?: string;
  isCorrect: boolean;
}

export interface SessionHistoryRecord {
  sessionId: string;
  category: string;
  mode: 'training' | 'exam';
  correctAnswers: number;
  wrongAnswers: number;
  passed?: boolean;
  startedAt: Date;
  finishedAt?: Date;
}

export interface StatsOverview {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
  streakDays: number;
}

export interface StatsByCategoryItem {
  category: string;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
}

export interface StatsByTopicItem {
  topicId: string;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
}

function toAccuracy(totalCorrect: number, totalAnswered: number): number {
  if (totalAnswered === 0) return 0;
  return Math.round((totalCorrect / totalAnswered) * 10000) / 100;
}

export function buildStatsOverview(records: UserAnswerStatsRecord[], streakDays: number): StatsOverview {
  const totalAnswered = records.length;
  const totalCorrect = records.filter((record) => record.isCorrect).length;
  const totalWrong = totalAnswered - totalCorrect;

  return {
    totalAnswered,
    totalCorrect,
    totalWrong,
    accuracyPercent: toAccuracy(totalCorrect, totalAnswered),
    streakDays,
  };
}

export function buildStatsByCategory(records: UserAnswerStatsRecord[]): StatsByCategoryItem[] {
  const grouped = new Map<string, UserAnswerStatsRecord[]>();

  for (const record of records) {
    const bucket = grouped.get(record.category) ?? [];
    bucket.push(record);
    grouped.set(record.category, bucket);
  }

  return [...grouped.entries()].map(([category, bucket]) => {
    const totalAnswered = bucket.length;
    const totalCorrect = bucket.filter((item) => item.isCorrect).length;
    const totalWrong = totalAnswered - totalCorrect;

    return {
      category,
      totalAnswered,
      totalCorrect,
      totalWrong,
      accuracyPercent: toAccuracy(totalCorrect, totalAnswered),
    };
  });
}

export function buildStatsByTopic(records: UserAnswerStatsRecord[]): StatsByTopicItem[] {
  const grouped = new Map<string, UserAnswerStatsRecord[]>();

  for (const record of records) {
    if (!record.topicId) continue;
    const bucket = grouped.get(record.topicId) ?? [];
    bucket.push(record);
    grouped.set(record.topicId, bucket);
  }

  return [...grouped.entries()].map(([topicId, bucket]) => {
    const totalAnswered = bucket.length;
    const totalCorrect = bucket.filter((item) => item.isCorrect).length;
    const totalWrong = totalAnswered - totalCorrect;

    return {
      topicId,
      totalAnswered,
      totalCorrect,
      totalWrong,
      accuracyPercent: toAccuracy(totalCorrect, totalAnswered),
    };
  });
}

export function buildSessionHistory(records: SessionHistoryRecord[]): SessionHistoryRecord[] {
  return [...records].sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime());
}
