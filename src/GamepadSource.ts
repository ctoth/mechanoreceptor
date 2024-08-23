import { InputSource } from './InputSource';

interface GamepadState {
  buttons: { pressed: boolean; value: number }[];
  axes: number[];
}

export class GamepadSource implements InputSource {
  private gamepads: Map<number, GamepadState> = new Map();
  private connectedGamepads: Set<number> = new Set();
  private pollingInterval: number | null = null;

  initialize(): void {
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    this.startPolling();
  }

  update(): void {
    this.pollGamepads();
  }

  dispose(): void {
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    this.stopPolling();
  }

  private handleGamepadConnected = (event: GamepadEvent): void => {
    this.connectedGamepads.add(event.gamepad.index);
    console.log(`Gamepad connected at index ${event.gamepad.index}: ${event.gamepad.id}`);
  }

  private handleGamepadDisconnected = (event: GamepadEvent): void => {
    this.connectedGamepads.delete(event.gamepad.index);
    this.gamepads.delete(event.gamepad.index);
    console.log(`Gamepad disconnected at index ${event.gamepad.index}: ${event.gamepad.id}`);
  }

  private startPolling(): void {
    if (this.pollingInterval === null) {
      this.pollingInterval = window.setInterval(() => this.pollGamepads(), 16); // ~60fps
    }
  }

  private stopPolling(): void {
    if (this.pollingInterval !== null) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad && this.connectedGamepads.has(gamepad.index)) {
        this.updateGamepadState(gamepad);
      }
    }
  }

  private updateGamepadState(gamepad: Gamepad): void {
    const state: GamepadState = {
      buttons: gamepad.buttons.map(button => ({ pressed: button.pressed, value: button.value })),
      axes: [...gamepad.axes]
    };
    this.gamepads.set(gamepad.index, state);
  }

  isButtonPressed(gamepadIndex: number, buttonIndex: number): boolean {
    const gamepad = this.gamepads.get(gamepadIndex);
    return gamepad ? gamepad.buttons[buttonIndex]?.pressed || false : false;
  }

  getButtonValue(gamepadIndex: number, buttonIndex: number): number {
    const gamepad = this.gamepads.get(gamepadIndex);
    return gamepad ? gamepad.buttons[buttonIndex]?.value || 0 : 0;
  }

  getAxisValue(gamepadIndex: number, axisIndex: number): number {
    const gamepad = this.gamepads.get(gamepadIndex);
    return gamepad ? gamepad.axes[axisIndex] || 0 : 0;
  }

  getConnectedGamepads(): number[] {
    return Array.from(this.connectedGamepads);
  }

  getGamepadState(gamepadIndex: number): GamepadState | undefined {
    return this.gamepads.get(gamepadIndex);
  }

  vibrate(gamepadIndex: number, duration: number, weakMagnitude: number, strongMagnitude: number): void {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (gamepad && 'vibrationActuator' in gamepad && gamepad.vibrationActuator) {
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: duration,
        weakMagnitude: weakMagnitude,
        strongMagnitude: strongMagnitude
      });
    }
  }
}
