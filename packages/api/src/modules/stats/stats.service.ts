import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId?: string) {
    const userFilter = userId ? { userId } : {};

    const [questionStats, topicStats, recentSessions] = await Promise.all([
      this.prisma.userQuestionStat.aggregate({
        where: userFilter,
        _sum: {
          timesAnswered: true,
          timesCorrect: true,
          timesWrong: true,
        },
      }),

      this.prisma.userQuestionStat.findMany({
        where: userFilter,
        include: {
          question: {
            include: { topic: true },
          },
        },
      }),

      this.prisma.session.findMany({
        where: userFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          sessionType: true,
          totalQuestions: true,
          correctAnswers: true,
          isPassed: true,
          createdAt: true,
        },
      }),
    ]);

    const totalAnswered = questionStats._sum.timesAnswered ?? 0;
    const totalCorrect = questionStats._sum.timesCorrect ?? 0;
    const totalWrong = questionStats._sum.timesWrong ?? 0;
    const correctRate =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    // Aggregate stats by topic
    const topicMap = new Map<
      string,
      { topicId: string; topicName: string; answered: number; correct: number }
    >();
    for (const stat of topicStats) {
      const topicId = stat.question.topicId ?? 'unknown';
      const topicName =
        stat.question.topic?.nameRu ?? stat.question.topic?.nameRo ?? 'Unknown';
      const existing = topicMap.get(topicId);
      if (existing) {
        existing.answered += stat.timesAnswered;
        existing.correct += stat.timesCorrect;
      } else {
        topicMap.set(topicId, {
          topicId,
          topicName,
          answered: stat.timesAnswered,
          correct: stat.timesCorrect,
        });
      }
    }

    return {
      totalAnswered,
      totalCorrect,
      totalWrong,
      correctRate,
      byTopic: Array.from(topicMap.values()),
      recentSessions: recentSessions.map((s) => ({
        sessionId: s.id,
        sessionType: s.sessionType,
        totalQuestions: s.totalQuestions,
        correctAnswers: s.correctAnswers,
        isPassed: s.isPassed,
        createdAt: s.createdAt.toISOString(),
      })),
    };
  }
}
