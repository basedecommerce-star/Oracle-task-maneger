import { Controller, Get, Query } from '@nestjs/common';
import { SignsService } from './signs.service';

@Controller('signs')
export class SignsController {
  constructor(private readonly signsService: SignsService) {}

  @Get()
  async findAll(
    @Query('signType') signType?: string,
    @Query('lang') lang?: string,
  ) {
    return this.signsService.findAll({ signType, lang });
  }
}
