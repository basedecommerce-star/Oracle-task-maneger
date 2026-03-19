import { Injectable } from '@nestjs/common';
import { ComplaintType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Only returns questions that are VERIFIED or PUBLISHED and isPublished = true.
   * Never serve unverified or AI-generated content without human review.
   */
  async findPublished(params: {
    categoryId?: string;
    topicId?: string;
    ticketNumber?: number;
    lang?: string;
    page?: number;
    limit?: number;
  }) {
    const { categoryId, topicId, ticketNumber, lang, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionWhereInput = {
      isPublished: true,
      verificationStatus: { in: ['VERIFIED', 'PUBLISHED'] },
      ...(categoryId && { categoryId }),
      ...(topicId && { topicId }),
      ...(ticketNumber && { ticketNumber }),
    };

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: {
          answers: {
            orderBy: { answerOrder: 'asc' },
            select: {
              id: true,
              answerOrder: true,
              answerText: true,
              // isCorrect intentionally omitted in listing to prevent cheating
            },
          },
          topic: true,
          translations: lang
            ? { where: { language: lang } }
            : false,
        },
        orderBy: [{ ticketNumber: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.question.count({ where }),
    ]);

    return { questions, total, page, limit };
  }

  async findByIdPublished(id: string) {
    return this.prisma.question.findFirst({
      where: {
        id,
        isPublished: true,
        verificationStatus: { in: ['VERIFIED', 'PUBLISHED'] },
      },
      include: {
        answers: { orderBy: { answerOrder: 'asc' } },
        topic: true,
        translations: true,
      },
    });
  }

  async reportQuestion(
    questionId: string,
    userId: string | undefined,
    complaintType: string,
    comment?: string,
  ) {
    if (!userId) {
      throw new Error('userId is required to report a question');
    }

    const validTypes: string[] = Object.values(ComplaintType);
    const resolvedType = validTypes.includes(complaintType)
      ? (complaintType as ComplaintType)
      : ComplaintType.OTHER;

    return this.prisma.questionReport.create({
      data: {
        questionId,
        userId,
        complaintType: resolvedType,
        comment,
        status: 'OPEN',
      },
    });
  }
}
