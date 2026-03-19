export interface TelegramAuthRequestDto {
  initData: string;
}

export interface AuthenticatedUserDto {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  preferredCategory?: string;
}

export interface TelegramAuthResponseDto {
  authenticated: boolean;
  user?: AuthenticatedUserDto;
  reason?: string;
}

export interface UpdateUserSettingsRequestDto {
  language?: string;
  preferredCategory?: 'AB' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'F';
}
