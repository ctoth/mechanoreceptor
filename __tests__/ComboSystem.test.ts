import { ComboSystem } from '../src/ComboSystem';

describe('ComboSystem', () => {
  let comboSystem: ComboSystem;

  beforeEach(() => {
    comboSystem = new ComboSystem();
  });

  test('should detect a simple combo', () => {
    const combo = {
      id: 'fireball',
      sequence: [
        { inputType: 'keyboard', inputCode: 'ArrowDown' },
        { inputType: 'keyboard', inputCode: 'ArrowRight' },
        { inputType: 'keyboard', inputCode: 'KeyA' }
      ],
      maxTimeWindow: 1000
    };

    comboSystem.addCombo(combo);

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowDown' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowRight' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' })).toEqual(['fireball']);
  });

  test('should not detect combo if inputs are out of order', () => {
    const combo = {
      id: 'fireball',
      sequence: [
        { inputType: 'keyboard', inputCode: 'ArrowDown' },
        { inputType: 'keyboard', inputCode: 'ArrowRight' },
        { inputType: 'keyboard', inputCode: 'KeyA' }
      ],
      maxTimeWindow: 1000
    };

    comboSystem.addCombo(combo);

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowDown' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowRight' })).toEqual([]);
  });

  test('should not detect combo if time window is exceeded', (done) => {
    const combo = {
      id: 'fireball',
      sequence: [
        { inputType: 'keyboard', inputCode: 'ArrowDown' },
        { inputType: 'keyboard', inputCode: 'ArrowRight' },
        { inputType: 'keyboard', inputCode: 'KeyA' }
      ],
      maxTimeWindow: 500
    };

    comboSystem.addCombo(combo);

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowDown' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowRight' })).toEqual([]);
    
    setTimeout(() => {
      expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' })).toEqual([]);
      done();
    }, 600);
  });

  test('should detect multiple combos', () => {
    const combo1 = {
      id: 'fireball',
      sequence: [
        { inputType: 'keyboard', inputCode: 'ArrowDown' },
        { inputType: 'keyboard', inputCode: 'ArrowRight' },
        { inputType: 'keyboard', inputCode: 'KeyA' }
      ],
      maxTimeWindow: 1000
    };

    const combo2 = {
      id: 'uppercut',
      sequence: [
        { inputType: 'keyboard', inputCode: 'ArrowRight' },
        { inputType: 'keyboard', inputCode: 'ArrowDown' },
        { inputType: 'keyboard', inputCode: 'KeyB' }
      ],
      maxTimeWindow: 1000
    };

    comboSystem.addCombo(combo1);
    comboSystem.addCombo(combo2);

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowDown' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowRight' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' })).toEqual(['fireball']);

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowRight' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'ArrowDown' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyB' })).toEqual(['uppercut']);
  });
});
