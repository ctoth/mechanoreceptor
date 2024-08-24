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

      // Load test mappings
      const testMappings = [
        { contextId: 'game', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
        { contextId: 'game', actionId: 'shoot', inputType: 'mouse', inputCode: 0 },
        { contextId: 'menu', actionId: 'select', inputType: 'keyboard', inputCode: 'Enter' },
        { contextId: 'menu', actionId: 'back', inputType: 'keyboard', inputCode: 'Escape' }
      ];
      mappingManager.loadMappings(JSON.stringify(testMappings));

      // Set initial context
      window.inputMapper.setContext('game');

      console.log('InputMapper initialized with mappings:', testMappings);
    });

    // Log the initial state
    await page.evaluate(() => {
      console.log('Initial InputMapper state:', window.inputMapper);
    });
  });

  test('Keyboard input mapping in game context', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100); // Add a small delay
    const triggeredActions = await page.evaluate(() => {
      console.log('Before update');
      window.inputMapper.update();
      console.log('After update, before mapInput');
      const actions = window.inputMapper.mapInput();
      console.log('After mapInput');
      console.log('Triggered actions:', actions);
      return actions;
    });
    expect(triggeredActions).toContain('jump');
  });

  test('Keyboard input mapping in game context', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100); // Add a small delay
    const triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      console.log('Triggered actions:', actions);
      return actions;
    });
    expect(triggeredActions).toContain('jump');
  });

  test('Mouse input mapping in game context', async ({ page }) => {
    await page.mouse.click(100, 100);
    await page.waitForTimeout(100); // Add a small delay
    const triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      console.log('Triggered actions:', actions);
      return actions;
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
    await page.waitForTimeout(100); // Add a small delay
    let triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      console.log('Triggered actions:', actions);
      return actions;
    });
    expect(triggeredActions).toContain('select');

    // Test that game context mapping no longer works
    await page.keyboard.press('Space');
    await page.waitForTimeout(100); // Add a small delay
    triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      console.log('Triggered actions:', actions);
      return actions;
    });
    expect(triggeredActions).not.toContain('jump');
  });

  test('Multiple inputs in single frame', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.mouse.click(100, 100);
    await page.waitForTimeout(100); // Add a small delay
    const triggeredActions = await page.evaluate(() => {
      window.inputMapper.update();
      const actions = window.inputMapper.mapInput();
      console.log('Triggered actions:', actions);
      return actions;
    });
    expect(triggeredActions).toContain('jump');
    expect(triggeredActions).toContain('shoot');
  });

  // Add more tests here as needed
});
