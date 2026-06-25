import type { UserProfile } from '../../client/src/types/user';

export const E2E_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e@sprintify.test',
  password: process.env.E2E_TEST_PASSWORD ?? 'E2eTestPass123!',
  username: 'e2euser',
  uid: 'e2e-firebase-uid-001',
  displayName: 'E2E User',
} as const;

export const MOCK_PROFILE: UserProfile = {
  _id: 'user-e2e-1',
  uid: E2E_USER.uid,
  firstName: 'E2E',
  lastName: 'User',
  professionalTitle: 'QA Engineer',
  gender: 'prefer-not-to-say',
  timezone: 'America/New_York',
  country: 'US',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const MOCK_TEAM = {
  _id: 'team-e2e-1',
  name: 'E2E Team',
};

export const MOCK_PROJECT = {
  _id: 'proj-e2e-1',
  name: 'E2E Project',
};

export const MOCK_TASK = {
  _id: 'task-e2e-1',
  title: 'Sample task',
  description: 'Task for E2E tests',
  status: 'todo',
  priority: 'medium',
};
