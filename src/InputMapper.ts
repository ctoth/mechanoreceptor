import { InputMapping, MappingConfigManager } from "./InputMapping";
import { KeyboardSource } from "./KeyboardSource";
import { MouseSource } from "./MouseSource";
import { GamepadSource } from "./GamepadSource";
import { TouchSource } from "./TouchSource";
import { ComboSystem, ComboDefinition } from "./ComboSystem";
import { InputBuffer } from "./InputBuffer";
import { InputSource } from "./InputSource";

/**
 * The InputMapper class is the central component of the Mechanoreceptor input handling system.
 * It orchestrates the interaction between various input sources (keyboard, mouse, gamepad, touch),
 * mapping raw inputs to game actions, managing input combos, and providing an input buffer for
 * advanced input processing.
 *
 * Key features:
 * - Unified input handling across multiple input sources
 * - Context-based input mapping for different game states
 * - Support for complex input combinations (combos)
 * - Input buffering for timing-sensitive inputs
 * - Extensible architecture for adding new input sources
 *
 * The InputMapper acts as a bridge between the low-level input events and high-level game actions,
 * allowing developers to create responsive and flexible control schemes for their games.
 *
 * @example
 * ```typescript
 * // Initialize input sources
 * const mappingManager = new MappingConfigManager();
 * const keyboardSource = new KeyboardSource();
 * const mouseSource = new MouseSource();
 * const gamepadSource = new GamepadSource();
 * const touchSource = new TouchSource();
 *
 * // Create the InputMapper
 * const inputMapper = new InputMapper(
 *   mappingManager,
 *   keyboardSource,
 *   mouseSource,
 *   gamepadSource,
 *   touchSource
 * );
 *
 * // Load input mappings
 * mappingManager.loadMappings(JSON.stringify([
 *   { contextId: 'game', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
 *   { contextId: 'game', actionId: 'shoot', inputType: 'mouse', inputCode: 0 }
 * ]));
 *
 * // Set the current context
 * inputMapper.setContext('game');
 *
 * // In your game loop
 * function gameLoop() {
 *   // Update input state
 *   inputMapper.update();
 *
 *   // Get triggered actions
 *   const triggeredActions = inputMapper.mapInput();
 *
 *   // Handle triggered actions
 *   for (const action of triggeredActions) {
 *     switch (action) {
 *       case 'jump':
 *         player.jump();
 *         break;
 *       case 'shoot':
 *         player.shoot();
 *         break;
 *     }
 *   }
 *
 *   // Continue the game loop
 *   requestAnimationFrame(gameLoop);
 * }
 *
 * // Start the game loop
 * gameLoop();
 * ```
 *
 * This example demonstrates how to set up the InputMapper, load mappings,
 * and use it within a game loop to handle player inputs.
 */
export class InputMapper {
  private mappingManager: MappingConfigManager;
  private comboSystem: ComboSystem;
  private inputBuffer: InputBuffer;
  private currentContext = "default";
  private keyboardSource: KeyboardSource;
  private mouseSource: MouseSource;
  private gamepadSource: GamepadSource;
  private touchSource: TouchSource;

  /**
   * Gets the current input context.
   * @returns The current context ID.
   */
  getCurrentContext(): string {
    return this.currentContext;
  }

  /**
   * Creates a new InputMapper instance.
   *
   * @param mappingManager - The MappingConfigManager instance for handling input mappings.
   * @param keyboardSource - The KeyboardSource instance.
   * @param mouseSource - The MouseSource instance.
   * @param gamepadSource - The GamepadSource instance.
   * @param touchSource - The TouchSource instance.
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
    bufferSize = 10,
    bufferDuration = 100
  ) {
    if (!mappingManager) {
      throw new Error("Mapping manager must be provided");
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
   * Use this method to switch between different input configurations based on the current
   * game state or screen. This enables you to reuse input codes for different actions in
   * different parts of your game without conflict.
   *
   * @param contextId - The ID of the context to set. This should match the `contextId`
   *                    used in your input mappings configuration.
   *
   * @example
   * ```typescript
   * // Configure mappings for different contexts
   * mappingManager.loadMappings(JSON.stringify([
   *   { contextId: 'mainMenu', actionId: 'select', inputType: 'keyboard', inputCode: 'Enter' },
   *   { contextId: 'mainMenu', actionId: 'back', inputType: 'keyboard', inputCode: 'Escape' },
   *   { contextId: 'inGame', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
   *   { contextId: 'inGame', actionId: 'pause', inputType: 'keyboard', inputCode: 'Escape' }
   * ]));
   *
   * // In the main menu
   * inputMapper.setContext('mainMenu');
   * // Now, 'Enter' will trigger 'select' and 'Escape' will trigger 'back'
   *
   * // When starting the game
   * inputMapper.setContext('inGame');
   * // Now, 'Space' will trigger 'jump' and 'Escape' will trigger 'pause'
   * ```
   *
   * By using contexts, you can create more intuitive and flexible control schemes
   * that adapt to different parts of your game.
   */
  setContext(contextId: string): void {
    this.currentContext = contextId;
  }

  /**
   * Maps raw inputs to game actions based on the current context and input mappings.
   * This method should be called once per frame in the game loop to process all active inputs
   * and return the corresponding game actions.
   *
   * The method performs the following steps:
   * 1. Retrieves the input mappings for the current context.
   * 2. Checks the state of all input sources (keyboard, mouse, gamepad, touch).
   * 3. Determines which mapped actions are triggered based on the active inputs.
   * 4. Processes any input combos that may have been triggered.
   * 5. Adds all triggered actions and combos to the input buffer.
   *
   * @returns An array of triggered action IDs. These are the string identifiers for game actions
   *          that were mapped to the current active inputs.
   *
   * @example
   * ```typescript
   * function gameLoop() {
   *   // Update game state
   *   updateGameState();
   *
   *   // Update input state
   *   inputMapper.update();
   *
   *   // Map inputs to actions
   *   const triggeredActions = inputMapper.mapInput();
   *
   *   // Handle triggered actions
   *   for (const action of triggeredActions) {
   *     switch (action) {
   *       case 'jump':
   *         player.jump();
   *         break;
   *       case 'shoot':
   *         player.shoot();
   *         break;
   *       case 'crouch':
   *         player.crouch();
   *         break;
   *       case 'useItem':
   *         player.useSelectedItem();
   *         break;
   *       // ... handle other actions
   *     }
   *   }
   *
   *   // Render game
   *   renderGame();
   *
   *   // Continue the game loop
   *   requestAnimationFrame(gameLoop);
   * }
   *
   * // Start the game loop
   * gameLoop();
   * ```
   *
   * This method is the core of the input handling system. By calling it each frame,
   * you ensure that your game consistently responds to player inputs with minimal latency.
   */
  mapInput(): string[] {
    const allMappings = this.mappingManager.getMappings();
    const mappings = allMappings.filter(
      mapping => mapping.contextId === this.currentContext
    );
    const triggeredActions: string[] = [];

    for (const mapping of mappings) {
      this.logInputState(mapping);
      const isActive = this.isInputActive(mapping);
      if (isActive) {
        triggeredActions.push(mapping.actionId);
        this.inputBuffer.addInput(mapping.actionId);

        // Check for combos
        const comboInput = {
          inputType: mapping.inputType,
          inputCode: mapping.inputCode,
        };
        const triggeredCombos = this.comboSystem.checkCombos(comboInput);
        triggeredActions.push(...triggeredCombos);
        triggeredCombos.forEach((combo) => {
          this.inputBuffer.addInput(combo);
        });
      }
    }

    console.log('Mapped actions:', triggeredActions);
    return triggeredActions;
  }

  private isInputActive(mapping: InputMapping): boolean {
    switch (mapping.inputType) {
      case 'keyboard':
        return this.keyboardSource.isKeyPressed(mapping.inputCode as string);
      case 'mouse':
        if (typeof mapping.inputCode === 'number') {
          return this.mouseSource.isButtonPressed(mapping.inputCode);
        }
        return false;
      case 'gamepad':
        const gamepadIndex = this.gamepadSource.getConnectedGamepads()[0];
        if (typeof mapping.inputCode === 'string' && mapping.inputCode.startsWith('button')) {
          const buttonIndex = parseInt(mapping.inputCode.slice(6), 10);
          return this.gamepadSource.isButtonPressed(gamepadIndex, buttonIndex);
        }
        return false;
      default:
        return false;
    }
  }

  private logInputState(mapping: InputMapping): void {
    console.log(`Checking if ${mapping.inputCode} is pressed: ${this.isInputActive(mapping)}`);
  }

  private getInputState(mapping: InputMapping): boolean {
    switch (mapping.inputType) {
      case "keyboard": {
        const keyState = this.keyboardSource.isKeyPressed(
          mapping.inputCode as string
        );
        return keyState;
      }
      case "mouse": {
        if (typeof mapping.inputCode === 'number') {
          const mouseState = this.mouseSource.isButtonPressed(mapping.inputCode);
          return mouseState;
        }
        return false;
      }
      case "gamepad": {
        const gamepadIndex = this.gamepadSource.getConnectedGamepads()[0];
        if (typeof mapping.inputCode === 'string' && mapping.inputCode.startsWith('button')) {
          const buttonIndex = parseInt(mapping.inputCode.slice(6), 10);
          const gamepadState = this.gamepadSource.isButtonPressed(
            gamepadIndex,
            buttonIndex
          );
          return gamepadState;
        } else if (typeof mapping.inputCode === 'string' && mapping.inputCode.startsWith('axis')) {
          const axisIndex = parseInt(mapping.inputCode.slice(4), 10);
          const axisValue = this.gamepadSource.getAxisValue(gamepadIndex, axisIndex);
          return Math.abs(axisValue) > 0.5; // Consider axis active if its absolute value is greater than 0.5
        }
        return false;
      }
      case "touch": {
        const touchState = this.touchSource.isTouching();
        console.log("Touch state:", touchState);
        return touchState;
      }
      default:
        console.log("Unknown input type:", mapping.inputType);
        return false;
    }
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
  // This method has been removed as it's a duplicate

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

  /**
   * Updates the state of all input sources.
   * This method should be called once per frame in the game loop, before mapInput().
   * It ensures that the latest input states are available for mapping.
   *
   * @example
   * ```typescript
   * function gameLoop() {
   *   // Update input state
   *   inputMapper.update();
   *
   *   // Map inputs to actions
   *   const triggeredActions = inputMapper.mapInput();
   *
   *   // ... rest of the game loop
   * }
   * ```
   */
  update(): void {
    this.keyboardSource.update();
    this.mouseSource.update();
    this.touchSource.update();
    this.gamepadSource.update();
  }

  /**
   * Logs the current input mappings for debugging purposes.
   */
  logMappings(): void {
    const mappings = this.mappingManager.getMappingsForContext(
      this.currentContext
    );
    mappings.forEach((mapping) => {
      console.log(
        `Action: ${mapping.actionId}, Input: ${mapping.inputType} - ${mapping.inputCode}`
      );
    });
  }
}
