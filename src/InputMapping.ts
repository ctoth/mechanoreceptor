export interface InputMapping {
  contextId: string;
  actionId: string;
  inputType: 'keyboard' | 'mouse' | 'gamepad' | 'touch';
  inputCode: string | number;
  modifiers?: string[];
}

/**
 * Manages the configuration of input mappings.
 * This class is responsible for loading, storing, and retrieving input mappings
 * that define how raw inputs are translated into game actions.
 */
export class MappingConfigManager {
  private mappings: InputMapping[] = [];

  /**
   * Loads input mappings from a JSON string.
   * 
   * @param mappingsJson - A JSON string containing an array of InputMapping objects.
   * @throws Will throw an error if the JSON is invalid or doesn't contain proper mapping data.
   * 
   * @example
   * ```typescript
   * const mappingsJson = JSON.stringify([
   *   { contextId: 'gameplay', actionId: 'jump', inputType: 'keyboard', inputCode: 'Space' },
   *   { contextId: 'menu', actionId: 'select', inputType: 'mouse', inputCode: 0 }
   * ]);
   * mappingManager.loadMappings(mappingsJson);
   * ```
   */
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

  /**
   * Retrieves all input mappings for a specific context.
   * 
   * @param contextId - The ID of the context to retrieve mappings for.
   * @returns An array of InputMapping objects for the specified context.
   * 
   * @example
   * ```typescript
   * const gameplayMappings = mappingManager.getMappingsForContext('gameplay');
   * ```
   */
  getMappingsForContext(contextId: string): InputMapping[] {
    return this.mappings.filter(mapping => mapping.contextId === contextId);
  }

  /**
   * Adds a new input mapping to the configuration.
   * 
   * @param mapping - The InputMapping object to add.
   * @throws Will throw an error if the mapping is invalid.
   * 
   * @example
   * ```typescript
   * const newMapping: InputMapping = {
   *   contextId: 'gameplay',
   *   actionId: 'crouch',
   *   inputType: 'keyboard',
   *   inputCode: 'ControlLeft'
   * };
   * mappingManager.addMapping(newMapping);
   * ```
   */
  addMapping(mapping: InputMapping): void {
    if (this.validateMappings([mapping])) {
      this.mappings.push(mapping);
    } else {
      throw new Error('Invalid mapping format');
    }
  }

  /**
   * Removes an input mapping from the configuration.
   * 
   * @param actionId - The ID of the action to remove.
   * @param contextId - The ID of the context the action belongs to.
   * 
   * @example
   * ```typescript
   * mappingManager.removeMapping('jump', 'gameplay');
   * ```
   */
  removeMapping(actionId: string, contextId: string): void {
    this.mappings = this.mappings.filter(
      mapping => !(mapping.actionId === actionId && mapping.contextId === contextId)
    );
  }

  /**
   * Serializes all current mappings to a JSON string.
   * 
   * @returns A JSON string representation of all current input mappings.
   * 
   * @example
   * ```typescript
   * const serializedMappings = mappingManager.serializeMappings();
   * localStorage.setItem('inputMappings', serializedMappings);
   * ```
   */
  serializeMappings(): string {
    return JSON.stringify(this.mappings);
  }

  /**
   * Retrieves all current input mappings.
   * 
   * @returns An array of all InputMapping objects.
   */
  getMappings(): InputMapping[] {
    return this.mappings;
  }
}
