import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Keyboard Input Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Reset the input state before each test
    await page.evaluate(() => {
      window.lastKeyPressed = null;
      window.lastActions = [];
    });
  });

  test("Single key press detection", async ({ page }) => {
    await page.keyboard.press("A");
    const lastKeyPressed = await page.evaluate(() => window.lastKeyPressed);
    expect(lastKeyPressed).toBe("KeyA");
  });

  test("Multiple key press detection", async ({ page }) => {
    await page.keyboard.press("A");
    await page.keyboard.press("B");
    await page.keyboard.press("C");
    const pressedKeys = await page.evaluate(() => window.keyboardSource.getPressedKeys());
    expect(pressedKeys).toEqual(expect.arrayContaining(["KeyA", "KeyB", "KeyC"]));
  });

  test("Key release detection", async ({ page }) => {
    await page.keyboard.down("A");
    await page.keyboard.up("A");
    const isKeyPressed = await page.evaluate(() => window.keyboardSource.isKeyPressed("KeyA"));
    expect(isKeyPressed).toBe(false);
  });

  test("Input mapping in game context", async ({ page }) => {
    await page.evaluate(() => window.setContext("game"));
    await page.keyboard.press("Space");

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    expect(actions).toContain("jump");
  });

  test("Input mapping in menu context", async ({ page }) => {
    await page.evaluate(() => window.setContext("menu"));
    await page.keyboard.press("Enter");

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    expect(actions).toContain("select");
  });

  test("Changing context affects input mapping", async ({ page }) => {
    // In game context
    await page.evaluate(() => window.setContext("game"));
    await page.keyboard.press("Space");
    let actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });
    expect(actions).toContain("jump");

    // Change to menu context
    await page.evaluate(() => window.setContext("menu"));
    await page.keyboard.press("Space");
    actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });
    expect(actions).not.toContain("jump");
  });

  test("Input buffer functionality", async ({ page }) => {
    await page.evaluate(() => window.setContext("game"));
    await page.keyboard.press("Space");
    await page.keyboard.press("A");
    await page.keyboard.press("B");

    const recentInputs = await page.evaluate(() => window.inputMapper.getRecentInputs());
    expect(recentInputs).toEqual(expect.arrayContaining(["jump"]));
    expect(recentInputs.length).toBeGreaterThanOrEqual(1);
  });
});
