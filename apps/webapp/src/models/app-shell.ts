export interface HomeFeatureCard {
  id:
    | 'training'
    | 'exam'
    | 'tickets'
    | 'topics'
    | 'errors'
    | 'stats'
    | 'rules'
    | 'signs'
    | 'faq'
    | 'settings';
  title: string;
  description: string;
  route: string;
}

export interface HomeScreenModel {
  title: string;
  subtitle: string;
  cards: HomeFeatureCard[];
}

export function buildHomeScreenModel(): HomeScreenModel {
  return {
    title: 'PDD Moldova',
    subtitle: 'Study traffic rules, train by topics, and simulate the official exam.',
    cards: [
      {
        id: 'training',
        title: 'Training',
        description: 'Practice questions with explanations and rule references.',
        route: '/training',
      },
      {
        id: 'exam',
        title: 'Exam',
        description: 'Run a timed exam session using official category rules.',
        route: '/exam',
      },
      {
        id: 'tickets',
        title: 'Tickets',
        description: 'Open ticket-based practice sessions by category.',
        route: '/tickets',
      },
      {
        id: 'topics',
        title: 'Topics',
        description: 'Train by topic such as road signs, intersections, or priority.',
        route: '/topics',
      },
      {
        id: 'errors',
        title: 'My errors',
        description: 'Review questions you previously answered incorrectly.',
        route: '/errors',
      },
      {
        id: 'stats',
        title: 'Statistics',
        description: 'Track accuracy, streaks, and category progress.',
        route: '/stats',
      },
      {
        id: 'rules',
        title: 'Rules',
        description: 'Browse the rulebook and jump to referenced articles.',
        route: '/rules',
      },
      {
        id: 'signs',
        title: 'Road signs',
        description: 'Study sign categories, descriptions, and quick drills.',
        route: '/signs',
      },
      {
        id: 'faq',
        title: 'FAQ',
        description: 'See exam requirements, documents, and scheduling notes.',
        route: '/faq',
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Choose language, preferred category, and preferences.',
        route: '/settings',
      },
    ],
  };
}
