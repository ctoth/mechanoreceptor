import { test, expect } from '@playwright/test';

test('Keyboard input test', async ({ page }) => {
  await page.goto('http://localhost:3000/public/test.html');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('domcontentloaded');

  // Enable console logging
  page.on('console', msg => console.log(msg.text()));

  // Debug: Check if the script is loaded
  const scriptLoaded = await page.evaluate(() => {
    return typeof (window as any).Mechanoreceptor !== 'undefined';
  });
  console.log('Script loaded:', scriptLoaded);

  // Simulate pressing the 'A' key
  await page.keyboard.press('A');

  // Wait for a longer time to allow the page to process the event
  await page.waitForTimeout(1000);

  // Check if the key press was registered
  const keyStatus = await page.evaluate(() => {
    console.log('Window object:', Object.keys(window));
    console.log('Last key pressed:', (window as any).lastKeyPressed);
    return (window as any).lastKeyPressed;
  });
  expect(keyStatus).toBe('KeyA');
});

test('Mouse input test', async ({ page }) => {
  await page.goto('http://localhost:3000/public/test.html');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('domcontentloaded');

  // Enable console logging
  page.on('console', msg => console.log(msg.text()));

  // Simulate a mouse click
  await page.mouse.click(100, 100);

  // Wait for a longer time to allow the page to process the event
  await page.waitForTimeout(1000);

  // Check if the click was registered
  const clickStatus = await page.evaluate(() => {
    console.log('Window object:', Object.keys(window));
    console.log('Last mouse click:', (window as any).lastMouseClick);
    return (window as any).lastMouseClick;
  });
  expect(clickStatus).toEqual({ x: 100, y: 100 });
});
