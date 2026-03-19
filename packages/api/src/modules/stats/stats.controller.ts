import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async getOverview(@Query('userId') userId?: string) {
    // userId will come from JWT/auth context in production;
    // accepted as optional query param for now
    return this.statsService.getOverview(userId);
  }
}
