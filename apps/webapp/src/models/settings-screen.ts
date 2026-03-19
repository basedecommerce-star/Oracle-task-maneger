export interface SettingsOptionModel {
  id: 'language' | 'preferred-category' | 'theme' | 'notifications';
  title: string;
  description: string;
}

export interface SettingsScreenModel {
  title: string;
  subtitle: string;
  options: SettingsOptionModel[];
}

export function buildSettingsScreenModel(): SettingsScreenModel {
  return {
    title: 'Settings',
    subtitle: 'Configure language, preferred category, and learning preferences.',
    options: [
      {
        id: 'language',
        title: 'Language',
        description: 'Choose the interface and content language.',
      },
      {
        id: 'preferred-category',
        title: 'Preferred category',
        description: 'Set the default category for training and exam screens.',
      },
      {
        id: 'theme',
        title: 'Theme',
        description: 'Sync with Telegram theme or select light/dark preferences.',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Control study reminders and achievement messages.',
      },
    ],
  };
}
