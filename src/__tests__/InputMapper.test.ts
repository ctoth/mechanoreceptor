import { beforeEach, describe, expect, test, vi } from "vitest";
import { ComboSystem } from "../ComboSystem";
import { GamepadSource } from "../GamepadSource";
import { InputMapper } from "../InputMapper";
import { MappingConfigManager } from "../InputMapping";
import { KeyboardSource } from "../KeyboardSource";
import { MouseSource } from "../MouseSource";
import { TouchSource } from "../TouchSource";

vi.mock("../KeyboardSource");
vi.mock("../MouseSource");
vi.mock("../GamepadSource");
vi.mock("../TouchSource");
vi.mock("../ComboSystem");

describe("InputMapper", () => {
  let inputMapper: InputMapper;
  let mappingManager: MappingConfigManager;
  let keyboardSource: vi.Mocked<KeyboardSource>;
  let mouseSource: vi.Mocked<MouseSource>;
  let gamepadSource: vi.Mocked<GamepadSource>;
  let touchSource: vi.Mocked<TouchSource>;
  let comboSystem: vi.Mocked<ComboSystem>;

  beforeEach(() => {
    mappingManager = new MappingConfigManager();
    keyboardSource = new KeyboardSource() as vi.Mocked<KeyboardSource>;
    mouseSource = new MouseSource() as vi.Mocked<MouseSource>;
    gamepadSource = new GamepadSource() as vi.Mocked<GamepadSource>;
    touchSource = new TouchSource() as vi.Mocked<TouchSource>;
    comboSystem = new ComboSystem() as vi.Mocked<ComboSystem>;

    inputMapper = new InputMapper(
      mappingManager,
      keyboardSource,
      mouseSource,
      gamepadSource,
      touchSource
    );

    // Mock the ComboSystem constructor
    (ComboSystem as unknown as vi.Mock).mockImplementation(() => comboSystem);
  });

  test("setContext changes the current context", () => {
    inputMapper.setContext("menu");
    expect((inputMapper as any).currentContext).toBe("menu");
  });

  test("mapInput returns correct actions for keyboard input", () => {
    const mappings = [
      {
        contextId: "default",
        actionId: "jump",
        inputType: "keyboard",
        inputCode: "Space",
      },
      {
        contextId: "default",
        actionId: "move_left",
        inputType: "keyboard",
        inputCode: "ArrowLeft",
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    keyboardSource.isKeyPressed.mockImplementation(
      (key: string) => key === "Space"
    );
    comboSystem.checkCombos.mockReturnValue([]);

    const actions = inputMapper.mapInput();
    expect(actions).toContain("jump");
    expect(actions).not.toContain("move_left");
  });

  test("mapInput returns correct actions for mouse input", () => {
    const mappings = [
      {
        contextId: "default",
        actionId: "shoot",
        inputType: "mouse",
        inputCode: 0,
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    mouseSource.isButtonPressed.mockImplementation(
      (button: number) => button === 0
    );
    comboSystem.checkCombos.mockReturnValue([]);

    const actions = inputMapper.mapInput();
    expect(actions).toContain("shoot");
  });

  test("mapInput returns correct actions for gamepad input", () => {
    const mappings = [
      {
        contextId: "default",
        actionId: "accelerate",
        inputType: "gamepad",
        inputCode: 7,
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    gamepadSource.getConnectedGamepads.mockReturnValue([0]);
    gamepadSource.isButtonPressedRaw.mockImplementation(
      (index: number, button: number) => index === 0 && button === 7
    );
    comboSystem.checkCombos.mockReturnValue([]);

    const actions = inputMapper.mapInput();
    expect(actions).toContain("accelerate");
  });

  test("mapInput returns correct actions for touch input", () => {
    const mappings = [
      {
        contextId: "default",
        actionId: "tap",
        inputType: "touch",
        inputCode: "any",
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    touchSource.isTouching.mockReturnValue(true);
    comboSystem.checkCombos.mockReturnValue([]);

    const actions = inputMapper.mapInput();
    expect(actions).toContain("tap");
  });

  test("mapInput handles combos correctly", () => {
    const mappings = [
      {
        contextId: "default",
        actionId: "punch",
        inputType: "keyboard",
        inputCode: "KeyP",
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    keyboardSource.isKeyPressed.mockImplementation(
      (key: string) => key === "KeyP"
    );
    comboSystem.checkCombos.mockReturnValue(["super_punch"]);

    const actions = inputMapper.mapInput();
    expect(actions).toContain("punch");
    expect(actions).toContain("super_punch");
  });

  test("getRecentInputs returns correct inputs", () => {
    const inputMapper = new InputMapper(
      mappingManager,
      keyboardSource,
      mouseSource,
      gamepadSource,
      touchSource,
      5,
      1000
    );

    // Simulate some inputs
    const mappings = [
      {
        contextId: "default",
        actionId: "jump",
        inputType: "keyboard",
        inputCode: "Space",
      },
      {
        contextId: "default",
        actionId: "shoot",
        inputType: "mouse",
        inputCode: 0,
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    keyboardSource.isKeyPressed.mockImplementation(
      (key: string) => key === "Space"
    );
    mouseSource.isButtonPressed.mockImplementation(
      (button: number) => button === 0
    );
    comboSystem.checkCombos.mockReturnValue([]);

    inputMapper.mapInput(); // This should add 'jump' and 'shoot' to the buffer

    const recentInputs = inputMapper.getRecentInputs();
    expect(recentInputs).toContain("jump");
    expect(recentInputs).toContain("shoot");
  });

  test("clearInputBuffer clears the input buffer", () => {
    const inputMapper = new InputMapper(
      mappingManager,
      keyboardSource,
      mouseSource,
      gamepadSource,
      touchSource,
      5,
      1000
    );

    // Simulate some inputs
    const mappings = [
      {
        contextId: "default",
        actionId: "jump",
        inputType: "keyboard",
        inputCode: "Space",
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    keyboardSource.isKeyPressed.mockImplementation(
      (key: string) => key === "Space"
    );
    comboSystem.checkCombos.mockReturnValue([]);

    inputMapper.mapInput(); // This should add 'jump' to the buffer

    inputMapper.clearInputBuffer();

    const recentInputs = inputMapper.getRecentInputs();
    expect(recentInputs).toHaveLength(0);
  });

  test("setInputBufferSize changes the buffer size", () => {
    const inputMapper = new InputMapper(
      mappingManager,
      keyboardSource,
      mouseSource,
      gamepadSource,
      touchSource,
      5,
      1000
    );

    inputMapper.setInputBufferSize(3);

    // Simulate some inputs
    const mappings = [
      {
        contextId: "default",
        actionId: "jump",
        inputType: "keyboard",
        inputCode: "Space",
      },
      {
        contextId: "default",
        actionId: "shoot",
        inputType: "mouse",
        inputCode: 0,
      },
      {
        contextId: "default",
        actionId: "move",
        inputType: "keyboard",
        inputCode: "ArrowRight",
      },
      {
        contextId: "default",
        actionId: "crouch",
        inputType: "keyboard",
        inputCode: "ControlLeft",
      },
    ];
    mappingManager.loadMappings(JSON.stringify(mappings));

    keyboardSource.isKeyPressed.mockImplementation((key: string) =>
      ["Space", "ArrowRight", "ControlLeft"].includes(key)
    );
    mouseSource.isButtonPressed.mockImplementation(
      (button: number) => button === 0
    );
    comboSystem.checkCombos.mockReturnValue([]);

    inputMapper.mapInput(); // This should add all 4 actions to the buffer, but only keep the last 3

    const recentInputs = inputMapper.getRecentInputs();
    expect(recentInputs).toHaveLength(3);
    expect(recentInputs).not.toContain("jump");
    expect(recentInputs).toContain("shoot");
    expect(recentInputs).toContain("move");
    expect(recentInputs).toContain("crouch");
  });
});
