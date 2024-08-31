import { PlaywrightTestConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  timeout: 15000, // Increase to 60 seconds
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: "on",
    video: "on",
    screenshot: "on",
    launchOptions: {
      slowMo: 100,
    },
    logger: {
      isEnabled: (name, severity) => true,
      log: (name, severity, message, args) =>
        console.log(`${name} ${severity}: ${message}`, ...args),
    },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/test.html",
    timeout: 10000, // Increased timeout for server startup
    reuseExistingServer: !process.env.CI,
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/test-results.json" }],
    ["line"],
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  retries: 2,
  workers: 16,
};

export default config;
