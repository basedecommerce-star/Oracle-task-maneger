export interface NavigationRoute {
  id:
    | 'home'
    | 'training'
    | 'exam'
    | 'tickets'
    | 'topics'
    | 'errors'
    | 'stats'
    | 'rules'
    | 'signs'
    | 'faq'
    | 'settings'
    | 'question'
    | 'exam-result';
  path: string;
  title: string;
}

export const WEBAPP_ROUTES: NavigationRoute[] = [
  { id: 'home', path: '/', title: 'Home' },
  { id: 'training', path: '/training', title: 'Training' },
  { id: 'exam', path: '/exam', title: 'Exam' },
  { id: 'tickets', path: '/tickets', title: 'Tickets' },
  { id: 'topics', path: '/topics', title: 'Topics' },
  { id: 'errors', path: '/errors', title: 'My errors' },
  { id: 'stats', path: '/stats', title: 'Statistics' },
  { id: 'rules', path: '/rules', title: 'Rules' },
  { id: 'signs', path: '/signs', title: 'Road signs' },
  { id: 'faq', path: '/faq', title: 'FAQ' },
  { id: 'settings', path: '/settings', title: 'Settings' },
  { id: 'question', path: '/question/:id', title: 'Question' },
  { id: 'exam-result', path: '/exam/result', title: 'Exam result' },
];

export function getNavigationRoute(routeId: NavigationRoute['id']): NavigationRoute | undefined {
  return WEBAPP_ROUTES.find((route) => route.id === routeId);
}
