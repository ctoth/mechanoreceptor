# Mechanoreceptor: Ultimate Browser-Based Game Input Library

Mechanoreceptor is a powerful and flexible TypeScript library designed to handle various input methods for browser-based games. It provides a unified interface for keyboard, mouse, touch, and gamepad inputs, making it easier for game developers to create responsive and intuitive controls for their games.

## Features

- Support for multiple input sources: keyboard, mouse, touch, and gamepad
- Flexible input mapping system
- Combo detection for complex input sequences
- Input buffering for timing-sensitive inputs
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
import Mechanoreceptor from 'mechanoreceptor';

// Create instances of input sources
const keyboardSource = new Mechanoreceptor.KeyboardSource();
const mouseSource = new Mechanoreceptor.MouseSource();
const touchSource = new Mechanoreceptor.TouchSource();
const gamepadSource = new Mechanoreceptor.GamepadSource();

// Create a mapping configuration manager
const mappingManager = new Mechanoreceptor.MappingConfigManager();

// Load your input mappings
const mappings = [
  { contextId: 'gameplay', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
  { contextId: 'gameplay', actionId: 'shoot', inputType: 'mouse', inputCode: 0 },
];
mappingManager.loadMappings(JSON.stringify(mappings));

// Create an input mapper
const inputMapper = new Mechanoreceptor.InputMapper(
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

// In your game loop
function gameLoop() {
  // Update input states
  keyboardSource.update();
  mouseSource.update();
  touchSource.update();
  gamepadSource.update();

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

## Documentation

For detailed documentation on how to use Mechanoreceptor, including advanced features like combo detection and input buffering, please refer to our [official documentation](https://github.com/yourusername/mechanoreceptor/wiki).

## Contributing

We welcome contributions to Mechanoreceptor! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## License

Mechanoreceptor is released under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub issue tracker](https://github.com/yourusername/mechanoreceptor/issues).

Happy gaming!
