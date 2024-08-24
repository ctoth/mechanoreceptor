import { InputSource } from "./InputSource";
import { throttle, debounce } from "./utils/throttleDebounce";

/**
 * MouseSource class
 * 
 * This class represents a mouse input source for the Mechanoreceptor library.
 * It handles mouse movement and button presses with advanced features like
 * throttling and debouncing to optimize performance and responsiveness.
 * 
 * Key features:
 * - Tracks mouse position and button states
 * - Implements throttling for high-frequency mouse move events
 * - Uses debouncing for more stable position updates
 * - Fully implements the InputSource interface
 * 
 * The MouseSource class is designed to provide smooth and efficient mouse input
 * handling for games and interactive applications. It's particularly useful in
 * scenarios where you need to balance responsiveness with performance, such as
 * in fast-paced games or complex user interfaces.
 * 
 * @implements {InputSource}
 */
export class MouseSource implements InputSource {
  private position: { x: number; y: number } = { x: 0, y: 0 };
  private buttons: boolean[] = [false, false, false];
  private throttledMouseMove: (event: MouseEvent) => void;
  private debouncedMouseMove: (event: MouseEvent) => void;

  /**
   * Creates a new MouseSource instance.
   * 
   * @param throttleLimit - The throttle limit for mouse move events in milliseconds.
   *                        This helps reduce the frequency of updates for high-speed movements.
   *                        Default is 16ms (approximately 60fps).
   * @param debounceDelay - The debounce delay for mouse move events in milliseconds.
   *                        This stabilizes position updates by waiting for a pause in the input.
   *                        Default is 100ms.
   * 
   * @example
   * ```typescript
   * // Create a MouseSource with default settings
   * const mouseSource = new MouseSource();
   * 
   * // Create a MouseSource with custom throttle and debounce settings
   * const customMouseSource = new MouseSource(8, 50); // 8ms throttle, 50ms debounce
   * ```
   */
  constructor(throttleLimit: number = 16, debounceDelay: number = 100) {
    this.throttledMouseMove = throttle(this.updatePosition, throttleLimit);
    this.debouncedMouseMove = debounce(this.updatePosition, debounceDelay);
  }

  /**
   * Initializes the mouse input source by setting up event listeners.
   * This method should be called before using the MouseSource instance.
   * 
   * Sets up listeners for:
   * - mousemove: Tracks mouse position
   * - mousedown: Detects button presses
   * - mouseup: Detects button releases
   * 
   * @implements {InputSource.initialize}
   */
  initialize(): void {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  /**
   * Updates the mouse input state.
   * 
   * This method is part of the InputSource interface but is not used in MouseSource
   * as it relies on event listeners for real-time updates. It's included for
   * compatibility with the InputSource interface.
   * 
   * @implements {InputSource.update}
   */
  update(): void {
    // MouseSource uses event listeners, so no action is needed here
  }

  /**
   * Disposes of the mouse input source by removing event listeners.
   * Call this method when the MouseSource instance is no longer needed to prevent memory leaks.
   * 
   * @implements {InputSource.dispose}
   */
  dispose(): void {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }

  /**
   * Handles the mouse move event by calling both throttled and debounced update functions.
   * This dual approach provides both immediate feedback and stable final positions.
   * 
   * @param event - The MouseEvent object containing the new mouse position.
   * @private
   */
  private handleMouseMove = (event: MouseEvent): void => {
    this.throttledMouseMove(event);
    this.debouncedMouseMove(event);
  };

  /**
   * Updates the stored mouse position.
   * This method is called by both throttled and debounced handlers to update the internal state.
   * 
   * @param event - The MouseEvent object containing the new mouse position.
   * @private
   */
  private updatePosition = (event: MouseEvent): void => {
    this.position.x = event.clientX;
    this.position.y = event.clientY;
  };

  /**
   * Handles the mouse down event by updating the button state.
   * Supports up to three mouse buttons (left, middle, right).
   * 
   * @param event - The MouseEvent object containing information about the button press.
   * @private
   */
  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button >= 0 && event.button < 3) {
      this.buttons[event.button] = true;
    }
  };

  /**
   * Handles the mouse up event by updating the button state.
   * Supports up to three mouse buttons (left, middle, right).
   * 
   * @param event - The MouseEvent object containing information about the button release.
   * @private
   */
  private handleMouseUp = (event: MouseEvent): void => {
    if (event.button >= 0 && event.button < 3) {
      this.buttons[event.button] = false;
    }
  };

  /**
   * Gets the current mouse position.
   * 
   * @returns An object with x and y coordinates of the mouse position.
   * 
   * @example
   * ```typescript
   * const mouseSource = new MouseSource();
   * mouseSource.initialize();
   * 
   * // Later in your game loop or event handler
   * const { x, y } = mouseSource.getPosition();
   * console.log(`Mouse is at (${x}, ${y})`);
   * ```
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Checks if a specific mouse button is currently pressed.
   * 
   * @param button - The button index to check:
   *                 0 for left button
   *                 1 for middle button (usually the wheel)
   *                 2 for right button
   * @returns True if the specified button is pressed, false otherwise.
   * 
   * @example
   * ```typescript
   * const mouseSource = new MouseSource();
   * mouseSource.initialize();
   * 
   * // Check if the left mouse button is pressed
   * if (mouseSource.isButtonPressed(0)) {
   *   console.log('Left mouse button is pressed');
   * }
   * 
   * // Check if the right mouse button is pressed
   * if (mouseSource.isButtonPressed(2)) {
   *   console.log('Right mouse button is pressed');
   * }
   * ```
   */
  isButtonPressed(button: number): boolean {
    return this.buttons[button] || false;
  }
}
