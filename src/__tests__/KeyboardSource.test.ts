import { KeyboardSource } from '../KeyboardSource';

describe('KeyboardSource', () => {
  let keyboardSource: KeyboardSource;

  beforeEach(() => {
    keyboardSource = new KeyboardSource();
    keyboardSource.initialize();
  });

  afterEach(() => {
    keyboardSource.dispose();
  });

  test('should register key press', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);
    expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
  });

  test('should register key release', () => {
    const pressEvent = new KeyboardEvent('keydown', { code: 'KeyB' });
    const releaseEvent = new KeyboardEvent('keyup', { code: 'KeyB' });
    window.dispatchEvent(pressEvent);
    window.dispatchEvent(releaseEvent);
    expect(keyboardSource.isKeyPressed('KeyB')).toBe(false);
  });
});
import { KeyboardSource } from '../KeyboardSource';

describe('KeyboardSource', () => {
  let keyboardSource: KeyboardSource;
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    keyboardSource = new KeyboardSource();
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  test('isKeyPressed returns true for pressed keys', () => {
    keyboardSource.initialize();
    const keyDownEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(keyDownEvent);
    expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
  });

  test('isKeyPressed returns false for released keys', () => {
    keyboardSource.initialize();
    const keyDownEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
    const keyUpEvent = new KeyboardEvent('keyup', { code: 'KeyA' });
    window.dispatchEvent(keyDownEvent);
    window.dispatchEvent(keyUpEvent);
    expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
  });

  test('update method does not throw error', () => {
    expect(() => keyboardSource.update()).not.toThrow();
  });

  test('multiple key presses are tracked correctly', () => {
    keyboardSource.initialize();
    const keyDownEventA = new KeyboardEvent('keydown', { code: 'KeyA' });
    const keyDownEventB = new KeyboardEvent('keydown', { code: 'KeyB' });
    window.dispatchEvent(keyDownEventA);
    window.dispatchEvent(keyDownEventB);
    expect(keyboardSource.isKeyPressed('KeyA')).toBe(true);
    expect(keyboardSource.isKeyPressed('KeyB')).toBe(true);
  });

  test('key release only affects the released key', () => {
    keyboardSource.initialize();
    const keyDownEventA = new KeyboardEvent('keydown', { code: 'KeyA' });
    const keyDownEventB = new KeyboardEvent('keydown', { code: 'KeyB' });
    const keyUpEventA = new KeyboardEvent('keyup', { code: 'KeyA' });
    window.dispatchEvent(keyDownEventA);
    window.dispatchEvent(keyDownEventB);
    window.dispatchEvent(keyUpEventA);
    expect(keyboardSource.isKeyPressed('KeyA')).toBe(false);
    expect(keyboardSource.isKeyPressed('KeyB')).toBe(true);
  });
});
