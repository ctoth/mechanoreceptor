/**
 * Represents a generic input source for the Mechanoreceptor library.
 * This interface should be implemented by all specific input source classes
 * (e.g., KeyboardSource, MouseSource, GamepadSource, TouchSource).
 */
export interface InputSource {
  /**
   * Initializes the input source.
   * This method should set up any necessary event listeners or state management.
   */
  initialize(): void;

  /**
   * Updates the state of the input source.
   * This method should be called once per frame in the game loop.
   * For event-based input sources, this method might be empty.
   */
  update(): void;

  /**
   * Disposes of the input source.
   * This method should clean up any resources, remove event listeners,
   * and reset any state when the input source is no longer needed.
   */
  dispose(): void;
}
