export interface InputMapping {
  contextId: string;
  actionId: string;
  inputType: 'keyboard' | 'mouse' | 'gamepad' | 'touch';
  inputCode: string | number;
  modifiers?: string[];
}

export class MappingConfigManager {
  private mappings: InputMapping[] = [];

  loadMappings(mappingsJson: string): void {
    try {
      const parsedMappings = JSON.parse(mappingsJson) as InputMapping[];
      if (Array.isArray(parsedMappings) && this.validateMappings(parsedMappings)) {
        this.mappings = parsedMappings;
      } else {
        throw new Error('Invalid mapping format');
      }
    } catch (error) {
      console.error('Error loading mappings:', error);
      throw error;
    }
  }

  private validateMappings(mappings: any[]): mappings is InputMapping[] {
    return mappings.every(mapping =>
      typeof mapping.contextId === 'string' &&
      typeof mapping.actionId === 'string' &&
      ['keyboard', 'mouse', 'gamepad', 'touch'].includes(mapping.inputType) &&
      (typeof mapping.inputCode === 'string' || typeof mapping.inputCode === 'number') &&
      (mapping.modifiers === undefined || Array.isArray(mapping.modifiers))
    );
  }

  getMappingsForContext(contextId: string): InputMapping[] {
    return this.mappings.filter(mapping => mapping.contextId === contextId);
  }

  addMapping(mapping: InputMapping): void {
    if (this.validateMappings([mapping])) {
      this.mappings.push(mapping);
    } else {
      throw new Error('Invalid mapping format');
    }
  }

  removeMapping(actionId: string, contextId: string): void {
    this.mappings = this.mappings.filter(
      mapping => !(mapping.actionId === actionId && mapping.contextId === contextId)
    );
  }

  serializeMappings(): string {
    return JSON.stringify(this.mappings);
  }
}
