import { test, expect } from '@playwright/test';

test.describe('Input tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test.html');
    // Wait for Mechanoreceptor to be ready
    await page.waitForFunction(() => (window as any).mechanoreceptorReady === true);
  });

  test('Keyboard input test', async ({ page }) => {
    await page.keyboard.press('A');
    // Add a small delay to allow for event processing
    await page.waitForTimeout(100);
    const keyStatus = await page.evaluate(() => (window as any).lastKeyPressed);
    expect(keyStatus).toBe('KeyA');
  });

  test('Mouse input test', async ({ page }) => {
    await page.mouse.click(100, 100);
    // Add a small delay to allow for event processing
    await page.waitForTimeout(100);
    const clickStatus = await page.evaluate(() => (window as any).lastMouseClick);
    expect(clickStatus).toEqual({ x: 100, y: 100 });
  });
});
