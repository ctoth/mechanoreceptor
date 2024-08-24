import { test, expect } from '@playwright/test';

test.describe('InputMapper E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test.html');
    await page.waitForFunction(() => (window as any).mechanoreceptorReady === true);

    page.on('console', msg => {
      console.log(`Browser console ${msg.type()}: ${msg.text()}`);
    });

    await page.evaluate(() => {
      const mappingManager = new window.Mechanoreceptor.MappingConfigManager();
      const keyboardSource = new window.Mechanoreceptor.KeyboardSource();
      const mouseSource = new window.Mechanoreceptor.MouseSource();
      const gamepadSource = new window.Mechanoreceptor.GamepadSource();
      const touchSource = new window.Mechanoreceptor.TouchSource();

      window.inputMapper = new window.Mechanoreceptor.InputMapper(
        mappingManager,
        keyboardSource,
        mouseSource,
        gamepadSource,
        touchSource
      );

      keyboardSource.initialize();
      mouseSource.initialize();
      gamepadSource.initialize();
      touchSource.initialize();

      const testMappings = [
        { contextId: 'game', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
        { contextId: 'game', actionId: 'shoot', inputType: 'mouse', inputCode: 0 },
        { contextId: 'menu', actionId: 'select', inputType: 'keyboard', inputCode: 'Enter' },
        { contextId: 'menu', actionId: 'back', inputType: 'keyboard', inputCode: 'Escape' }
      ];
      mappingManager.loadMappings(JSON.stringify(testMappings));

      window.inputMapper.setContext('game');

      console.log('InputMapper initialized with mappings:', testMappings);
      console.log('Initial InputMapper state:', window.inputMapper);
    });
  });

  test('Keyboard input mapping in game context - Space key', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      window.inputMapper.update();
      return {
        actions: window.inputMapper.mapInput(),
        keyboardState: window.inputMapper.keyboardSource.getPressedKeys(),
        context: window.inputMapper.getCurrentContext()
      };
    });

    console.log('Test result:', result);

    expect(result.actions).toContain('jump');
    expect(result.keyboardState).toContain('Space');
    expect(result.context).toBe('game');
  });

  test('Mouse input mapping in game context', async ({ page }) => {
    await page.mouse.click(100, 100);
    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      window.inputMapper.update();
      return {
        actions: window.inputMapper.mapInput(),
        mouseState: window.inputMapper.mouseSource.getPressedButtons(),
        context: window.inputMapper.getCurrentContext()
      };
    });

    console.log('Test result:', result);

    expect(result.actions).toContain('shoot');
    expect(result.mouseState[0]).toBe(true);
    expect(result.context).toBe('game');
  });

  test('Context switching', async ({ page }) => {
    await page.evaluate(() => window.inputMapper.setContext('menu'));

    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    let result = await page.evaluate(() => {
      window.inputMapper.update();
      return {
        actions: window.inputMapper.mapInput(),
        context: window.inputMapper.getCurrentContext()
      };
    });

    console.log('Menu context test result:', result);

    expect(result.actions).toContain('select');
    expect(result.context).toBe('menu');

    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    result = await page.evaluate(() => {
      window.inputMapper.update();
      return {
        actions: window.inputMapper.mapInput(),
        context: window.inputMapper.getCurrentContext()
      };
    });

    console.log('Menu context with game input test result:', result);

    expect(result.actions).not.toContain('jump');
    expect(result.context).toBe('menu');
  });
});
