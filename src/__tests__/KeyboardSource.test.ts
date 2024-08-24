import { KeyboardSource } from '../KeyboardSource';
import { vi, describe, beforeEach, afterEach, expect, test } from 'vitest';

describe('KeyboardSource', () => {
  let keyboardSource: KeyboardSource;
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    global.window = mockWindow as any;
    global.KeyboardEvent = vi.fn() as any;
    keyboardSource = new KeyboardSource();
    addEventListenerSpy = vi.spyOn(mockWindow, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(mockWindow, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).window;
    delete (global as any).KeyboardEvent;
  });

  describe('initialization and disposal', () => {
    test('initialize adds event listeners', () => {
      keyboardSource.initialize();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    test('dispose removes event listeners', () => {
      keyboardSource.initialize();
      keyboardSource.dispose();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    test('multiple initializations do not add duplicate listeners', () => {
      keyboardSource.initialize();
      keyboardSource.initialize();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('key press tracking', () => {
    beforeEach(() => {
      keyboardSource.initialize();
    });

    test('isKeyPressed returns true for pressed keys', () => {
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
    });

    test('isKeyPressed returns false for released keys', () => {
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      mockWindow.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    });

    test('isKeyPressed returns false for keys that were never pressed', () => {
      expect(keyboardSource.isKeyPressed('KeyZ')).toBe(false);
    });

    test('multiple key presses are tracked correctly', () => {
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }));
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
      expect(keyboardSource.isKeyPressed('KeyB')).toBe(true);
    });

    test('key release only affects the released key', () => {
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }));
      mockWindow.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
      expect(keyboardSource.isKeyPressed('KeyB')).toBe(true);
    });

    test('repeated keydown events do not affect the state', () => {
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      mockWindow.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    });
  });

  describe('update method', () => {
    test('update method does not throw error', () => {
      expect(() => keyboardSource.update()).not.toThrow();
    });

    test('update method does not change key states', () => {
      keyboardSource.initialize();
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
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
      mockWindow.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      keyboardSource.dispose();
      keyboardSource.initialize();
      expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    });
  });
});
