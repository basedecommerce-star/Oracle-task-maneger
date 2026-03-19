import { Controller, Post, Param, Body } from '@nestjs/common';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('start')
  async startTraining(
    @Body()
    body: {
      userId: string;
      categoryCode?: string;
      topicId?: string;
      ticketNumber?: number;
      questionCount?: number;
    },
  ) {
    return this.trainingService.startTraining(body);
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
