export interface StatsSummaryCard {
  id: 'answered' | 'correct' | 'wrong' | 'accuracy' | 'streak';
  title: string;
  value: string;
}

export interface StatsScreenModel {
  title: string;
  subtitle: string;
  summaryCards: StatsSummaryCard[];
}

export function buildStatsScreenModel(input: {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
  streakDays: number;
}): StatsScreenModel {
  return {
    title: 'Statistics',
    subtitle: 'Review your overall learning progress and recent performance.',
    summaryCards: [
      {
        id: 'answered',
        title: 'Answered',
        value: String(input.totalAnswered),
      },
      {
        id: 'correct',
        title: 'Correct',
        value: String(input.totalCorrect),
      },
      {
        id: 'wrong',
        title: 'Wrong',
        value: String(input.totalWrong),
      },
      {
        id: 'accuracy',
        title: 'Accuracy',
        value: `${input.accuracyPercent}%`,
      },
      {
        id: 'streak',
        title: 'Streak',
        value: `${input.streakDays} days`,
      },
    ],
  };
}
