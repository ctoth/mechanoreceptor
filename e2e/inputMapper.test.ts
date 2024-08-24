import { test, expect } from '@playwright/test';
import { InputMapper, KeyboardSource, MouseSource, GamepadSource, TouchSource, MappingConfigManager } from '../src';

let inputMapper: InputMapper;

test.describe('InputMapper E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test.html');
    await page.waitForFunction(() => (window as any).mechanoreceptorReady === true);

    // Initialize InputMapper
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

      // Initialize input sources
      keyboardSource.initialize();
      mouseSource.initialize();
      gamepadSource.initialize();
      touchSource.initialize();

      // Load some test mappings
      const testMappings = [
        { contextId: 'game', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
        { contextId: 'game', actionId: 'shoot', inputType: 'mouse', inputCode: 0 },
        { contextId: 'menu', actionId: 'select', inputType: 'keyboard', inputCode: 'Enter' },
        { contextId: 'menu', actionId: 'back', inputType: 'keyboard', inputCode: 'Escape' }
      ];
      mappingManager.loadMappings(JSON.stringify(testMappings));

      // Set initial context
      window.inputMapper.setContext('game');
    });
  });

  test('Keyboard input mapping in game context', async ({ page }) => {
    await page.keyboard.press('Space');
    const triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });
    expect(triggeredActions).toContain('jump');
  });

  test('Mouse input mapping in game context', async ({ page }) => {
    await page.mouse.click(100, 100);
    const triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });
    expect(triggeredActions).toContain('shoot');
  });

  test('Context switching', async ({ page }) => {
    // Switch to menu context
    await page.evaluate(() => {
      window.inputMapper.setContext('menu');
    });

    // Test menu context mapping
    await page.keyboard.press('Enter');
    let triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });
    expect(triggeredActions).toContain('select');

    // Test that game context mapping no longer works
    await page.keyboard.press('Space');
    triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });
    expect(triggeredActions).not.toContain('jump');
  });

  test('Multiple inputs in single frame', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.mouse.click(100, 100);
    const triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      return window.inputMapper.mapInput();
    });
    expect(triggeredActions).toContain('jump');
    expect(triggeredActions).toContain('shoot');
  });

  // Add more tests here as needed
});
