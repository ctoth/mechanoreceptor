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
      const gamepad = { buttons: [{ pressed: true, value: 1 }], axes: [] };
      window.gamepadSource.updateGamepadState(gamepad);
    });
    const isButtonPressed = await page.evaluate(() => {
      return window.gamepadSource.isButtonPressed(0, 0);
    });
    expect(isButtonPressed).toBe(true);
  });

  test("Gamepad axis movement detection", async ({ page }) => {
    await page.evaluate(() => {
      const gamepad = { buttons: [], axes: [0.5, -0.5] };
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
      const gamepad = { buttons: [{ pressed: true, value: 1 }], axes: [] };
      window.gamepadSource.updateGamepadState(gamepad);
    });

    const actions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });

    expect(actions).toContain("accelerate");
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
