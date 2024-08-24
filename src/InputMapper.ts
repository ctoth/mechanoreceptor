import { InputMapping, MappingConfigManager } from './InputMapping';
import { KeyboardSource } from './KeyboardSource';
import { MouseSource } from './MouseSource';
import { GamepadSource } from './GamepadSource';
import { TouchSource } from './TouchSource';
import { ComboSystem, ComboDefinition } from './ComboSystem';
import { InputBuffer } from './InputBuffer';

/**
 * The InputMapper class is the central component of the Mechanoreceptor input handling system.
 * It coordinates various input sources, maps raw inputs to game actions, and manages features
 * like input combos and buffering.
 * 
 * @example
 * ```typescript
 * const mappingManager = new MappingConfigManager();
 * const keyboardSource = new KeyboardSource();
 * const mouseSource = new MouseSource();
 * const gamepadSource = new GamepadSource();
 * const touchSource = new TouchSource();
 * 
 * const inputMapper = new InputMapper(
 *   mappingManager,
 *   keyboardSource,
 *   mouseSource,
 *   gamepadSource,
 *   touchSource
 * );
 * 
 * // In your game loop
 * function gameLoop() {
 *   const triggeredActions = inputMapper.mapInput();
 *   // Handle triggered actions
 *   requestAnimationFrame(gameLoop);
 * }
 * 
 * gameLoop();
 * ```
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
   * 
   * @throws {Error} If any of the required parameters are missing or invalid.
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
    if (!mappingManager || !keyboardSource || !mouseSource || !gamepadSource || !touchSource) {
      throw new Error('All input sources and mapping manager must be provided');
    }

    this.mappingManager = mappingManager;
    this.keyboardSource = keyboardSource;
    this.mouseSource = mouseSource;
    this.gamepadSource = gamepadSource;
    this.touchSource = touchSource;
    this.comboSystem = new ComboSystem();
    this.inputBuffer = new InputBuffer(bufferSize, bufferDuration);
  }

  /**
   * Sets the current input context. Different contexts can have different input mappings,
   * allowing for context-specific input handling (e.g., menu navigation vs. in-game controls).
   * 
   * @param contextId - The ID of the context to set.
   * 
   * @example
   * ```typescript
   * inputMapper.setContext('mainMenu');
   * // Now, input mapping will use the 'mainMenu' context
   * 
   * inputMapper.setContext('inGame');
   * // Switched to 'inGame' context, which may have different input mappings
   * ```
   */
  setContext(contextId: string): void {
    this.currentContext = contextId;
  }

  /**
   * Maps raw inputs to game actions based on the current context and input mappings.
   * This method should be called once per frame in the game loop.
   * 
   * @returns An array of triggered action IDs.
   * 
   * @example
   * ```typescript
   * function gameLoop() {
   *   const triggeredActions = inputMapper.mapInput();
   *   
   *   for (const action of triggeredActions) {
   *     switch (action) {
   *       case 'jump':
   *         player.jump();
   *         break;
   *       case 'shoot':
   *         player.shoot();
   *         break;
   *       // ... handle other actions
   *     }
   *   }
   * 
   *   requestAnimationFrame(gameLoop);
   * }
   * ```
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
   * 
   * @param duration - Optional duration in milliseconds to limit the returned inputs.
   * @returns An array of recent input action IDs.
   * 
   * @example
   * ```typescript
   * // Get all recent inputs
   * const allRecentInputs = inputMapper.getRecentInputs();
   * 
   * // Get inputs from the last 500ms
   * const recentInputs = inputMapper.getRecentInputs(500);
   * ```
   */
  getRecentInputs(duration?: number): string[] {
    return this.inputBuffer.getRecentInputs(duration);
  }

  /**
   * Clears the input buffer, removing all stored inputs.
   * 
   * @example
   * ```typescript
   * // Clear the input buffer when transitioning between game states
   * function enterNewGameState() {
   *   inputMapper.clearInputBuffer();
   *   // ... other state transition logic
   * }
   * ```
   */
  clearInputBuffer(): void {
    this.inputBuffer.clear();
  }

  /**
   * Sets the size of the input buffer.
   * 
   * @param size - The new size of the buffer.
   * 
   * @example
   * ```typescript
   * // Increase buffer size for more complex input sequences
   * inputMapper.setInputBufferSize(20);
   * ```
   */
  setInputBufferSize(size: number): void {
    this.inputBuffer.setBufferSize(size);
  }

  /**
   * Sets the duration of the input buffer.
   * 
   * @param duration - The new duration of the buffer in milliseconds.
   * 
   * @example
   * ```typescript
   * // Set a longer buffer duration for slower-paced gameplay
   * inputMapper.setInputBufferDuration(500);
   * ```
   */
  setInputBufferDuration(duration: number): void {
    this.inputBuffer.setBufferDuration(duration);
  }

  /**
   * Checks if a specific input mapping is currently active.
   * 
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
   * 
   * @param combo - The combo definition to add.
   * 
   * @example
   * ```typescript
   * const hadoukenCombo: ComboDefinition = {
   *   id: 'hadouken',
   *   sequence: [
   *     { inputType: 'keyboard', inputCode: 'ArrowDown' },
   *     { inputType: 'keyboard', inputCode: 'ArrowRight' },
   *     { inputType: 'keyboard', inputCode: 'KeyP' }
   *   ],
   *   maxTimeWindow: 500
   * };
   * 
   * inputMapper.addCombo(hadoukenCombo);
   * ```
   */
  addCombo(combo: ComboDefinition): void {
    this.comboSystem.addCombo(combo);
  }

  /**
   * Removes a combo definition from the combo system.
   * 
   * @param comboId - The ID of the combo to remove.
   * 
   * @example
   * ```typescript
   * // Remove the 'hadouken' combo
   * inputMapper.removeCombo('hadouken');
   * ```
   */
  removeCombo(comboId: string): void {
    this.comboSystem.removeCombo(comboId);
  }
}
