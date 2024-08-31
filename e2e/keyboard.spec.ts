import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Keyboard Input Tests", () => {
  test("Keyboard input test", async ({ page }) => {
    await page.keyboard.press("A");
    const lastKeyPressed = await page.evaluate(() => window.lastKeyPressed);
    expect(lastKeyPressed).toBe("KeyA");
  });

  test("Input mapping in game context", async ({ page }) => {
    await page.evaluate(() => window.setContext("game"));
    await page.keyboard.down("Space");

    // Wait for a short time to allow for input processing
    await page.waitForTimeout(100);

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    await page.keyboard.up("Space");

    expect(actions).toContain("jump");
  });

  test("Input mapping in menu context", async ({ page }) => {
    await page.evaluate(() => window.setContext("menu"));
    await page.keyboard.down("Enter");

    // Wait for a short time to allow for input processing
    await page.waitForTimeout(100);

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    await page.keyboard.up("Enter");

    expect(actions).toContain("select");
  });
});
