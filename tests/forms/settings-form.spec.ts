import { test, expect } from '@playwright/test';
import { ensureAuthenticated, signOutFromApp } from '../helpers/auth-session';

test.describe('Settings profile form', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible();
  });

  test('happy path saves profile and shows success message', async ({ page }) => {
    await page.getByLabel(/^First Name$/).fill('Updated');
    await page.getByLabel(/^Last Name$/).fill('Name');
    await page.getByRole('button', { name: /Save profile/i }).click();
    await expect(page.getByText(/Profile saved successfully/i)).toBeVisible();
  });

  test('theme toggle switches appearance label', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /Light Mode|Dark Mode/i });
    const initialText = await themeButton.textContent();
    await themeButton.click();
    await expect(themeButton).not.toHaveText(initialText ?? '');
  });
});
