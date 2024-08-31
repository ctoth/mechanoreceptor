import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Touch Input Tests", () => {
  test("Touch input test", async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/test.html");
    
    await page.evaluate(() => {
      window.addEventListener('touchstart', (e) => {
        console.log('Touch event received:', e.touches[0]);
      });
    });
    
    await page.touchscreen.tap(150, 150);
    
    await page.waitForFunction(() => window.lastTouch !== null, { timeout: 5000 });
    
    const lastTouch = await page.evaluate(() => window.lastTouch);
    console.log('Last touch:', lastTouch);
    
    expect(lastTouch).toEqual({ x: 150, y: 150 });
    
    await context.close();
  });
});
