import type { Page } from '@playwright/test';
import { installApiMocks } from './api-mocks';
import { installFirebaseMocks, loginViaUi } from './firebase-mocks';

/** Establish an authenticated session using mocked Firebase + API (no production data). */
export async function ensureAuthenticated(page: Page): Promise<void> {
  await installFirebaseMocks(page);
  await installApiMocks(page);
  await loginViaUi(page);
  await page.waitForURL(/\/(dashboard|my-tasks|onboarding)/, { timeout: 30_000 });
}

export async function signOutFromApp(page: Page): Promise<void> {
  await page.locator('[data-slot="avatar"]').click();
  await page.getByRole('menuitem', { name: /Sign out/i }).click();
}

export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  const loading = page.getByText('Loading…');
  if (await loading.isVisible().catch(() => false)) {
    await loading.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  }
}
