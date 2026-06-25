import { test, expect } from '@playwright/test';
import { installApiMocks } from '../helpers/api-mocks';
import { installFirebaseMocks, loginViaUi } from '../helpers/firebase-mocks';
import { E2E_USER } from '../fixtures/mock-data';
import { ensureAuthenticated, signOutFromApp } from '../helpers/auth-session';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await installFirebaseMocks(page);
    await installApiMocks(page);
  });

  test('successful login with valid credentials redirects to dashboard', async ({ page }) => {
    await loginViaUi(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('link', { name: /My Tasks/i })).toBeVisible();
  });

  test('failed login with wrong password shows error and stays on login page', async ({ page }) => {
    await installFirebaseMocks(page, { rejectCredentials: true });
    await page.goto('/login');
    await page.getByLabel(/^Email/).fill(E2E_USER.email);
    await page.getByLabel(/^Password/).first().fill('WrongPassword1!');
    await page.getByRole('button', { name: /^Login$/ }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('status')).toBeVisible();
  });

  test('logout clears session and protected routes redirect to login', async ({ page }) => {
    await ensureAuthenticated(page);

    await signOutFromApp(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authenticated dashboard access', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('authenticated user can access dashboard directly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Task Generation AI/i })).toBeVisible();
  });
});
