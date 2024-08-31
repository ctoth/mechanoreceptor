import { InputSource } from './InputSource';

export class KeyboardSource implements InputSource {
  private pressedKeys: Set<string> = new Set();
  private isInitialized = false;
  public onKeyDown: ((event: KeyboardEvent) => void) | null = null;

  initialize(): void {
    if (!this.isInitialized) {
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.isInitialized = true;
      } else {
        console.warn('KeyboardSource: window is not defined, skipping event listeners');
      }
    }
  }

  update(): void {
    // For keyboard, we don't need to do anything in the update method
    // as we're using event listeners
  }

  dispose(): void {
    if (this.isInitialized) {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      this.isInitialized = false;
      this.pressedKeys.clear();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.pressedKeys.add(event.code);
    if (this.onKeyDown) {
      this.onKeyDown(event);
    }
    console.log('Key pressed:', event.code);
    console.log('Current pressed keys:', Array.from(this.pressedKeys));
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
    console.log('Key released:', event.code);
    console.log('Current pressed keys:', Array.from(this.pressedKeys));
  }

  isKeyPressed(keyCode: string): boolean {
    const isPressed = this.pressedKeys.has(keyCode);
    console.log(`Checking if ${keyCode} is pressed:`, isPressed);
    return isPressed;
  }

  getPressedKeys(): string[] {
    return Array.from(this.pressedKeys);
  }
}
