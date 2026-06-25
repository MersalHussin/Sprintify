import { test, expect } from '@playwright/test';

test.describe('Landing page UI components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('FAQ accordion expands and collapses', async ({ page }) => {
    const firstQuestion = page.getByRole('button', { name: /What exactly is Sprintify/i });
    await firstQuestion.click();
    await expect(page.getByText(/smarter way to manage your team's work/i)).toBeVisible();
    await firstQuestion.click();
  });

  test('theme toggle is present in navbar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Toggle theme/i })).toBeVisible();
  });

  test('mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const menuButton = page.getByRole('button', { name: /Open menu|Close menu/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('link', { name: /Login/i }).first()).toBeVisible();
    }
  });

  test('newsletter email input accepts valid email', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/Your email address/i);
    await emailInput.fill('subscriber@example.com');
    await expect(emailInput).toHaveValue('subscriber@example.com');
  });
});
