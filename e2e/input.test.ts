import { test, expect } from "@playwright/test";

const TEST_HTML_URL = "http://localhost:3000/test.html";

test.describe("Input tests", () => {
  test.beforeEach(async ({ page }) => {
    // Removed increased timeout
    const logs: string[] = [];
    page.on("console", (msg) => {
      console.log("Browser console:", msg.text());
      logs.push(msg.text());
    });
    page.on("pageerror", (err) => console.error("Browser page error:", err));
    
    await test.step("Navigate to test page", async () => {
      const response = await page.goto(TEST_HTML_URL);
      if (response && !response.ok()) {
        throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`);
      }
    });

    await page.waitForLoadState("domcontentloaded");
    await test.step("Wait for Mechanoreceptor to load", async () => {
      try {
        await page.waitForFunction(
          () => (window as any).mechanoreceptorReady === true || (window as any).mechanoreceptorError,
          { timeout: 10000 }
        );
        const error = await page.evaluate(() => (window as any).mechanoreceptorError);
        if (error) {
          throw new Error(`Mechanoreceptor failed to initialize: ${error}`);
        }
      } catch (error) {
        console.error("Timeout waiting for Mechanoreceptor to be ready");
        console.log("Captured logs:", logs.join("\n"));
        await test.step("Debug information", async () => {
          console.log("Page content:", await page.content());
          console.log(
            "Window object:",
            await page.evaluate(() => Object.keys(window))
          );
          console.log(
            "Mechanoreceptor object:",
            await page.evaluate(() => (window as any).Mechanoreceptor)
          );
          console.log(
            "Script errors:",
            await page.evaluate(() => (window as any).scriptErrors)
          );
          console.log(
            "Network requests:",
            await page.evaluate(() => performance.getEntriesByType("resource"))
          );
        });
        throw error;
      }
    });
  });

  test("Keyboard input test", async ({ page }) => {
    await test.step("Check if script is loaded", async () => {
      const scriptLoaded = await page.evaluate(
        () => typeof (window as any).Mechanoreceptor !== "undefined"
      );
      expect(scriptLoaded).toBe(true);
    });

    await test.step("Simulate key press", async () => {
      await page.keyboard.press("A");
    });

    await test.step("Verify key press", async () => {
      const keyStatus = await page.evaluate(
        () => (window as any).lastKeyPressed
      );
      expect(keyStatus).toBe("KeyA");
    });
  });

  test("Mouse input test", async ({ page }) => {
    await test.step("Simulate mouse click", async () => {
      await page.mouse.click(100, 100);
    });

    await test.step("Verify mouse click", async () => {
      const clickStatus = await page.evaluate(
        () => (window as any).lastMouseClick
      );
      expect(clickStatus).toEqual({ x: 100, y: 100 });
    });
  });
});
