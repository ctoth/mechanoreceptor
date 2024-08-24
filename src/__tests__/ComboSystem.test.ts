import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ComboSystem, ComboDefinition } from '../ComboSystem';

describe('ComboSystem', () => {
  let comboSystem: ComboSystem;

  beforeEach(() => {
    comboSystem = new ComboSystem();
  });

  test('addCombo adds a combo to the system', () => {
    const combo: ComboDefinition = {
      id: 'testCombo',
      sequence: [
        { inputType: 'keyboard', inputCode: 'KeyA' },
        { inputType: 'keyboard', inputCode: 'KeyB' },
      ],
      maxTimeWindow: 1000,
    };

    comboSystem.addCombo(combo);

    // We can't directly access private properties, so we'll test indirectly
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyB' })).toEqual(['testCombo']);
  });

  test('removeCombo removes a combo from the system', () => {
    const combo: ComboDefinition = {
      id: 'testCombo',
      sequence: [
        { inputType: 'keyboard', inputCode: 'KeyA' },
        { inputType: 'keyboard', inputCode: 'KeyB' },
      ],
      maxTimeWindow: 1000,
    };

    comboSystem.addCombo(combo);
    comboSystem.removeCombo('testCombo');

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyB' })).toEqual([]);
  });

  test('checkCombos detects a simple combo', () => {
    const combo: ComboDefinition = {
      id: 'simpleCombo',
      sequence: [
        { inputType: 'keyboard', inputCode: 'KeyX' },
        { inputType: 'keyboard', inputCode: 'KeyY' },
      ],
      maxTimeWindow: 1000,
    };

    comboSystem.addCombo(combo);

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyX' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyY' })).toEqual(['simpleCombo']);
  });

  test('checkCombos respects the maxTimeWindow', () => {
    vi.useFakeTimers();

    const combo: ComboDefinition = {
      id: 'timedCombo',
      sequence: [
        { inputType: 'keyboard', inputCode: 'KeyA' },
        { inputType: 'keyboard', inputCode: 'KeyB' },
      ],
      maxTimeWindow: 500,
    };

    comboSystem.addCombo(combo);

    comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' });
    
    vi.advanceTimersByTime(600); // Advance time beyond the maxTimeWindow

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyB' })).toEqual([]);

    vi.useRealTimers();
  });

  test('checkCombos handles multiple combos', () => {
    const combo1: ComboDefinition = {
      id: 'combo1',
      sequence: [
        { inputType: 'keyboard', inputCode: 'KeyA' },
        { inputType: 'keyboard', inputCode: 'KeyB' },
      ],
      maxTimeWindow: 1000,
    };

    const combo2: ComboDefinition = {
      id: 'combo2',
      sequence: [
        { inputType: 'keyboard', inputCode: 'KeyA' },
        { inputType: 'keyboard', inputCode: 'KeyC' },
      ],
      maxTimeWindow: 1000,
    };

    comboSystem.addCombo(combo1);
    comboSystem.addCombo(combo2);

    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' })).toEqual([]);
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyB' })).toEqual(['combo1']);
    
    comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyA' });
    expect(comboSystem.checkCombos({ inputType: 'keyboard', inputCode: 'KeyC' })).toEqual(['combo2']);
  });
});
