import { test, expect } from '@playwright/test';
import { assertNoHorizontalOverflow } from '../helpers/page-utils';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const PAGES = ['/', '/login', '/register', '/terms'] as const;

test.describe('Responsive layout', () => {
  for (const viewport of VIEWPORTS) {
    test(`no horizontal overflow on public pages at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const path of PAGES) {
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');
        await assertNoHorizontalOverflow(page);
      }
    });
  }

  test('mobile navigation exposes login and register', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('link', { name: /Login/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Get Started/i }).first()).toBeVisible();
  });

  test('primary CTA buttons meet minimum touch target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const getStarted = page.getByRole('link', { name: /Get Started/i }).first();
    const box = await getStarted.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });
});
