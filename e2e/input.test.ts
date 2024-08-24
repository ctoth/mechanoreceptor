import { test, expect } from '@playwright/test';

test.describe('Input tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test.html');
    await page.waitForFunction(() => (window as any).mechanoreceptorReady === true);

    page.on('console', msg => {
      console.log(`Browser console ${msg.type()}: ${msg.text()}`);
    });
  });

  test('Keyboard input test', async ({ page }) => {
    await page.keyboard.press('A');
    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      if (!(window as any).inputMapper) {
        console.error('inputMapper is not defined');
        return { lastKeyPressed: null, keyboardState: null };
      }
      return {
        lastKeyPressed: (window as any).lastKeyPressed,
        keyboardState: (window as any).inputMapper.keyboardSource.getPressedKeys()
      };
    });

    console.log('Keyboard test result:', result);

    expect(result.lastKeyPressed).toBe('KeyA');
    expect(result.keyboardState).toContain('KeyA');
  });

  test('Mouse input test', async ({ page }) => {
    await page.mouse.click(100, 100);
    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      if (!(window as any).inputMapper) {
        console.error('inputMapper is not defined');
        return { lastMouseClick: null, mouseState: null };
      }
      return {
        lastMouseClick: (window as any).lastMouseClick,
        mouseState: (window as any).inputMapper.mouseSource.getPressedButtons()
      };
    });

    console.log('Mouse test result:', result);

    expect(result.lastMouseClick).toEqual({ x: 100, y: 100 });
    expect(result.mouseState[0]).toBe(true);
  });
});
