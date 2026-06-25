import { test, expect } from '@playwright/test';
import { installFirebaseMocks } from '../helpers/firebase-mocks';
import { installApiMocks } from '../helpers/api-mocks';

test.describe('Login form validation', () => {
  test.beforeEach(async ({ page }) => {
    await installFirebaseMocks(page);
    await installApiMocks(page);
    await page.goto('/login');
  });

  test('empty required fields show validation messages', async ({ page }) => {
    await page.getByRole('button', { name: /^Login$/ }).click();
    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
  });

  test('invalid email format shows field-level error', async ({ page }) => {
    await page.getByLabel(/^Email/).fill('not-an-email');
    await page.getByLabel(/^Password/).first().fill('ValidPass123!');
    await page.getByRole('button', { name: /^Login$/ }).click();
    await expect(page.getByText(/Enter a valid email address/i)).toBeVisible();
  });

  test('rapid double submit does not navigate twice', async ({ page }) => {
    await page.getByLabel(/^Email/).fill('e2e@sprintify.test');
    await page.getByLabel(/^Password/).first().fill('E2eTestPass123!');
    const submit = page.getByRole('button', { name: /^Login$/ });
    await submit.dblclick();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });
});
