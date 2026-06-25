import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ensureAuthenticated, waitForAppReady } from '../helpers/auth-session';

const PUBLIC_PAGES = [
  { path: '/', name: 'Home', readySelector: '#home, #faq, main', options: { exclude: ['[class*="bg-avatar"]'] } },
  { path: '/login', name: 'Login', readySelector: 'h1', options: {} },
  { path: '/register', name: 'Register', readySelector: 'h1', options: {} },
  { path: '/terms', name: 'Terms', readySelector: 'h1', options: {} },
] as const;

const AUTHENTICATED_PAGES = [
  {
    path: '/my-tasks',
    name: 'My Tasks',
    readySelector: 'h1',
    options: { exclude: ['[data-slot="sidebar"]', '[data-slot="sidebar-wrapper"]'] },
  },
  {
    path: '/settings',
    name: 'Settings',
    readySelector: 'h2',
    options: { exclude: ['[data-slot="sidebar"]', '[data-slot="sidebar-wrapper"]'] },
  },
] as const;

async function analyzePage(
  page: import('@playwright/test').Page,
  readySelector: string,
  options: { exclude?: string[]; include?: string[] } = {},
) {
  await waitForAppReady(page);
  await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: 15_000 });

  let builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('.text-muted-foreground');

  if (options.include?.length) {
    builder = builder.include(options.include.join(', '));
  }

  for (const selector of options.exclude ?? []) {
    builder = builder.exclude(selector);
  }

  return builder.analyze();
}

test.describe('Accessibility — public pages', () => {
  for (const { path, name, readySelector, options } of PUBLIC_PAGES) {
    test(`${name} has no critical or serious axe violations`, async ({ page }) => {
      await page.goto(path);

      const results = await analyzePage(page, readySelector, options);

      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }
});

test.describe('Accessibility — authenticated pages', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  for (const { path, name, readySelector, options } of AUTHENTICATED_PAGES) {
    test(`${name} has no critical or serious axe violations`, async ({ page }) => {
      await page.goto(path);

      const results = await analyzePage(page, readySelector, options);

      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }
});

test.describe('Accessibility — keyboard and labels', () => {
  test('login form inputs have associated labels', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/^Email/)).toBeVisible();
    await expect(page.getByLabel(/^Password/)).toBeVisible();
  });

  test('contact modal traps focus and is operable by keyboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Contact us/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('home page logo has alt text', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('img', { name: /Sprintify/i }).first()).toBeVisible();
  });
});
