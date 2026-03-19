export interface UserSettingsRecord {
  id: string;
  telegramId: string;
  language?: string;
  preferredCategory?: string;
}

export interface UserSettingsInput {
  language?: string;
  preferredCategory?: string;
}

export function applyUserSettings(
  user: UserSettingsRecord,
  input: UserSettingsInput,
): UserSettingsRecord {
  return {
    ...user,
    language: input.language ?? user.language,
    preferredCategory: input.preferredCategory ?? user.preferredCategory,
  };
}
