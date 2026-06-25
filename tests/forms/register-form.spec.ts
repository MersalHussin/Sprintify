import { test, expect } from '@playwright/test';
import { installFirebaseMocks } from '../helpers/firebase-mocks';

test.describe('Register form validation', () => {
  test.beforeEach(async ({ page }) => {
    await installFirebaseMocks(page);
    await page.goto('/register');
  });

  test('empty required fields show validation messages', async ({ page }) => {
    await page.getByRole('button', { name: /^Register$/ }).click();
    await expect(page.getByText(/Username is required/i)).toBeVisible();
    await expect(page.getByText(/Email is required/i)).toBeVisible();
  });

  test('username shorter than 3 characters shows error', async ({ page }) => {
    await page.getByLabel(/^Username/).fill('ab');
    await page.getByLabel(/^Email/).fill('test@sprintify.test');
    await page.getByLabel(/^Password/).first().fill('ValidPass123!');
    await page.getByLabel(/^Confirm password/).fill('ValidPass123!');
    await page.getByRole('button', { name: /^Register$/ }).click();
    await expect(page.getByText(/Username must be at least 3 characters/i)).toBeVisible();
  });

  test('password shorter than 8 characters shows error', async ({ page }) => {
    await page.getByLabel(/^Username/).fill('validuser');
    await page.getByLabel(/^Email/).fill('test@sprintify.test');
    await page.getByLabel(/^Password/).first().fill('short');
    await page.getByLabel(/^Confirm password/).fill('short');
    await page.getByRole('button', { name: /^Register$/ }).click();
    await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
  });

  test('canceling via login link leaves register page with empty defaults on return', async ({ page }) => {
    await page.getByLabel(/^Username/).fill('unsaveduser');
    await page.getByRole('link', { name: /^Login$/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByRole('link', { name: /^Register$/i }).click();
    await expect(page.getByLabel(/^Username/)).toHaveValue('');
  });
});
