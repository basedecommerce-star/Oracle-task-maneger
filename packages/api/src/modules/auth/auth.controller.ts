import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

class TelegramAuthDto {
  initData: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async authenticateTelegram(@Body() dto: TelegramAuthDto) {
    return this.authService.authenticateTelegram(dto.initData);
  }
}
