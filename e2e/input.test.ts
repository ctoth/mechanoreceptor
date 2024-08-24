import { test, expect } from '@playwright/test';

test.describe('Input tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test.html');
  });

  test('Keyboard input test', async ({ page }) => {
    await page.keyboard.press('A');
    const keyStatus = await page.evaluate(() => (window as any).lastKeyPressed);
    expect(keyStatus).toBe('KeyA');
  });

  test('Mouse input test', async ({ page }) => {
    await page.mouse.click(100, 100);
    const clickStatus = await page.evaluate(() => (window as any).lastMouseClick);
    expect(clickStatus).toEqual({ x: 100, y: 100 });
  });
});
