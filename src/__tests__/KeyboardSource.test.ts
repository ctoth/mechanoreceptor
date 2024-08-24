import { KeyboardSource } from '../KeyboardSource';
import { describe, beforeEach, afterEach, expect, test, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { fireEvent } from '@testing-library/dom';

describe('KeyboardSource', () => {
  let keyboardSource: KeyboardSource;
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost',
    });
    global.window = dom.window as any;
    global.document = dom.window.document;
    keyboardSource = new KeyboardSource();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    keyboardSource.dispose();
  });

  describe('initialization and disposal', () => {
    test('initialize adds event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      keyboardSource.initialize();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    test('dispose removes event listeners', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      keyboardSource.initialize();
      keyboardSource.dispose();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    test('multiple initializations do not add duplicate listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      keyboardSource.initialize();
      keyboardSource.initialize();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });

    test('multiple disposals do not throw errors', () => {
      keyboardSource.initialize();
      keyboardSource.dispose();
      expect(() => keyboardSource.dispose()).not.toThrow();
    });
  });

  describe('key press tracking', () => {
    beforeEach(() => {
      keyboardSource.initialize();
    });

    test('isKeyPressed returns true for pressed keys', () => {
      fireEvent.keyDown(window, { code: 'KeyA' });
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
    });

    test('isKeyPressed returns false for released keys', () => {
      fireEvent.keyDown(window, { code: 'KeyA' });
      fireEvent.keyUp(window, { code: 'KeyA' });
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    });

    test('isKeyPressed returns false for keys that were never pressed', () => {
      expect(keyboardSource.isKeyPressed('KeyZ')).toBe(false);
    });

    test('multiple key presses are tracked correctly', () => {
      fireEvent.keyDown(window, { code: 'KeyA' });
      fireEvent.keyDown(window, { code: 'KeyB' });
      fireEvent.keyDown(window, { code: 'KeyC' });
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
      expect(keyboardSource.isKeyPressed('KeyB')).toBe(true);
      expect(keyboardSource.isKeyPressed('KeyC')).toBe(true);
    });

    test('key release only affects the released key', () => {
      fireEvent.keyDown(window, { code: 'KeyA' });
      fireEvent.keyDown(window, { code: 'KeyB' });
      fireEvent.keyUp(window, { code: 'KeyA' });
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
      expect(keyboardSource.isKeyPressed('KeyB')).toBe(true);
    });

    test('repeated keydown events do not affect the state', () => {
      fireEvent.keyDown(window, { code: 'KeyA' });
      fireEvent.keyDown(window, { code: 'KeyA' });
      fireEvent.keyUp(window, { code: 'KeyA' });
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    });

    test('handles non-standard key codes', () => {
      fireEvent.keyDown(window, { code: 'NonStandardKey' });
      expect(keyboardSource.isKeyPressed('NonStandardKey')).toBe(true);
    });
  });

  describe('update method', () => {
    test('update method does not throw error', () => {
      expect(() => keyboardSource.update()).not.toThrow();
    });

    test('update method does not change key states', () => {
      keyboardSource.initialize();
      fireEvent.keyDown(window, { code: 'KeyA' });
      keyboardSource.update();
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('dispose without initialize does not throw', () => {
      expect(() => keyboardSource.dispose()).not.toThrow();
    });

    test('isKeyPressed works correctly after re-initialization', () => {
      keyboardSource.initialize();
      fireEvent.keyDown(window, { code: 'KeyA' });
      keyboardSource.dispose();
      keyboardSource.initialize();
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    });

    test('handles rapid key presses and releases', () => {
      for (let i = 0; i < 100; i++) {
        fireEvent.keyDown(window, { code: 'KeyA' });
        fireEvent.keyUp(window, { code: 'KeyA' });
      }
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    });
  });
});
