import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';
import os from 'os';

const numCPUs = os.cpus().length;
const maxWorkers = Math.max(1, numCPUs - 1); // Ensure at least 1 worker

const config: PlaywrightTestConfig = {
  timeout: 30000, // Set global timeout to 30 seconds
  testDir: './e2e',
  workers: maxWorkers, // Use number of CPUs - 1 as max workers
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'WebKit',
      use: { browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60000, // Set timeout to 1 minute
  },
};

export default config;
