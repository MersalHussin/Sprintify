import { test, expect } from '@playwright/test';
import { PROTECTED_ROUTE_INSTANCES, AUTH_ONLY_ROUTES } from '../helpers/routes';
import { ensureAuthenticated } from '../helpers/auth-session';

test.describe('Auth guards — unauthenticated', () => {
  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    for (const route of PROTECTED_ROUTE_INSTANCES) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    }
  });

  test('login page is accessible when logged out', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });
});

test.describe('Auth guards — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('authenticated users are redirected away from login and register', async ({ page }) => {
    for (const route of AUTH_ONLY_ROUTES) {
      await page.goto(route);
      await expect(page).not.toHaveURL(new RegExp(`${route}$`));
    }
  });

  test('authenticated users can access protected routes', async ({ page }) => {
    await page.goto('/my-tasks');
    await expect(page.getByRole('heading', { name: /My Tasks/i })).toBeVisible();

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible();
  });
});
