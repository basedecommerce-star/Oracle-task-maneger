import { Controller, Post, Param, Body, Query } from '@nestjs/common';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('start')
  async startTraining(
    @Query('userId') userId?: string,
    @Body()
    body?: {
      categoryCode?: string;
      topicId?: string;
      ticketNumber?: number;
      questionCount?: number;
      userId?: string;
    },
  ) {
    // userId from auth context (query param for now), fallback to body
    const resolvedUserId = userId ?? body?.userId;
    return this.trainingService.startTraining({
      userId: resolvedUserId,
      categoryCode: body?.categoryCode,
      topicId: body?.topicId,
      ticketNumber: body?.ticketNumber,
      questionCount: body?.questionCount,
    });
  }

  @Post(':id/answer')
  async submitAnswer(
    @Param('id') sessionId: string,
    @Body()
    body: {
      sessionQuestionId: string;
      answerIds: string[];
      timeSpentMs?: number;
    },
  ) {
    return this.trainingService.submitAnswer(sessionId, body);
  }
}
