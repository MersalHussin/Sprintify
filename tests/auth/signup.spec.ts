import { test, expect } from '@playwright/test';
import { installApiMocks } from '../helpers/api-mocks';
import { installFirebaseMocks } from '../helpers/firebase-mocks';
import { E2E_USER } from '../fixtures/mock-data';

test.describe('Signup', () => {
  test.beforeEach(async ({ page }) => {
    await installFirebaseMocks(page);
    await installApiMocks(page);
  });

  test('successful registration redirects to onboarding or dashboard', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/^Username/).fill(E2E_USER.username);
    await page.getByLabel(/^Email/).fill(`new-${Date.now()}@sprintify.test`);
    await page.getByLabel(/^Password/).first().fill(E2E_USER.password);
    await page.getByLabel(/^Confirm password/).fill(E2E_USER.password);
    await page.getByRole('button', { name: /^Register$/ }).click();

    await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
  });

  test('mismatched passwords show inline validation error', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/^Username/).fill('testuser');
    await page.getByLabel(/^Email/).fill('test@sprintify.test');
    await page.getByLabel(/^Password/).first().fill('ValidPass123!');
    await page.getByLabel(/^Confirm password/).fill('DifferentPass!');
    await page.getByRole('button', { name: /^Register$/ }).click();

    await expect(page.getByText(/Passwords must match/i)).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });
});
