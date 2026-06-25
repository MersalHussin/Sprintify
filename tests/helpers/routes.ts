/** Static and parameterized routes discovered from App.tsx and navigation. */
export const PUBLIC_ROUTES = ['/', '/terms'] as const;

export const AUTH_ONLY_ROUTES = ['/login', '/register'] as const;

export const PROTECTED_ROUTES = [
  '/onboarding',
  '/invite',
  '/dashboard',
  '/my-tasks',
  '/boards',
  '/settings',
  '/workspaces',
  '/kanban',
] as const;

export const PROTECTED_PARAM_ROUTES = [
  '/board/:boardId',
  '/backlog/:boardId',
  '/teams/:teamId/projects',
  '/teams/:teamId/members',
] as const;

export const MOCK_IDS = {
  boardId: 'proj-e2e-1',
  teamId: 'team-e2e-1',
  inviteToken: 'invite-token-e2e',
} as const;

export const PROTECTED_ROUTE_INSTANCES = [
  '/dashboard',
  '/my-tasks',
  '/settings',
  '/workspaces',
  `/board/${MOCK_IDS.boardId}`,
  `/backlog/${MOCK_IDS.boardId}`,
  `/teams/${MOCK_IDS.teamId}/projects`,
  `/teams/${MOCK_IDS.teamId}/members`,
] as const;

export const ALL_DISCOVERED_ROUTES = [
  ...PUBLIC_ROUTES,
  ...AUTH_ONLY_ROUTES,
  ...PROTECTED_ROUTES,
  ...PROTECTED_ROUTE_INSTANCES,
  '/nonexistent-page',
] as const;

export type RoutePath = (typeof ALL_DISCOVERED_ROUTES)[number];
