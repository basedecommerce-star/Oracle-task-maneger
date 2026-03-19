import { Controller, Post, Param, Body } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('start')
  async startExam(
    @Body() body: { userId: string; categoryCode: string },
  ) {
    return this.examsService.startExam(body.userId, body.categoryCode);
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
