import { test, expect } from '@playwright/test';

test.describe('Input tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test.html');
    
    page.on('console', msg => {
      console.log(`Browser console ${msg.type()}: ${msg.text()}`);
    });

    await page.waitForFunction(() => (window as any).mechanoreceptorReady === true, { timeout: 10000 });
    
    console.log('Mechanoreceptor is ready');
  });

  test('Keyboard input test', async ({ page }) => {
    await page.keyboard.press('A');
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      console.log('Evaluating keyboard input...');
      if (!(window as any).inputMapper) {
        console.error('inputMapper is not defined');
        return { lastKeyPressed: null, keyboardState: null };
      }
      const lastKeyPressed = (window as any).lastKeyPressed;
      const keyboardState = (window as any).inputMapper.keyboardSource.getPressedKeys();
      console.log('Keyboard state:', { lastKeyPressed, keyboardState });
      return { lastKeyPressed, keyboardState };
    });

    console.log('Keyboard test result:', result);

    expect(result.lastKeyPressed).toBe('KeyA');
    expect(result.keyboardState).toContain('KeyA');
  });

  test('Mouse input test', async ({ page }) => {
    await page.mouse.click(100, 100);
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      console.log('Evaluating mouse input...');
      if (!(window as any).inputMapper) {
        console.error('inputMapper is not defined');
        return { lastMouseClick: null, mouseState: null };
      }
      const lastMouseClick = (window as any).lastMouseClick;
      const mouseState = (window as any).inputMapper.mouseSource.getPressedButtons();
      console.log('Mouse state:', { lastMouseClick, mouseState });
      return { lastMouseClick, mouseState };
    });

    console.log('Mouse test result:', result);

    expect(result.lastMouseClick).toEqual({ x: 100, y: 100 });
    expect(result.mouseState[0]).toBe(true);
  });
});
