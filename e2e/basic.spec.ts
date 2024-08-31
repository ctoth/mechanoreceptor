import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Mechanoreceptor E2E Tests", () => {
  test("Basic setup test", async ({ page }) => {
    const isReady = await page.evaluate(() => {
      console.log(
        "Checking mechanoreceptorReady:",
        window.mechanoreceptorReady
      );
      console.log("InputMapper:", window.inputMapper);
      return window.mechanoreceptorReady;
    });
    expect(isReady).toBe(true);
  });
});
