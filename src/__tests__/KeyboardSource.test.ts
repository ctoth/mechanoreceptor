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
