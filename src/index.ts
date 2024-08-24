import { InputSource } from './InputSource';
import { KeyboardSource } from './KeyboardSource';
import { MouseSource } from './MouseSource';
import { TouchSource } from './TouchSource';
import { GamepadSource } from './GamepadSource';
import { InputMapping, MappingConfigManager } from './InputMapping';
import { InputMapper } from './InputMapper';

const Mechanoreceptor = {
  InputSource,
  KeyboardSource,
  MouseSource,
  TouchSource,
  GamepadSource,
  InputMapping,
  MappingConfigManager,
  InputMapper
};

if (typeof window !== 'undefined') {
  (window as any).Mechanoreceptor = Mechanoreceptor;
}

export default Mechanoreceptor;
