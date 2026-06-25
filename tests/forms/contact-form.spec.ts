import { test, expect } from '@playwright/test';

test.describe('Contact modal form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens from navbar contact action and closes on Escape', async ({ page }) => {
    await page.getByRole('button', { name: /Contact us/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Contact Us/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closes on backdrop click', async ({ page }) => {
    await page.getByRole('button', { name: /Contact us/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.evaluate((node) => {
      node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await expect(dialog).not.toBeVisible();
  });

  test('closes on close button', async ({ page }) => {
    await page.getByRole('button', { name: /Contact us/i }).click();
    await page.getByRole('button', { name: /Close contact form/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('happy path shows success message after submit', async ({ page }) => {
    await page.getByRole('button', { name: /Contact us/i }).click();
    await page.getByLabel(/^Name$/).fill('Test User');
    await page.getByLabel(/^Email$/).fill('test@example.com');
    await page.getByLabel(/^Message$/).fill('Hello from E2E tests');
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByText(/Message Sent!/i)).toBeVisible();
  });

  test('empty required fields are blocked by browser validation', async ({ page }) => {
    await page.getByRole('button', { name: /Contact us/i }).click();
    await page.getByRole('button', { name: /Send Message/i }).click();
    const nameInput = page.getByLabel(/^Name$/);
    const validationMessage = await nameInput.evaluate((el) => (el as HTMLInputElement).validationMessage);
    expect(validationMessage.length).toBeGreaterThan(0);
  });
});
