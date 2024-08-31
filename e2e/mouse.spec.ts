import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Mouse Input Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Reset the input state before each test
    await page.evaluate(() => {
      window.lastMouseClick = null;
      window.lastActions = [];
    });
  });

  test("Mouse click detection", async ({ page }) => {
    await page.mouse.click(100, 100);
    const lastMouseClick = await page.evaluate(() => window.lastMouseClick);
    expect(lastMouseClick).toEqual({ x: 100, y: 100 });
  });

  test("Mouse button press detection", async ({ page }) => {
    await page.mouse.down();
    const isButtonPressed = await page.evaluate(() => window.mouseSource.isButtonPressed(0));
    expect(isButtonPressed).toBe(true);
  });

  test("Mouse button release detection", async ({ page }) => {
    await page.mouse.down();
    await page.mouse.up();
    const isButtonPressed = await page.evaluate(() => window.mouseSource.isButtonPressed(0));
    expect(isButtonPressed).toBe(false);
  });

  test("Mouse movement detection", async ({ page }) => {
    await page.mouse.move(150, 150);
    const position = await page.evaluate(() => window.mouseSource.getPosition());
    expect(position).toEqual({ x: 150, y: 150 });
  });

  test("Mouse input mapping", async ({ page }) => {
    await page.evaluate(() => window.setContext("game"));
    await page.mouse.click(100, 100);

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    expect(actions).toContain("shoot");
  });

  test("Multiple mouse button press detection", async ({ page }) => {
    await page.mouse.down({ button: "left" });
    await page.mouse.down({ button: "right" });
    const pressedButtons = await page.evaluate(() => window.mouseSource.getPressedButtons());
    expect(pressedButtons).toEqual(expect.arrayContaining([0, 2]));
  });
});
