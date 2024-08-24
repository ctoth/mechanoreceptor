import { test, expect } from '@playwright/test';

test('Keyboard input test', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Adjust this URL to your test page

  // Simulate pressing the 'A' key
  await page.keyboard.press('A');

  // Wait for a short time to allow the page to process the event
  await page.waitForTimeout(100);

  // Check if the key press was registered
  const keyStatus = await page.evaluate(() => (window as any).lastKeyPressed);
  expect(keyStatus).toBe('KeyA');
});

test('Mouse input test', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Adjust this URL to your test page

  // Simulate a mouse click
  await page.mouse.click(100, 100);

  // Wait for a short time to allow the page to process the event
  await page.waitForTimeout(100);

  // Check if the click was registered
  const clickStatus = await page.evaluate(() => (window as any).lastMouseClick);
  expect(clickStatus).toEqual({ x: 100, y: 100 });
});
