import { Controller, Get, Patch, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Query('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('settings')
  async updateSettings(
    @Body()
    body: {
      userId: string;
      preferredLang?: string;
      categoryId?: string;
    },
  ) {
    const { userId, ...settings } = body;
    return this.usersService.updateSettings(userId, settings);
  }
}
