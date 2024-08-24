import { test, expect } from '@playwright/test';

test.describe('InputMapper E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test.html');
    
    page.on('console', msg => {
      console.log(`Browser console ${msg.type()}: ${msg.text()}`);
    });

    await page.waitForFunction(() => (window as any).mechanoreceptorReady === true, { timeout: 10000 });

    await page.evaluate(() => {
      console.log('Initializing InputMapper...');
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
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      console.log('Evaluating keyboard input...');
      if (!window.inputMapper) {
        console.error('inputMapper is not defined');
        return { actions: [], keyboardState: [], context: null };
      }
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      const keyboardState = window.inputMapper.keyboardSource.getPressedKeys();
      const context = window.inputMapper.getCurrentContext();
      console.log('InputMapper state:', { actions, keyboardState, context });
      return { actions, keyboardState, context };
    });

    console.log('Test result:', result);

    expect(result.actions).toContain('jump');
    expect(result.keyboardState).toContain('Space');
    expect(result.context).toBe('game');
  });

  test('Mouse input mapping in game context', async ({ page }) => {
    await page.mouse.click(100, 100);
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      console.log('Evaluating mouse input...');
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
    await page.evaluate(() => {
      console.log('Switching context to menu...');
      window.inputMapper.setContext('menu');
    });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    let result = await page.evaluate(() => {
      console.log('Evaluating menu context...');
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
    await page.waitForTimeout(500);

    result = await page.evaluate(() => {
      console.log('Evaluating menu context with game input...');
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
