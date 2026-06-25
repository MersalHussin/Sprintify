import type { Page } from '@playwright/test';
import { E2E_USER } from '../fixtures/mock-data';

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function createMockIdToken(uid: string, email: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'e2e' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: 'https://securetoken.google.com/sprintify-e2e',
      aud: 'sprintify-e2e',
      auth_time: now,
      user_id: uid,
      sub: uid,
      iat: now,
      exp: now + 3600,
      email,
      email_verified: true,
      firebase: { identities: { email: [email] }, sign_in_provider: 'password' },
    }),
  );
  return `${header}.${payload}.e2e-mock-signature`;
}

const MOCK_REFRESH_TOKEN = 'mock-refresh-token-e2e';

export type FirebaseMockOptions = {
  rejectCredentials?: boolean;
};

export async function installFirebaseMocks(
  page: Page,
  options: FirebaseMockOptions = {},
): Promise<void> {
  const idToken = createMockIdToken(E2E_USER.uid, E2E_USER.email);

  await page.route('**/identitytoolkit.googleapis.com/**', async (route) => {
    const url = route.request().url();
    const postData = route.request().postDataJSON() as { email?: string; password?: string } | null;

    if (options.rejectCredentials && url.includes('signInWithPassword')) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 400,
            message: 'INVALID_LOGIN_CREDENTIALS',
            errors: [{ message: 'INVALID_LOGIN_CREDENTIALS', domain: 'global', reason: 'invalid' }],
          },
        }),
      });
      return;
    }

    if (url.includes('signInWithPassword') || url.includes('signUp')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: url.includes('signUp')
            ? 'identitytoolkit#SignupNewUserResponse'
            : 'identitytoolkit#VerifyPasswordResponse',
          localId: E2E_USER.uid,
          email: postData?.email ?? E2E_USER.email,
          displayName: E2E_USER.displayName,
          idToken,
          registered: true,
          refreshToken: MOCK_REFRESH_TOKEN,
          expiresIn: '3600',
        }),
      });
      return;
    }

    if (url.includes('accounts:lookup')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [
            {
              localId: E2E_USER.uid,
              email: E2E_USER.email,
              displayName: E2E_USER.displayName,
              emailVerified: true,
            },
          ],
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.route('**/securetoken.googleapis.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: idToken,
        expires_in: '3600',
        token_type: 'Bearer',
        refresh_token: MOCK_REFRESH_TOKEN,
        id_token: idToken,
        user_id: E2E_USER.uid,
        project_id: 'sprintify-e2e',
      }),
    });
  });
}

export async function loginViaUi(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/^Email/).fill(E2E_USER.email);
  await page.getByLabel(/^Password/).first().fill(E2E_USER.password);
  await page.getByRole('button', { name: /^Login$/ }).click();
  await page.waitForURL(/\/(dashboard|onboarding|my-tasks)/, { timeout: 30_000 });
}

export async function setupAuthenticatedSession(page: Page): Promise<void> {
  await installFirebaseMocks(page);
  await installApiMocks(page);
  await loginViaUi(page);
}

// Re-export for convenience in auth helper
import { installApiMocks } from './api-mocks';
