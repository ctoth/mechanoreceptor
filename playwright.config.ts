import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    launchOptions: {
      slowMo: 100,
    },
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 60000,
    reuseExistingServer: !process.env.CI,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  retries: 2,
  workers: 1,
};

export default config;
