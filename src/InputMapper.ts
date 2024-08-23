import { InputMapping, MappingConfigManager } from './InputMapping';
import { KeyboardSource } from './KeyboardSource';
import { MouseSource } from './MouseSource';
import { GamepadSource } from './GamepadSource';
import { TouchSource } from './TouchSource';

export class InputMapper {
  private mappingManager: MappingConfigManager;
  private keyboardSource: KeyboardSource;
  private mouseSource: MouseSource;
  private gamepadSource: GamepadSource;
  private touchSource: TouchSource;
  private currentContext: string = 'default';

  constructor(
    mappingManager: MappingConfigManager,
    keyboardSource: KeyboardSource,
    mouseSource: MouseSource,
    gamepadSource: GamepadSource,
    touchSource: TouchSource
  ) {
    this.mappingManager = mappingManager;
    this.keyboardSource = keyboardSource;
    this.mouseSource = mouseSource;
    this.gamepadSource = gamepadSource;
    this.touchSource = touchSource;
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
      }
    }

    return triggeredActions;
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
}
