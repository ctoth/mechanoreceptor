import { InputSource } from './InputSource';

export class MouseSource implements InputSource {
  private position: { x: number; y: number } = { x: 0, y: 0 };
  private buttons: boolean[] = [false, false, false];

  initialize(): void {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  update(): void {
    // For mouse, we don't need to do anything in the update method
    // as we're using event listeners
  }

  dispose(): void {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseMove = (event: MouseEvent): void => {
    this.position.x = event.clientX;
    this.position.y = event.clientY;
  }

  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button >= 0 && event.button < 3) {
      this.buttons[event.button] = true;
    }
  }

  private handleMouseUp = (event: MouseEvent): void => {
    if (event.button >= 0 && event.button < 3) {
      this.buttons[event.button] = false;
    }
  }

  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  isButtonPressed(button: number): boolean {
    return this.buttons[button] || false;
  }
}
