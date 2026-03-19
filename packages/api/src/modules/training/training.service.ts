import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async startTraining(params: {
    userId?: string;
    categoryCode?: string;
    topicId?: string;
    ticketNumber?: number;
    questionCount?: number;
  }) {
    const { userId, categoryCode, topicId, ticketNumber, questionCount = 20 } = params;
    if (!userId) throw new BadRequestException('userId is required');

    const where: Prisma.QuestionWhereInput = {
      isPublished: true,
      verificationStatus: { in: ['VERIFIED', 'PUBLISHED'] },
    };

    let categoryId: string | undefined;
    if (categoryCode) {
      const category = await this.prisma.category.findUnique({
        where: { code: categoryCode },
      });
      if (!category) throw new NotFoundException(`Category ${categoryCode} not found`);
      categoryId = category.id;
      where.categoryId = category.id;
    }
    if (topicId) where.topicId = topicId;
    if (ticketNumber) where.ticketNumber = ticketNumber;

    const questions = await this.prisma.question.findMany({
      where,
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
    });

    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);

    const session = await this.prisma.session.create({
      data: {
        userId,
        sessionType: 'TRAINING',
        categoryId: categoryId ?? null,
        topicId: topicId ?? null,
        ticketNumber: ticketNumber ?? null,
        totalQuestions: selected.length,
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

  /**
   * In training mode, answering reveals the correct answer + explanation.
   */
  async submitAnswer(
    sessionId: string,
    body: { sessionQuestionId: string; answerIds: string[]; timeSpentMs?: number },
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.sessionType !== 'TRAINING') {
      throw new BadRequestException('Not a training session');
    }
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is not in progress');
    }

    const sessionQuestion = await this.prisma.sessionQuestion.findUnique({
      where: { id: body.sessionQuestionId },
      include: {
        question: {
          include: {
            answers: { orderBy: { answerOrder: 'asc' } },
          },
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

    // Update user stats
    await this.prisma.userQuestionStat.upsert({
      where: {
        userId_questionId: {
          userId: session.userId,
          questionId: sessionQuestion.questionId,
        },
      },
      update: {
        timesAnswered: { increment: 1 },
        timesCorrect: { increment: isCorrect ? 1 : 0 },
        timesWrong: { increment: isCorrect ? 0 : 1 },
        lastAnsweredAt: new Date(),
      },
      create: {
        userId: session.userId,
        questionId: sessionQuestion.questionId,
        timesAnswered: 1,
        timesCorrect: isCorrect ? 1 : 0,
        timesWrong: isCorrect ? 0 : 1,
        lastAnsweredAt: new Date(),
      },
    });

    // Training mode: reveal correct answer + explanation
    return {
      isCorrect,
      correctAnswerIds,
      explanationText: sessionQuestion.question.explanationText,
      ruleReference: sessionQuestion.question.ruleReference,
      answers: sessionQuestion.question.answers.map((a) => ({
        id: a.id,
        answerText: a.answerText,
        isCorrect: a.isCorrect,
      })),
    };
  }
}
