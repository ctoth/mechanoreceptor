import { test as base, chromium } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Ensure browsers are installed
    await chromium.ensureBrowsersInstalled();

    page.on("console", (msg) => {
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });
    page.on("pageerror", (exception) => {
      console.error(`Browser page error:`, exception);
    });
    await page.goto("http://localhost:3000/test.html");
    await page.waitForFunction(() => window.mechanoreceptorReady === true, {
      timeout: 5000,
    });
    await use(page);
  },
});
