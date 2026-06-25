import type { FullConfig } from '@playwright/test';

/** Optional global setup hook — auth is established per-test via mocked Firebase. */
async function globalSetup(_config: FullConfig): Promise<void> {
  // Auth sessions are created in-test via tests/helpers/auth-session.ts
  // because Firebase persists auth in IndexedDB (not captured by storageState alone).
}

export default globalSetup;
