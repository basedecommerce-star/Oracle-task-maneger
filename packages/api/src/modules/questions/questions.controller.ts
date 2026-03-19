import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async findPublished(
    @Query('categoryId') categoryId?: string,
    @Query('topicId') topicId?: string,
    @Query('ticketNumber') ticketNumber?: string,
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questionsService.findPublished({
      categoryId,
      topicId,
      ticketNumber: ticketNumber ? parseInt(ticketNumber, 10) : undefined,
      lang,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post(':id/report')
  async reportQuestion(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Body() body?: { complaintType: string; comment?: string; userId?: string },
  ) {
    // userId from auth context (query param for now), fallback to body
    const resolvedUserId = userId ?? body?.userId;
    return this.questionsService.reportQuestion(
      id,
      resolvedUserId,
      body?.complaintType ?? '',
      body?.comment,
    );
  }
}
