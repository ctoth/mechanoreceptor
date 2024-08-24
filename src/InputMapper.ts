import { InputMapping, MappingConfigManager } from './InputMapping';
import { KeyboardSource } from './KeyboardSource';
import { MouseSource } from './MouseSource';
import { GamepadSource } from './GamepadSource';
import { TouchSource } from './TouchSource';
import { ComboSystem, ComboDefinition } from './ComboSystem';
import { InputBuffer } from './InputBuffer';

/**
 * The InputMapper class is responsible for managing and coordinating various input sources,
 * mapping raw inputs to game actions, and handling input-related features like combos and input buffering.
 */
export class InputMapper {
  private mappingManager: MappingConfigManager;
  private keyboardSource: KeyboardSource;
  private mouseSource: MouseSource;
  private gamepadSource: GamepadSource;
  private touchSource: TouchSource;
  private comboSystem: ComboSystem;
  private inputBuffer: InputBuffer;
  private currentContext: string = 'default';

  /**
   * Creates a new InputMapper instance.
   * 
   * @param mappingManager - The MappingConfigManager instance for handling input mappings.
   * @param keyboardSource - The KeyboardSource instance for keyboard inputs.
   * @param mouseSource - The MouseSource instance for mouse inputs.
   * @param gamepadSource - The GamepadSource instance for gamepad inputs.
   * @param touchSource - The TouchSource instance for touch inputs.
   * @param bufferSize - The size of the input buffer (default: 10).
   * @param bufferDuration - The duration of the input buffer in milliseconds (default: 100).
   */
  constructor(
    mappingManager: MappingConfigManager,
    keyboardSource: KeyboardSource,
    mouseSource: MouseSource,
    gamepadSource: GamepadSource,
    touchSource: TouchSource,
    bufferSize: number = 10,
    bufferDuration: number = 100
  ) {
    this.mappingManager = mappingManager;
    this.keyboardSource = keyboardSource;
    this.mouseSource = mouseSource;
    this.gamepadSource = gamepadSource;
    this.touchSource = touchSource;
    this.comboSystem = new ComboSystem();
    this.inputBuffer = new InputBuffer(bufferSize, bufferDuration);
  }

  /**
   * Sets the current input context.
   * @param contextId - The ID of the context to set.
   */
  setContext(contextId: string): void {
    this.currentContext = contextId;
  }

  /**
   * Maps raw inputs to game actions based on the current context and input mappings.
   * This method should be called once per frame in the game loop.
   * @returns An array of triggered action IDs.
   */
  mapInput(): string[] {
    const mappings = this.mappingManager.getMappingsForContext(this.currentContext);
    const triggeredActions: string[] = [];

    for (const mapping of mappings) {
      if (this.isInputActive(mapping)) {
        triggeredActions.push(mapping.actionId);
        this.inputBuffer.addInput(mapping.actionId);
        
        // Check for combos
        const comboInput = {
          inputType: mapping.inputType,
          inputCode: mapping.inputCode
        };
        const triggeredCombos = this.comboSystem.checkCombos(comboInput);
        triggeredActions.push(...triggeredCombos);
        triggeredCombos.forEach(combo => {
          this.inputBuffer.addInput(combo);
        });
      }
    }

    return triggeredActions;
  }

  /**
   * Retrieves recent inputs from the input buffer.
   * @param duration - Optional duration in milliseconds to limit the returned inputs.
   * @returns An array of recent input action IDs.
   */
  getRecentInputs(duration?: number): string[] {
    return this.inputBuffer.getRecentInputs(duration);
  }

  /**
   * Clears the input buffer.
   */
  clearInputBuffer(): void {
    this.inputBuffer.clear();
  }

  /**
   * Sets the size of the input buffer.
   * @param size - The new size of the buffer.
   */
  setInputBufferSize(size: number): void {
    this.inputBuffer.setBufferSize(size);
  }

  /**
   * Sets the duration of the input buffer.
   * @param duration - The new duration of the buffer in milliseconds.
   */
  setInputBufferDuration(duration: number): void {
    this.inputBuffer.setBufferDuration(duration);
  }

  /**
   * Checks if a specific input mapping is currently active.
   * @param mapping - The input mapping to check.
   * @returns True if the input is active, false otherwise.
   * @private
   */
  private isInputActive(mapping: InputMapping): boolean {
    switch (mapping.inputType) {
      case 'keyboard':
        return this.keyboardSource.isKeyPressed(mapping.inputCode as string);
      case 'mouse':
        return this.mouseSource.isButtonPressed(mapping.inputCode as number);
      case 'gamepad':
        // Assuming the first connected gamepad is used
        const gamepadIndex = this.gamepadSource.getConnectedGamepads()[0];
        return this.gamepadSource.isButtonPressed(gamepadIndex, mapping.inputCode as number);
      case 'touch':
        // For touch, we might want to implement more complex logic
        return this.touchSource.isTouching();
      default:
        return false;
    }
  }

  /**
   * Adds a new combo definition to the combo system.
   * @param combo - The combo definition to add.
   */
  addCombo(combo: ComboDefinition): void {
    this.comboSystem.addCombo(combo);
  }

  /**
   * Removes a combo definition from the combo system.
   * @param comboId - The ID of the combo to remove.
   */
  removeCombo(comboId: string): void {
    this.comboSystem.removeCombo(comboId);
  }
}
