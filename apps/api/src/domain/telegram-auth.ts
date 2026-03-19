export interface TelegramIdentity {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthUserRecord extends TelegramIdentity {
  id: string;
  language?: string;
  preferredCategory?: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthUserRecord;
  reason?: string;
}

export function authenticateTelegramIdentity(
  identity: TelegramIdentity | null,
  existingUser?: AuthUserRecord,
): AuthResult {
  if (!identity || !identity.telegramId) {
    return {
      authenticated: false,
      reason: 'Telegram identity is missing or invalid.',
    };
  }

  return {
    authenticated: true,
    user: existingUser ?? {
      id: `tg_${identity.telegramId}`,
      telegramId: identity.telegramId,
      username: identity.username,
      firstName: identity.firstName,
      lastName: identity.lastName,
    },
  };
}
