import { Controller, Get, Query } from '@nestjs/common';
import { RulesService } from './rules.service';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get('search')
  async search(
    @Query('query') query?: string,
    @Query('chapterCode') chapterCode?: string,
    @Query('lang') lang?: string,
  ) {
    return this.rulesService.search({ query, chapterCode, lang });
  }
}
