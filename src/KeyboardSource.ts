import { InputSource } from './InputSource';

export class KeyboardSource implements InputSource {
  private pressedKeys: Set<string> = new Set();

  initialize(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  update(): void {
    // For keyboard, we don't need to do anything in the update method
    // as we're using event listeners
  }

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.pressedKeys.add(event.code);
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  }

  isKeyPressed(keyCode: string): boolean {
    return this.pressedKeys.has(keyCode);
  }
}
