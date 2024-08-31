import { InputSource } from './InputSource';

/**
 * Extends the standard Gamepad interface to include vibration capabilities.
 * This interface is used internally to type-check gamepads with haptic feedback support.
 */
interface GamepadWithHaptics extends Gamepad {
  vibrationActuator?: {
    playEffect(type: string, params: {
      duration: number,
      strongMagnitude: number,
      weakMagnitude: number
    }): Promise<void>;
  };
}

/**
 * Represents the current state of a gamepad, including button states and axis values.
 */
interface GamepadState {
  /** An array of button states, each containing pressed status and analog value. */
  buttons: { pressed: boolean; value: number }[];
  /** An array of axis values, typically ranging from -1 to 1. */
  axes: number[];
}

/**
 * GamepadSource class
 * 
 * This class manages gamepad input for the Mechanoreceptor library. It handles gamepad
 * connections, disconnections, state updates, and provides methods to query gamepad state.
 * It also supports gamepad vibration for compatible devices.
 * 
 * Key features:
 * - Automatic detection of gamepad connections and disconnections
 * - Regular polling of gamepad state to ensure up-to-date input data
 * - Methods to query button states, axis values, and overall gamepad state
 * - Support for gamepad vibration (haptic feedback) on compatible devices
 * 
 * The GamepadSource class is designed to work seamlessly with various gamepad models
 * and provides a consistent interface for gamepad input across different browsers and devices.
 * 
 * @implements {InputSource}
 */
export class GamepadSource implements InputSource {
  private gamepads: Map<number, GamepadState> = new Map();
  private connectedGamepads: Set<number> = new Set();
  private pollingInterval: number | null = null;

  /**
   * Initializes the GamepadSource.
   * Sets up event listeners for gamepad connections and starts the polling mechanism.
   */
  initialize(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this.handleGamepadConnected);
      window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
      this.startPolling();
    } else {
      console.warn('GamepadSource: window is not defined, skipping initialization');
    }
  }

  /**
   * Updates the state of all connected gamepads.
   * This method is called automatically by the polling mechanism,
   * but can also be called manually if immediate updates are required.
   */
  update(): void {
    this.pollGamepads();
  }

  /**
   * Disposes of the GamepadSource.
   * Removes event listeners and stops the polling mechanism.
   */
  dispose(): void {
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    this.stopPolling();
  }

  /**
   * Handles the 'gamepadconnected' event.
   * @param event - The GamepadEvent object containing information about the connected gamepad.
   */
  private handleGamepadConnected = (event: GamepadEvent): void => {
    this.connectedGamepads.add(event.gamepad.index);
    console.log(`Gamepad connected at index ${event.gamepad.index}: ${event.gamepad.id}`);
    console.log('Connected gamepads after connection:', JSON.stringify(Array.from(this.connectedGamepads)));
  }

  /**
   * Handles the 'gamepaddisconnected' event.
   * @param event - The GamepadEvent object containing information about the disconnected gamepad.
   */
  private handleGamepadDisconnected = (event: GamepadEvent): void => {
    this.connectedGamepads.delete(event.gamepad.index);
    this.gamepads.delete(event.gamepad.index);
    console.log(`Gamepad disconnected at index ${event.gamepad.index}: ${event.gamepad.id}`);
  }

  /**
   * Starts the gamepad polling mechanism.
   * This ensures regular updates of gamepad state.
   */
  private startPolling(): void {
    if (this.pollingInterval === null) {
      this.pollingInterval = window.setInterval(() => this.pollGamepads(), 16); // ~60fps
    }
  }

  /**
   * Stops the gamepad polling mechanism.
   */
  private stopPolling(): void {
    if (this.pollingInterval !== null) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Polls all connected gamepads and updates their states.
   */
  private pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad && this.connectedGamepads.has(gamepad.index)) {
        this.updateGamepadState(gamepad);
      }
    }
  }

  /**
   * Updates the state of a single gamepad.
   * @param gamepad - The Gamepad object to update.
   */
  updateGamepadState(gamepad: Gamepad): void {
    const state: GamepadState = {
      buttons: gamepad.buttons.map(button => ({ pressed: button.pressed, value: button.value })),
      axes: [...gamepad.axes]
    };
    this.gamepads.set(gamepad.index, state);
    console.log(`Updated gamepad state for index ${gamepad.index}:`, state);
  }

  /**
   * Checks if a specific button on a gamepad is currently pressed.
   * @param gamepadIndex - The index of the gamepad to check.
   * @param buttonIndex - The index of the button to check.
   * @returns True if the button is pressed, false otherwise.
   */
  isButtonPressed(gamepadIndex: number, buttonIndex: number): boolean {
    const gamepad = this.gamepads.get(gamepadIndex);
    return gamepad ? gamepad.buttons[buttonIndex]?.pressed || false : false;
  }

  isButtonPressedRaw(gamepadIndex: number, buttonIndex: number): boolean {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];
    return gamepad ? gamepad.buttons[buttonIndex]?.pressed || false : false;
  }

  /**
   * Gets the analog value of a specific button on a gamepad.
   * @param gamepadIndex - The index of the gamepad to check.
   * @param buttonIndex - The index of the button to check.
   * @returns The analog value of the button, typically between 0 and 1.
   */
  getButtonValue(gamepadIndex: number, buttonIndex: number): number {
    const gamepad = this.gamepads.get(gamepadIndex);
    return gamepad ? gamepad.buttons[buttonIndex]?.value || 0 : 0;
  }

  /**
   * Gets the value of a specific axis on a gamepad.
   * @param gamepadIndex - The index of the gamepad to check.
   * @param axisIndex - The index of the axis to check.
   * @returns The value of the axis, typically between -1 and 1.
   */
  getAxisValue(gamepadIndex: number, axisIndex: number): number {
    const gamepad = this.gamepads.get(gamepadIndex);
    return gamepad ? gamepad.axes[axisIndex] || 0 : 0;
  }

  /**
   * Gets an array of indices of all currently connected gamepads.
   * @returns An array of gamepad indices.
   */
  getConnectedGamepads(): number[] {
    return Array.from(this.connectedGamepads);
  }

  /**
   * Gets the current state of a specific gamepad.
   * @param gamepadIndex - The index of the gamepad to get the state for.
   * @returns The current state of the gamepad, or undefined if the gamepad is not connected.
   */
  getGamepadState(gamepadIndex: number): GamepadState | undefined {
    return this.gamepads.get(gamepadIndex);
  }

  /**
   * Triggers vibration on a gamepad with haptic feedback support.
   * @param gamepadIndex - The index of the gamepad to vibrate.
   * @param duration - The duration of the vibration in milliseconds.
   * @param weakMagnitude - The intensity of the weak actuator (0 to 1).
   * @param strongMagnitude - The intensity of the strong actuator (0 to 1).
   */
  vibrate(gamepadIndex: number, duration: number, weakMagnitude: number, strongMagnitude: number): void {
    const gamepad = navigator.getGamepads()[gamepadIndex] as GamepadWithHaptics;
    if (gamepad && gamepad.vibrationActuator) {
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration: duration,
        weakMagnitude: weakMagnitude,
        strongMagnitude: strongMagnitude
      }).catch(error => console.error('Vibration error:', error));
    }
  }
}
