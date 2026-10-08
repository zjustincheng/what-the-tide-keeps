import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/rules/**',
  fullyParallel: false,
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
