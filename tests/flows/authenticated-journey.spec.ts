import { test, expect } from '@playwright/test';
import { ensureAuthenticated, signOutFromApp } from '../helpers/auth-session';
import { installApiFailure } from '../helpers/api-mocks';

test.describe('Returning user journey', () => {
  test('login → my tasks → settings → logout', async ({ page }) => {
    await ensureAuthenticated(page);

    await page.getByRole('link', { name: /My Tasks/i }).click();
    await expect(page).toHaveURL(/\/my-tasks/);
    await expect(page.getByRole('heading', { name: /My Tasks/i })).toBeVisible();

    await page.getByRole('link', { name: /User Settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);

    await signOutFromApp(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Network error resilience', () => {
  test('API 500 on my-tasks shows page without JS crash', async ({ page }) => {
    await ensureAuthenticated(page);
    await installApiFailure(page, 500);
    await page.goto('/my-tasks');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: /My Tasks/i })).toBeVisible();
  });

  test('API timeout on settings keeps form visible', async ({ page }) => {
    await ensureAuthenticated(page);
    await page.route('**/localhost:4000/api/users/me', async (route) => {
      if (route.request().method() === 'GET') {
        await route.abort('timedout');
        return;
      }
      await route.continue();
    });
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible();
  });
});
