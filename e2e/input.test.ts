import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/public/test.html');
  await page.waitForLoadState('domcontentloaded');

  // Wait for the script to load
  await page.waitForFunction(() => (window as any).Mechanoreceptor !== undefined);

  page.on('console', msg => console.log(msg.text()));
});

test('Keyboard input test', async ({ page }) => {
  // Debug: Check if the script is loaded
  const scriptLoaded = await page.evaluate(() => typeof (window as any).Mechanoreceptor !== 'undefined');
  console.log('Script loaded:', scriptLoaded);

  // Simulate pressing the 'A' key
  await page.keyboard.press('A');

  // Wait for the key press to be processed
  await page.waitForFunction(() => (window as any).lastKeyPressed !== null);

  // Check if the key press was registered
  const keyStatus = await page.evaluate(() => (window as any).lastKeyPressed);
  console.log('Last key pressed:', keyStatus);
  expect(keyStatus).toBe('KeyA');
});

test('Mouse input test', async ({ page }) => {
  // Simulate a mouse click
  await page.mouse.click(100, 100);

  // Wait for the click to be processed
  await page.waitForFunction(() => (window as any).lastMouseClick !== null);

  // Check if the click was registered
  const clickStatus = await page.evaluate(() => (window as any).lastMouseClick);
  console.log('Last mouse click:', clickStatus);
  expect(clickStatus).toEqual({ x: 100, y: 100 });
});
