import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getDefaultConfigForCategory } from '../../config/exam-config.constants';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async startExam(userId: string, categoryCode: string) {
    const category = await this.prisma.category.findUnique({
      where: { code: categoryCode },
    });
    if (!category) {
      throw new NotFoundException(`Category ${categoryCode} not found`);
    }

    // Fetch exam config from DB (source of truth), fallback to constants
    const dbConfig = await this.prisma.examConfig.findFirst({
      where: {
        categoryId: category.id,
        activeTo: null,
      },
      orderBy: { activeFrom: 'desc' },
    });

    const defaults = getDefaultConfigForCategory(categoryCode);
    const totalQuestions = dbConfig?.totalQuestions ?? defaults.totalQuestions;
    const durationLimit = dbConfig?.durationSeconds ?? defaults.durationSeconds;

    // Select random published questions for this category
    const questions = await this.prisma.question.findMany({
      where: {
        isPublished: true,
        verificationStatus: { in: ['VERIFIED', 'PUBLISHED'] },
        categoryId: category.id,
      },
      include: {
        answers: {
          orderBy: { answerOrder: 'asc' },
          select: {
            id: true,
            answerOrder: true,
            answerText: true,
            // isCorrect omitted — exam mode never reveals correct answers
          },
        },
      },
    });

    // Shuffle and take required count
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalQuestions);

    const session = await this.prisma.session.create({
      data: {
        userId,
        sessionType: 'EXAM',
        categoryId: category.id,
        totalQuestions: selected.length,
        durationLimit,
        status: 'IN_PROGRESS',
        sessionQuestions: {
          create: selected.map((q, index) => ({
            questionId: q.id,
            questionOrder: index + 1,
          })),
        },
      },
      include: {
        sessionQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: {
              include: {
                answers: {
                  orderBy: { answerOrder: 'asc' },
                  select: {
                    id: true,
                    answerOrder: true,
                    answerText: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      sessionId: session.id,
      totalQuestions: session.totalQuestions,
      durationLimit: session.durationLimit,
      startedAt: session.startedAt,
      questions: session.sessionQuestions.map((sq) => ({
        sessionQuestionId: sq.id,
        questionOrder: sq.questionOrder,
        questionText: sq.question.questionText,
        imageAssetKey: sq.question.imageAssetKey,
        questionType: sq.question.questionType,
        answers: sq.question.answers,
      })),
    };
  }

  async submitAnswer(
    sessionId: string,
    body: { sessionQuestionId: string; answerIds: string[]; timeSpentMs?: number },
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is not in progress');
    }

    // Validate server-side time limit
    if (session.durationLimit) {
      const elapsed =
        (Date.now() - session.startedAt.getTime()) / 1000;
      if (elapsed > session.durationLimit) {
        await this.prisma.session.update({
          where: { id: sessionId },
          data: { status: 'TIMED_OUT', finishedAt: new Date() },
        });
        throw new BadRequestException('Exam time has expired');
      }
    }

    const sessionQuestion = await this.prisma.sessionQuestion.findUnique({
      where: { id: body.sessionQuestionId },
      include: {
        question: {
          include: { answers: true },
        },
      },
    });
    if (!sessionQuestion || sessionQuestion.sessionId !== sessionId) {
      throw new NotFoundException('Session question not found');
    }
    if (sessionQuestion.answeredAt) {
      throw new BadRequestException('Question already answered');
    }

    const correctAnswerIds = sessionQuestion.question.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id);

    const isCorrect =
      body.answerIds.length === correctAnswerIds.length &&
      body.answerIds.every((id) => correctAnswerIds.includes(id));

    await this.prisma.$transaction([
      this.prisma.sessionQuestion.update({
        where: { id: body.sessionQuestionId },
        data: {
          answeredAt: new Date(),
          isCorrect,
          timeSpentMs: body.timeSpentMs,
        },
      }),
      ...body.answerIds.map((answerId) =>
        this.prisma.sessionAnswer.create({
          data: {
            sessionQuestionId: body.sessionQuestionId,
            answerId,
          },
        }),
      ),
      this.prisma.session.update({
        where: { id: sessionId },
        data: {
          correctAnswers: { increment: isCorrect ? 1 : 0 },
          wrongAnswers: { increment: isCorrect ? 0 : 1 },
        },
      }),
    ]);

    // Exam mode: no hints, no correct answer reveal
    return { accepted: true };
  }

  async finishExam(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: { answers: true, category: true },
            },
            sessionAnswers: true,
          },
          orderBy: { questionOrder: 'asc' },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is not in progress');
    }

    // Determine pass/fail from DB config or defaults
    const category = await this.prisma.category.findUnique({
      where: { id: session.categoryId ?? '' },
    });
    const categoryCode = category?.code ?? 'B';
    const defaults = getDefaultConfigForCategory(categoryCode);

    const dbConfig = session.categoryId
      ? await this.prisma.examConfig.findFirst({
          where: { categoryId: session.categoryId, activeTo: null },
          orderBy: { activeFrom: 'desc' },
        })
      : null;

    const passThreshold =
      dbConfig?.passThresholdCorrect ?? defaults.passThresholdCorrect;

    const isPassed = session.correctAnswers >= passThreshold;

    const finishedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        isPassed,
        finishedAt: new Date(),
      },
    });

    // Update user question stats
    for (const sq of session.sessionQuestions) {
      if (sq.isCorrect !== null) {
        await this.prisma.userQuestionStat.upsert({
          where: {
            userId_questionId: {
              userId: session.userId,
              questionId: sq.questionId,
            },
          },
          update: {
            timesAnswered: { increment: 1 },
            timesCorrect: { increment: sq.isCorrect ? 1 : 0 },
            timesWrong: { increment: sq.isCorrect ? 0 : 1 },
            lastAnsweredAt: new Date(),
          },
          create: {
            userId: session.userId,
            questionId: sq.questionId,
            timesAnswered: 1,
            timesCorrect: sq.isCorrect ? 1 : 0,
            timesWrong: sq.isCorrect ? 0 : 1,
            lastAnsweredAt: new Date(),
          },
        });
      }
    }

    return {
      sessionId: finishedSession.id,
      status: finishedSession.status,
      isPassed,
      correctAnswers: finishedSession.correctAnswers,
      wrongAnswers: finishedSession.wrongAnswers,
      totalQuestions: finishedSession.totalQuestions,
      passThreshold,
      finishedAt: finishedSession.finishedAt,
      results: session.sessionQuestions.map((sq) => ({
        questionOrder: sq.questionOrder,
        questionId: sq.questionId,
        isCorrect: sq.isCorrect,
        selectedAnswerIds: sq.sessionAnswers.map((sa) => sa.answerId),
        correctAnswerIds: sq.question.answers
          .filter((a) => a.isCorrect)
          .map((a) => a.id),
      })),
    };
  }
}
