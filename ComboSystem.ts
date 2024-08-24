interface ComboInput {
  inputType: 'keyboard' | 'mouse' | 'gamepad' | 'touch';
  inputCode: string | number;
  timeWindow?: number;
}

export interface ComboDefinition {
  id: string;
  sequence: ComboInput[];
  maxTimeWindow: number;
}

export class ComboSystem {
  private combos: ComboDefinition[] = [];
  private activeSequences: Map<string, { inputs: ComboInput[], startTime: number }> = new Map();

  addCombo(combo: ComboDefinition): void {
    this.combos.push(combo);
  }

  removeCombo(comboId: string): void {
    this.combos = this.combos.filter(combo => combo.id !== comboId);
  }

  checkCombos(input: ComboInput): string[] {
    const triggeredCombos: string[] = [];
    const currentTime = Date.now();

    for (const combo of this.combos) {
      const activeSequence = this.activeSequences.get(combo.id);

      if (!activeSequence) {
        if (this.matchesFirstInput(combo, input)) {
          this.activeSequences.set(combo.id, { inputs: [input], startTime: currentTime });
        }
      } else {
        const { inputs, startTime } = activeSequence;
        const expectedInput = combo.sequence[inputs.length];

        if (this.matchesInput(expectedInput, input)) {
          inputs.push(input);

          if (inputs.length === combo.sequence.length) {
            if (currentTime - startTime <= combo.maxTimeWindow) {
              triggeredCombos.push(combo.id);
            }
            this.activeSequences.delete(combo.id);
          }
        } else {
          this.activeSequences.delete(combo.id);
        }
      }
    }

    // Clean up expired sequences
    for (const [comboId, { startTime }] of this.activeSequences) {
      const combo = this.combos.find(c => c.id === comboId);
      if (combo && currentTime - startTime > combo.maxTimeWindow) {
        this.activeSequences.delete(comboId);
      }
    }

    return triggeredCombos;
  }

  private matchesFirstInput(combo: ComboDefinition, input: ComboInput): boolean {
    return this.matchesInput(combo.sequence[0], input);
  }

  private matchesInput(expected: ComboInput, actual: ComboInput): boolean {
    return expected.inputType === actual.inputType && expected.inputCode === actual.inputCode;
  }
}
