import { InputSource } from './InputSource';

export class KeyboardSource implements InputSource {
  private pressedKeys: Set<string> = new Set();
  private isInitialized = false;
  public onKeyDown: ((event: KeyboardEvent) => void) | null = null;

  initialize(): void {
    if (!this.isInitialized) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      this.isInitialized = true;
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
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  }

  isKeyPressed(keyCode: string): boolean {
    return this.pressedKeys.has(keyCode);
  }
}
