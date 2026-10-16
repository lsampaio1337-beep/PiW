import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'python3 -m http.server 8101',
    port: 8101,
    reuseExistingServer: true,
  },
});
