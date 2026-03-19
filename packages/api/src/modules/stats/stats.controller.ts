import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async getOverview(@Query('userId') userId: string) {
    return this.statsService.getOverview(userId);
  }
}
