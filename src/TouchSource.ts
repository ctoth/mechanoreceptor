import { InputSource } from './InputSource';

export class TouchSource implements InputSource {
  private touches: Touch[] = [];

  initialize(): void {
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('touchcancel', this.handleTouchCancel);
  }

  update(): void {
    // For touch, we don't need to do anything in the update method
    // as we're using event listeners
  }

  dispose(): void {
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchcancel', this.handleTouchCancel);
  }

  private handleTouchStart = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
  }

  private handleTouchMove = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
  }

  private handleTouchEnd = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
  }

  private handleTouchCancel = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
  }

  private updateTouches(touchList: TouchList): void {
    this.touches = Array.from(touchList);
  }

  getTouches(): Touch[] {
    return [...this.touches];
  }

  isTouching(): boolean {
    return this.touches.length > 0;
  }
}
