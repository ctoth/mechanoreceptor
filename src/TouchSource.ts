import { InputSource } from './InputSource';

/**
 * TouchSource class
 * 
 * This class represents a touch input source for the Mechanoreceptor library.
 * It handles touch events on touch-enabled devices, providing a consistent
 * interface for touch input across different platforms and browsers.
 * 
 * Key features:
 * - Tracks multiple simultaneous touch points
 * - Handles touch start, move, end, and cancel events
 * - Provides methods to query current touch state
 * - Implements the InputSource interface for seamless integration with InputMapper
 * 
 * The TouchSource class is particularly useful for developing games and interactive
 * applications that need to support touch input on mobile devices, tablets, and
 * touch-enabled desktops/laptops.
 * 
 * @implements {InputSource}
 */
export class TouchSource implements InputSource {
  /** Array to store current touch points */
  private touches: Touch[] = [];

  /**
   * Initializes the TouchSource by setting up event listeners for touch events.
   * This method should be called before using the TouchSource instance.
   * 
   * Sets up listeners for:
   * - touchstart: Detects new touch points
   * - touchmove: Tracks movement of existing touch points
   * - touchend: Detects when touch points are removed
   * - touchcancel: Handles interrupted touch events
   * 
   * @implements {InputSource.initialize}
   */
  initialize(): void {
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('touchcancel', this.handleTouchCancel);
  }

  /**
   * Updates the touch input state.
   * 
   * This method is part of the InputSource interface but is not used in TouchSource
   * as it relies on event listeners for real-time updates. It's included for
   * compatibility with the InputSource interface.
   * 
   * @implements {InputSource.update}
   */
  update(): void {
    // TouchSource uses event listeners, so no action is needed here
  }

  /**
   * Disposes of the TouchSource by removing event listeners.
   * Call this method when the TouchSource instance is no longer needed to prevent memory leaks.
   * 
   * @implements {InputSource.dispose}
   */
  dispose(): void {
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchcancel', this.handleTouchCancel);
  }

  /**
   * Handles the 'touchstart' event.
   * Updates the internal touches array with new touch points.
   * 
   * @param event - The TouchEvent object containing information about the new touch points.
   * @private
   */
  private handleTouchStart = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      (window as any).lastTouch = { x: touch.clientX, y: touch.clientY };
    }
  }

  /**
   * Handles the 'touchmove' event.
   * Updates the internal touches array with the current positions of touch points.
   * 
   * @param event - The TouchEvent object containing information about the moved touch points.
   * @private
   */
  private handleTouchMove = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
  }

  /**
   * Handles the 'touchend' event.
   * Updates the internal touches array, removing touch points that are no longer active.
   * 
   * @param event - The TouchEvent object containing information about the ended touch points.
   * @private
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
  }

  /**
   * Handles the 'touchcancel' event.
   * Updates the internal touches array, typically clearing all touch points.
   * 
   * @param event - The TouchEvent object containing information about the cancelled touch points.
   * @private
   */
  private handleTouchCancel = (event: TouchEvent): void => {
    this.updateTouches(event.touches);
  }

  /**
   * Updates the internal touches array with the current state of touch points.
   * 
   * @param touchList - The TouchList object containing the current touch points.
   * @private
   */
  private updateTouches(touchList: TouchList): void {
    this.touches = Array.from(touchList);
  }

  /**
   * Gets the current touch points.
   * 
   * @returns An array of Touch objects representing the current touch points.
   * 
   * @example
   * ```typescript
   * const touchSource = new TouchSource();
   * touchSource.initialize();
   * 
   * // Later in your game loop or event handler
   * const currentTouches = touchSource.getTouches();
   * for (const touch of currentTouches) {
   *   console.log(`Touch at (${touch.clientX}, ${touch.clientY})`);
   * }
   * ```
   */
  getTouches(): Touch[] {
    return [...this.touches];
  }

  /**
   * Checks if there are any active touch points.
   * 
   * @returns True if there are active touch points, false otherwise.
   * 
   * @example
   * ```typescript
   * const touchSource = new TouchSource();
   * touchSource.initialize();
   * 
   * // In your game loop or event handler
   * if (touchSource.isTouching()) {
   *   console.log('Screen is being touched');
   * } else {
   *   console.log('No touch detected');
   * }
   * ```
   */
  isTouching(): boolean {
    return this.touches.length > 0;
  }
}
