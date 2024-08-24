import { InputSource } from './InputSource';
import { throttle, debounce } from '../utils/throttleDebounce';

/**
 * Represents a mouse input source for the Mechanoreceptor library.
 * Handles mouse movement and button presses with throttling and debouncing.
 */
export class MouseSource implements InputSource {
  private position: { x: number; y: number } = { x: 0, y: 0 };
  private buttons: boolean[] = [false, false, false];
  private throttledMouseMove: (event: MouseEvent) => void;
  private debouncedMouseMove: (event: MouseEvent) => void;

  /**
   * Creates a new MouseSource instance.
   * @param throttleLimit - The throttle limit for mouse move events in milliseconds (default: 16).
   * @param debounceDelay - The debounce delay for mouse move events in milliseconds (default: 100).
   */
  constructor(throttleLimit: number = 16, debounceDelay: number = 100) {
    this.throttledMouseMove = throttle(this.updatePosition, throttleLimit);
    this.debouncedMouseMove = debounce(this.updatePosition, debounceDelay);
  }

  /**
   * Initializes the mouse input source by setting up event listeners.
   */
  initialize(): void {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * Updates the mouse input state. This method is empty for MouseSource as it uses event listeners.
   */
  update(): void {
    // For mouse, we don't need to do anything in the update method
    // as we're using event listeners
  }

  /**
   * Disposes of the mouse input source by removing event listeners.
   */
  dispose(): void {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * Handles the mouse move event by calling both throttled and debounced update functions.
   * @param event - The MouseEvent object.
   */
  private handleMouseMove = (event: MouseEvent): void => {
    this.throttledMouseMove(event);
    this.debouncedMouseMove(event);
  }

  /**
   * Updates the stored mouse position.
   * @param event - The MouseEvent object.
   */
  private updatePosition = (event: MouseEvent): void => {
    this.position.x = event.clientX;
    this.position.y = event.clientY;
  }

  /**
   * Handles the mouse down event by updating the button state.
   * @param event - The MouseEvent object.
   */
  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button >= 0 && event.button < 3) {
      this.buttons[event.button] = true;
    }
  }

  /**
   * Handles the mouse up event by updating the button state.
   * @param event - The MouseEvent object.
   */
  private handleMouseUp = (event: MouseEvent): void => {
    if (event.button >= 0 && event.button < 3) {
      this.buttons[event.button] = false;
    }
  }

  /**
   * Gets the current mouse position.
   * @returns An object with x and y coordinates of the mouse position.
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Checks if a specific mouse button is currently pressed.
   * @param button - The button index to check (0 for left, 1 for middle, 2 for right).
   * @returns True if the button is pressed, false otherwise.
   */
  isButtonPressed(button: number): boolean {
    return this.buttons[button] || false;
  }
}
