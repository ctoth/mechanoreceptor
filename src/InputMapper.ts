import { InputMapping, MappingConfigManager } from './InputMapping';
import { KeyboardSource } from './KeyboardSource';
import { MouseSource } from './MouseSource';
import { GamepadSource } from './GamepadSource';
import { TouchSource } from './TouchSource';
import { ComboSystem, ComboDefinition } from './ComboSystem';
import { InputBuffer } from './InputBuffer';

export class InputMapper {
  private mappingManager: MappingConfigManager;
  private keyboardSource: KeyboardSource;
  private mouseSource: MouseSource;
  private gamepadSource: GamepadSource;
  private touchSource: TouchSource;
  private comboSystem: ComboSystem;
  private inputBuffer: InputBuffer;
  private currentContext: string = 'default';

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

  setContext(contextId: string): void {
    this.currentContext = contextId;
  }

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

  getRecentInputs(duration?: number): string[] {
    return this.inputBuffer.getRecentInputs();
  }

  clearInputBuffer(): void {
    this.inputBuffer.clear();
  }

  setInputBufferSize(size: number): void {
    this.inputBuffer.setBufferSize(size);
  }

  setInputBufferDuration(duration: number): void {
    this.inputBuffer.setBufferDuration(duration);
  }

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

  addCombo(combo: ComboDefinition): void {
    this.comboSystem.addCombo(combo);
  }

  removeCombo(comboId: string): void {
    this.comboSystem.removeCombo(comboId);
  }
}
