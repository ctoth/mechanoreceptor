import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Gamepad Input Tests", () => {
  test("Gamepad connection detection", async ({ page }) => {
    await page.evaluate(() => {
      const gamepadConnectEvent = new Event("gamepadconnected");
      Object.defineProperty(gamepadConnectEvent, "gamepad", {
        value: { id: "Test Gamepad", index: 0 },
        writable: false,
      });
      window.dispatchEvent(gamepadConnectEvent);
      return new Promise((resolve) => setTimeout(resolve, 100));
    });
    const connectedGamepads = await page.evaluate(() => {
      const gamepads = window.gamepadSource.getConnectedGamepads();
      console.log("Connected gamepads:", JSON.stringify(gamepads));
      return gamepads;
    });
    expect(connectedGamepads.length).toBe(1);
  });
});
