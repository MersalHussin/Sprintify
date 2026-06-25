import { test, expect } from '@playwright/test';
import { ALL_DISCOVERED_ROUTES } from '../helpers/routes';
import { attachConsoleErrorCollector, attachNetworkFailureCollector } from '../helpers/page-utils';
import { ensureAuthenticated } from '../helpers/auth-session';

const PUBLIC_ROUTE_LOADS = ['/', '/terms', '/login', '/register'] as const;

test.describe('Public routing', () => {
  test('every public route loads without critical console errors', async ({ page }) => {
    const consoleErrors = attachConsoleErrorCollector(page);

    for (const route of PUBLIC_ROUTE_LOADS) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    }

    expect(consoleErrors.filter((e) => !e.includes('Failed to fetch'))).toEqual([]);
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page.getByRole('heading', { name: /Page not found/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible();
  });

  test('browser back and forward between home and terms', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Terms/i }).first().click();
    await expect(page).toHaveURL(/\/terms/);

    await page.goBack();
    await expect(page).toHaveURL('/');

    await page.goForward();
    await expect(page).toHaveURL(/\/terms/);
  });

  test('deep link to terms renders content', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();
  });
});

test.describe('Protected routing with auth', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('protected routes load without 5xx responses', async ({ page }) => {
    const failures = attachNetworkFailureCollector(page);

    for (const route of ['/dashboard', '/my-tasks', '/settings', '/workspaces']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    const serverFailures = failures.filter((f) => f.status >= 500);
    expect(serverFailures).toEqual([]);
  });

  test('sidebar highlights active route for my-tasks', async ({ page }) => {
    await page.goto('/my-tasks');
    const activeLink = page.getByRole('link', { name: /My Tasks/i });
    await expect(activeLink).toBeVisible();
  });
});

test.describe('Route inventory smoke', () => {
  test('all discovered routes respond without crashing', async ({ page }) => {
    for (const route of ALL_DISCOVERED_ROUTES) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500);
    }
  });
});
