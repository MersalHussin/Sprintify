import type { Page } from '@playwright/test';

export function attachConsoleErrorCollector(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore benign Firebase offline / dev warnings
      if (text.includes('Firebase API Key is missing')) return;
      errors.push(text);
    }
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

export function attachNetworkFailureCollector(page: Page): { status: number; url: string }[] {
  const failures: { status: number; url: string }[] = [];
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('favicon')) {
      failures.push({ status, url });
    }
  });
  return failures;
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
  if (hasOverflow) {
    throw new Error('Page has horizontal overflow');
  }
}

export async function assertMinTouchTarget(page: Page, selector: string, min = 44): Promise<void> {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return;
  if (box.width < min || box.height < min) {
    throw new Error(`Touch target ${selector} is ${box.width}x${box.height}, expected >= ${min}px`);
  }
}
