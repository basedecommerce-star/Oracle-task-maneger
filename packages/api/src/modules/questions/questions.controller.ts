import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
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
    @Body() body: { userId: string; complaintType: string; comment?: string },
  ) {
    return this.questionsService.reportQuestion(
      id,
      body.userId,
      body.complaintType,
      body.comment,
    );
  }
}
