import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const [
      totalSessions,
      examSessions,
      trainingSessions,
      questionStats,
      recentExams,
    ] = await Promise.all([
      this.prisma.session.count({ where: { userId } }),
      this.prisma.session.findMany({
        where: { userId, sessionType: 'EXAM', status: 'COMPLETED' },
        select: { isPassed: true, correctAnswers: true, totalQuestions: true },
      }),
      this.prisma.session.count({
        where: { userId, sessionType: 'TRAINING' },
      }),
      this.prisma.userQuestionStat.aggregate({
        where: { userId },
        _sum: {
          timesAnswered: true,
          timesCorrect: true,
          timesWrong: true,
        },
        _count: true,
      }),
      this.prisma.session.findMany({
        where: { userId, sessionType: 'EXAM', status: 'COMPLETED' },
        orderBy: { finishedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          isPassed: true,
          correctAnswers: true,
          wrongAnswers: true,
          totalQuestions: true,
          startedAt: true,
          finishedAt: true,
        },
      }),
    ]);

    const examsPassed = examSessions.filter((e) => e.isPassed).length;
    const examsFailed = examSessions.filter(
      (e) => e.isPassed === false,
    ).length;

    return {
      totalSessions,
      trainingSessions,
      exams: {
        total: examSessions.length,
        passed: examsPassed,
        failed: examsFailed,
        passRate:
          examSessions.length > 0
            ? Math.round((examsPassed / examSessions.length) * 100)
            : 0,
      },
      questions: {
        uniqueAnswered: questionStats._count,
        totalAnswered: questionStats._sum.timesAnswered ?? 0,
        totalCorrect: questionStats._sum.timesCorrect ?? 0,
        totalWrong: questionStats._sum.timesWrong ?? 0,
        correctRate:
          (questionStats._sum.timesAnswered ?? 0) > 0
            ? Math.round(
                ((questionStats._sum.timesCorrect ?? 0) /
                  (questionStats._sum.timesAnswered ?? 0)) *
                  100,
              )
            : 0,
      },
      recentExams,
    };
  }
}
