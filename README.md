# Mechanoreceptor: Advanced Browser-Based Game Input Library

Mechanoreceptor is a powerful and flexible TypeScript library designed to handle various input methods for browser-based games. It provides a unified interface for keyboard, mouse, touch, and gamepad inputs, making it easier for game developers to create responsive and intuitive controls for their games.

## Features

- Support for multiple input sources: keyboard, mouse, touch, and gamepad
- Flexible input mapping system with context-based configurations
- Combo detection for complex input sequences
- Input buffering for timing-sensitive inputs
- Throttling and debouncing for optimized performance
- Gamepad vibration support for compatible devices
- Easy integration with existing game engines and frameworks
- Written in TypeScript for type safety and better developer experience

## Installation

You can install Mechanoreceptor using npm:

```bash
npm install mechanoreceptor
```

Or using yarn:

```bash
yarn add mechanoreceptor
```

## Basic Usage

Here's a quick example of how to use Mechanoreceptor in your project:

```typescript
import {
  KeyboardSource,
  MouseSource,
  TouchSource,
  GamepadSource,
  MappingConfigManager,
  InputMapper
} from 'mechanoreceptor';

// Create instances of input sources
const keyboardSource = new KeyboardSource();
const mouseSource = new MouseSource();
const touchSource = new TouchSource();
const gamepadSource = new GamepadSource();

// Create a mapping configuration manager
const mappingManager = new MappingConfigManager();

// Load your input mappings
const mappings = [
  { contextId: 'gameplay', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
  { contextId: 'gameplay', actionId: 'shoot', inputType: 'mouse', inputCode: 0 },
];
mappingManager.loadMappings(JSON.stringify(mappings));

// Create an input mapper
const inputMapper = new InputMapper(
  mappingManager,
  keyboardSource,
  mouseSource,
  touchSource,
  gamepadSource
);

// Initialize input sources
keyboardSource.initialize();
mouseSource.initialize();
touchSource.initialize();
gamepadSource.initialize();

// Set the current context
inputMapper.setContext('gameplay');

// In your game loop
function gameLoop() {
  // Update input state
  inputMapper.update();

  // Get triggered actions
  const actions = inputMapper.mapInput();

  // Handle actions in your game
  actions.forEach(action => {
    switch (action) {
      case 'jump':
        // Handle jump action
        break;
      case 'shoot':
        // Handle shoot action
        break;
    }
  });

  // Continue with your game logic
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
```

## Advanced Features

### Combo System

Mechanoreceptor supports complex input combinations:

```typescript
const hadoukenCombo = {
  id: 'hadouken',
  sequence: [
    { inputType: 'keyboard', inputCode: 'ArrowDown' },
    { inputType: 'keyboard', inputCode: 'ArrowRight' },
    { inputType: 'keyboard', inputCode: 'KeyP' }
  ],
  maxTimeWindow: 500
};

inputMapper.addCombo(hadoukenCombo);
```

### Input Buffering

You can access recent inputs for more complex game mechanics:

```typescript
const recentInputs = inputMapper.getRecentInputs(500); // Get inputs from last 500ms
```

### Gamepad Vibration

For gamepads that support haptic feedback:

```typescript
gamepadSource.vibrate(0, 200, 0.5, 0.8); // Vibrate gamepad 0 for 200ms
```

## Performance Optimization

Mechanoreceptor includes built-in performance optimizations:

- Mouse move events are throttled and debounced for smooth performance.
- Gamepad state is polled at a fixed interval to balance responsiveness and efficiency.

## Documentation

For detailed documentation on how to use Mechanoreceptor, including all available methods and advanced features, please refer to our [official documentation](https://github.com/yourusername/mechanoreceptor/wiki).

To generate the documentation, run:

```bash
npm run docs
```

This will create a `docs` folder with the generated documentation. Open `docs/index.html` in your browser to view it.

## Contributing

We welcome contributions to Mechanoreceptor! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## License

Mechanoreceptor is released under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub issue tracker](https://github.com/yourusername/mechanoreceptor/issues).

Happy gaming!
