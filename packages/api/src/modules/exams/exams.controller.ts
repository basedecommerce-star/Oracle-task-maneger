import { Controller, Post, Param, Body, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('start')
  async startExam(
    @Query('userId') userId?: string,
    @Body() body?: { categoryCode: string; userId?: string },
  ) {
    // userId from auth context (query param for now), fallback to body
    const resolvedUserId = userId ?? body?.userId;
    return this.examsService.startExam(resolvedUserId, body?.categoryCode ?? '');
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
    return this.examsService.submitAnswer(sessionId, body);
  }

  @Post(':id/finish')
  async finishExam(@Param('id') sessionId: string) {
    return this.examsService.finishExam(sessionId);
  }
}
