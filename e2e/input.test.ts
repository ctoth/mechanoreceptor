import { test, expect } from '@playwright/test';
import path from 'path';

const TEST_HTML_PATH = path.join(__dirname, '..', 'public', 'test.html');

test.beforeEach(async ({ page }) => {
  await page.goto(`file://${TEST_HTML_PATH}`);
  await page.waitForLoadState('domcontentloaded');

  // Add more debugging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', err => console.error('Browser page error:', err));

  // Wait for the script to load with a timeout
  try {
    await page.waitForFunction(() => (window as any).Mechanoreceptor !== undefined, { timeout: 30000 });
  } catch (error) {
    console.error('Timeout waiting for Mechanoreceptor to be defined');
    const pageContent = await page.content();
    console.log('Page content:', pageContent);
    console.log('Script content:', await page.evaluate(() => {
      const scriptElement = document.querySelector('script[src="../dist/index.js"]');
      return scriptElement ? scriptElement.textContent : 'Script not found';
    }));
    throw error;
  }
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
