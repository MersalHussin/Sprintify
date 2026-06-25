import type { Page, Route } from '@playwright/test';
import { MOCK_PROFILE, MOCK_PROJECT, MOCK_TASK, MOCK_TEAM } from '../fixtures/mock-data';

type ApiHandler = (route: Route) => Promise<void>;

function jsonResponse(data: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify({ data }),
  };
}

function jsonError(message: string, status = 500) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify({ message }),
  };
}

export type ApiMockOptions = {
  /** Force all API requests to fail with this status */
  forceError?: number;
  /** Simulate network timeout */
  forceTimeout?: boolean;
  /** Return empty teams list */
  emptyTeams?: boolean;
};

export async function installApiMocks(page: Page, options: ApiMockOptions = {}): Promise<void> {
  const handlers: Record<string, ApiHandler> = {
    'GET:/users/me': async (route) => {
      await route.fulfill(jsonResponse({ user: MOCK_PROFILE }));
    },
    'PATCH:/users/me': async (route) => {
      const body = route.request().postDataJSON() as Partial<typeof MOCK_PROFILE>;
      await route.fulfill(jsonResponse({ user: { ...MOCK_PROFILE, ...body } }));
    },
    'GET:/teams': async (route) => {
      if (options.emptyTeams) {
        await route.fulfill(jsonResponse({ teams: [] }));
        return;
      }
      await route.fulfill(jsonResponse({ teams: [MOCK_TEAM] }));
    },
    'POST:/teams': async (route) => {
      const body = route.request().postDataJSON() as { name?: string };
      await route.fulfill(jsonResponse({ team: { ...MOCK_TEAM, name: body.name ?? MOCK_TEAM.name } }));
    },
    [`POST:/teams/${MOCK_TEAM._id}`]: async (route) => {
      await route.fulfill(jsonResponse({ team: MOCK_TEAM }));
    },
    [`POST:/teams/invite-token-e2e/accept`]: async (route) => {
      await route.fulfill(jsonResponse({ team: MOCK_TEAM }));
    },
    [`GET:/teams/${MOCK_TEAM._id}/projects`]: async (route) => {
      await route.fulfill(jsonResponse({ projects: [MOCK_PROJECT], items: [MOCK_PROJECT] }));
    },
    [`GET:/projects/${MOCK_PROJECT._id}`]: async (route) => {
      await route.fulfill(jsonResponse({ project: MOCK_PROJECT, callerRole: 'manager' }));
    },
    [`GET:/projects/${MOCK_PROJECT._id}/tasks`]: async (route) => {
      await route.fulfill(jsonResponse({ tasks: [MOCK_TASK] }));
    },
    [`POST:/ai/${MOCK_PROJECT._id}/tasks`]: async (route) => {
      await route.fulfill(
        jsonResponse({
          tasks: [
            { title: 'Generated task 1', description: 'AI generated', priority: 'high' },
            { title: 'Generated task 2', description: 'AI generated', priority: 'medium' },
          ],
        }),
      );
    },
    'GET:/users/me/tasks': async (route) => {
      await route.fulfill(
        jsonResponse({
          groups: [
            {
              project: MOCK_PROJECT,
              tasks: [MOCK_TASK],
            },
          ],
        }),
      );
    },
    [`GET:/teams/${MOCK_TEAM._id}`]: async (route) => {
      await route.fulfill(
        jsonResponse({
          team: MOCK_TEAM,
          members: [{ userId: MOCK_PROFILE.uid, user: { name: 'E2E User' }, role: 'manager' }],
        }),
      );
    },
    [`GET:/teams/${MOCK_TEAM._id}/members`]: async (route) => {
      await route.fulfill(jsonResponse({ members: [{ user: MOCK_PROFILE, role: 'manager' }] }));
    },
  };

  await page.route('**/localhost:4000/api/**', async (route) => {
    if (options.forceTimeout) {
      await route.abort('timedout');
      return;
    }

    if (options.forceError) {
      await route.fulfill(jsonError('Simulated server error', options.forceError));
      return;
    }

    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api', '');
    const method = route.request().method();
    const key = `${method}:${path}`;

    const handler = handlers[key];
    if (handler) {
      await handler(route);
      return;
    }

    // Fallback for unmatched authenticated endpoints
    if (method === 'GET') {
      await route.fulfill(jsonResponse({}));
      return;
    }

    await route.fulfill(jsonResponse({ success: true }));
  });
}

export async function installApiFailure(page: Page, status = 500): Promise<void> {
  await installApiMocks(page, { forceError: status });
}

export async function installApiTimeout(page: Page): Promise<void> {
  await installApiMocks(page, { forceTimeout: true });
}
