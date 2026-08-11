import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.FLUXO_BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'public',
    testMatch: /.*\.public\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'auth',
    testMatch: /.*\.auth\.spec\.ts/,
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
],
});
