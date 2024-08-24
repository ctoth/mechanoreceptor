import { InputMapper } from '../InputMapper';
import { MappingConfigManager } from '../InputMapping';
import { KeyboardSource } from '../KeyboardSource';
import { MouseSource } from '../MouseSource';
import { GamepadSource } from '../GamepadSource';
import { TouchSource } from '../TouchSource';

jest.mock('../KeyboardSource');
jest.mock('../MouseSource');
jest.mock('../GamepadSource');
jest.mock('../TouchSource');

describe('InputMapper', () => {
  let inputMapper: InputMapper;
  let mappingManager: MappingConfigManager;
  let keyboardSource: jest.Mocked<KeyboardSource>;
  let mouseSource: jest.Mocked<MouseSource>;
  let gamepadSource: jest.Mocked<GamepadSource>;
  let touchSource: jest.Mocked<TouchSource>;

  beforeEach(() => {
    mappingManager = new MappingConfigManager();
    keyboardSource = new KeyboardSource() as jest.Mocked<KeyboardSource>;
    mouseSource = new MouseSource() as jest.Mocked<MouseSource>;
    gamepadSource = new GamepadSource() as jest.Mocked<GamepadSource>;
    touchSource = new TouchSource() as jest.Mocked<TouchSource>;

    inputMapper = new InputMapper(
      mappingManager,
      keyboardSource,
      mouseSource,
      gamepadSource,
      touchSource
    );
  });

  test('setContext changes the current context', () => {
    inputMapper.setContext('menu');
    expect((inputMapper as any).currentContext).toBe('menu');
  });

  test('mapInput returns correct actions for keyboard input', () => {
    const mappings = [
      { contextId: 'default', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
      { contextId: 'default', actionId: 'move_left', inputType: 'keyboard', inputCode: 'ArrowLeft' },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    keyboardSource.isKeyPressed.mockImplementation((key: string) => key === 'Space');

    const actions = inputMapper.mapInput();
    expect(actions).toContain('jump');
    expect(actions).not.toContain('move_left');
  });

  test('mapInput returns correct actions for mouse input', () => {
    const mappings = [
      { contextId: 'default', actionId: 'shoot', inputType: 'mouse', inputCode: 0 },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    mouseSource.isButtonPressed.mockImplementation((button: number) => button === 0);

    const actions = inputMapper.mapInput();
    expect(actions).toContain('shoot');
  });

  test('mapInput returns correct actions for gamepad input', () => {
    const mappings = [
      { contextId: 'default', actionId: 'accelerate', inputType: 'gamepad', inputCode: 7 },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    gamepadSource.getConnectedGamepads.mockReturnValue([0]);
    gamepadSource.isButtonPressed.mockImplementation((index: number, button: number) => index === 0 && button === 7);

    const actions = inputMapper.mapInput();
    expect(actions).toContain('accelerate');
  });

  test('mapInput returns correct actions for touch input', () => {
    const mappings = [
      { contextId: 'default', actionId: 'tap', inputType: 'touch', inputCode: 'any' },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    touchSource.isTouching.mockReturnValue(true);

    const actions = inputMapper.mapInput();
    expect(actions).toContain('tap');
  });
});
