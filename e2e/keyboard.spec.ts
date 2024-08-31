import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Keyboard Input Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Reset the input state before each test
    await page.evaluate(() => {
      window.lastKeyPressed = null;
      window.lastActions = [];
      window.inputMapper.clearInputBuffer();
    });
  });

  test("Single key press detection", async ({ page }) => {
    await page.keyboard.press("A");
    const lastKeyPressed = await page.evaluate(() => window.lastKeyPressed);
    expect(lastKeyPressed).toBe("KeyA");
  });

  test("Multiple key press detection", async ({ page }) => {
    await page.keyboard.down("A");
    await page.keyboard.down("B");
    await page.keyboard.down("C");
    const pressedKeys = await page.evaluate(() => window.keyboardSource.getPressedKeys());
    expect(pressedKeys).toEqual(expect.arrayContaining(["KeyA", "KeyB", "KeyC"]));
    await page.keyboard.up("A");
    await page.keyboard.up("B");
    await page.keyboard.up("C");
  });

  test("Key release detection", async ({ page }) => {
    await page.keyboard.down("A");
    await page.keyboard.up("A");
    const isKeyPressed = await page.evaluate(() => window.keyboardSource.isKeyPressed("KeyA"));
    expect(isKeyPressed).toBe(false);
  });

  test("Input mapping in game context", async ({ page }) => {
    await page.evaluate(() => {
      window.setContext("game");
      window.inputMapper.mappingManager.addMapping({
        contextId: "game",
        actionId: "jump",
        inputType: "keyboard",
        inputCode: "Space"
      });
    });

    await page.keyboard.press("Space");

    const result = await page.evaluate(() => {
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      return {
        actions,
        context: window.inputMapper.getCurrentContext(),
        mappings: window.inputMapper.mappingManager.getMappings()
      };
    });

    console.log('Test result:', result);

    expect(result.actions).toContain("jump");
    expect(result.context).toBe("game");
    expect(result.mappings).toContainEqual({
      contextId: "game",
      actionId: "jump",
      inputType: "keyboard",
      inputCode: "Space"
    });
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

  test("Input buffer clearing", async ({ page }) => {
    await page.evaluate(() => window.setContext("game"));
    await page.keyboard.press("Space");
    await page.keyboard.press("A");
    
    await page.evaluate(() => window.inputMapper.clearInputBuffer());
    
    const recentInputs = await page.evaluate(() => window.inputMapper.getRecentInputs());
    expect(recentInputs).toHaveLength(0);
  });

  test("Rapid key presses", async ({ page }) => {
    await page.evaluate(() => window.setContext("game"));
    
    // Simulate rapid key presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Space", { delay: 50 });
    }

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    expect(actions.filter(action => action === "jump").length).toBe(5);
  });

  test("Long key press", async ({ page }) => {
    await page.evaluate(() => window.setContext("game"));
    
    await page.keyboard.down("Space");
    await page.waitForTimeout(1000); // Hold for 1 second
    await page.keyboard.up("Space");

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    expect(actions).toContain("jump");
    expect(actions.filter(action => action === "jump").length).toBe(1);
  });
});
