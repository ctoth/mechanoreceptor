import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Gamepad Input Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Reset the input state and simulate gamepad connection before each test
    await page.evaluate(() => {
      window.lastActions = [];
      const gamepadConnectEvent = new Event("gamepadconnected");
      Object.defineProperty(gamepadConnectEvent, "gamepad", {
        value: { id: "Test Gamepad", index: 0 },
        writable: false,
      });
      window.dispatchEvent(gamepadConnectEvent);
      return new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  test("Gamepad connection detection", async ({ page }) => {
    const connectedGamepads = await page.evaluate(() => {
      return window.gamepadSource.getConnectedGamepads();
    });
    expect(connectedGamepads.length).toBe(1);
  });

  test("Gamepad button press detection", async ({ page }) => {
    await page.evaluate(() => {
      const gamepad = { index: 0, buttons: [{ pressed: true, value: 1 }], axes: [] };
      window.gamepadSource.updateGamepadState(gamepad);
    });
    const isButtonPressed = await page.evaluate(() => {
      return window.gamepadSource.isButtonPressed(0, 0);
    });
    expect(isButtonPressed).toBe(true);
  });

  test("Gamepad axis movement detection", async ({ page }) => {
    await page.evaluate(() => {
      const gamepad = { index: 0, buttons: [], axes: [0.5, -0.5] };
      window.gamepadSource.updateGamepadState(gamepad);
    });
    const axisValue = await page.evaluate(() => {
      return window.gamepadSource.getAxisValue(0, 0);
    });
    expect(axisValue).toBe(0.5);
  });

  test("Gamepad input mapping", async ({ page }) => {
    await page.evaluate(() => {
      window.setContext("game");
      const gamepad = { index: 0, buttons: [{ pressed: true, value: 1 }], axes: [] };
      window.gamepadSource.updateGamepadState(gamepad);
      
      // Add a mapping for the gamepad button
      window.inputMapper.mappingManager.addMapping({
        contextId: "game",
        actionId: "accelerate",
        inputType: "gamepad",
        inputCode: "button0"
      });
    });

    const result = await page.evaluate(() => {
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      console.log('Mapped actions:', actions);
      return {
        actions,
        mappings: window.inputMapper.mappingManager.getMappings(),
        gamepadState: window.gamepadSource.getGamepadState(0)
      };
    });

    console.log('Test result:', result);

    expect(result.actions).toContain("accelerate");
    expect(result.gamepadState.buttons[0].pressed).toBe(true);
  });

  test("Gamepad disconnection detection", async ({ page }) => {
    await page.evaluate(() => {
      const gamepadDisconnectEvent = new Event("gamepaddisconnected");
      Object.defineProperty(gamepadDisconnectEvent, "gamepad", {
        value: { id: "Test Gamepad", index: 0 },
        writable: false,
      });
      window.dispatchEvent(gamepadDisconnectEvent);
      return new Promise((resolve) => setTimeout(resolve, 100));
    });
    const connectedGamepads = await page.evaluate(() => {
      return window.gamepadSource.getConnectedGamepads();
    });
    expect(connectedGamepads.length).toBe(0);
  });
});
