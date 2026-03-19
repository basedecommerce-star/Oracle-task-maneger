import { Controller, Get, Patch, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Query('userId') userId?: string) {
    // userId will come from JWT/auth context in production
    return this.usersService.getProfile(userId);
  }

  @Patch('settings')
  async updateSettings(
    @Body()
    body: {
      languageCode?: string;
      categoryId?: string;
    },
    @Query('userId') userId?: string,
  ) {
    // userId will come from JWT/auth context in production
    return this.usersService.updateSettings(userId, body);
  }
}
