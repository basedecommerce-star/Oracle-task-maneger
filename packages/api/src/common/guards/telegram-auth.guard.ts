import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Guard that validates Telegram WebApp initData using HMAC-SHA256.
 * See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const initData = request.headers['x-telegram-init-data'] as string;

    if (!initData) {
      throw new UnauthorizedException('Missing Telegram initData');
    }

    const isValid = this.validateInitData(initData);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram initData');
    }

    // Parse user data from initData and attach to request
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (userJson) {
      request.telegramUser = JSON.parse(userJson);
    }

    return true;
  }

  private validateInitData(initData: string): boolean {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) return false;

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');
    const entries = Array.from(params.entries());
    entries.sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return computedHash === hash;
  }
}
