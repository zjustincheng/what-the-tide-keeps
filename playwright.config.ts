import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/rules/**',
  fullyParallel: false,
  // Four games run side by side, and enemy turns wait on dodge prompts, so give each check room under load.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    channel: 'chrome',
    viewport: { width: 1280, height: 1100 },
    screenshot: 'only-on-failure',
    // Most checks exercise the full party; tests of the solo start opt out with an empty storage state.
    storageState: 'tests/full-party.json',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
});
