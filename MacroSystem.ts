interface MacroInput {
  actionId: string;
  timestamp: number;
}

export class MacroSystem {
  private macros: Map<string, MacroInput[]> = new Map();
  private isRecording: boolean = false;
  private currentMacro: MacroInput[] = [];
  private recordingStartTime: number = 0;

  startRecording(macroName: string): void {
    this.isRecording = true;
    this.currentMacro = [];
    this.recordingStartTime = Date.now();
  }

  stopRecording(): void {
    this.isRecording = false;
  }

  recordInput(actionId: string): void {
    if (this.isRecording) {
      this.currentMacro.push({
        actionId,
        timestamp: Date.now() - this.recordingStartTime
      });
    }
  }

  saveMacro(macroName: string): void {
    if (this.currentMacro.length > 0) {
      this.macros.set(macroName, this.currentMacro);
      this.currentMacro = [];
    }
  }

  playMacro(macroName: string): MacroInput[] | undefined {
    return this.macros.get(macroName);
  }

  deleteMacro(macroName: string): boolean {
    return this.macros.delete(macroName);
  }

  getMacroNames(): string[] {
    return Array.from(this.macros.keys());
  }
}
