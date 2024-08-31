import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Mouse Input Tests", () => {
  test("Mouse input test", async ({ page }) => {
    await page.mouse.click(100, 100);
    const lastMouseClick = await page.evaluate(() => window.lastMouseClick);
    expect(lastMouseClick).toEqual({ x: 100, y: 100 });
  });
});
