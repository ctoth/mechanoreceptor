import { InputMapping } from './InputMapping';

export class InputBuffer {
  private buffer: { action: string; timestamp: number }[] = [];
  private bufferSize: number;
  private bufferDuration: number;

  constructor(bufferSize: number = 10, bufferDuration: number = 100) {
    this.bufferSize = bufferSize;
    this.bufferDuration = bufferDuration;
  }

  addInput(action: string): void {
    const now = Date.now();
    this.buffer.push({ action, timestamp: now });

    // Remove old inputs
    this.buffer = this.buffer.filter(input => now - input.timestamp <= this.bufferDuration);

    // Trim buffer to size
    if (this.buffer.length > this.bufferSize) {
      this.buffer = this.buffer.slice(-this.bufferSize);
    }
  }

  getRecentInputs(duration: number = this.bufferDuration): string[] {
    const now = Date.now();
    return this.buffer
      .filter(input => now - input.timestamp <= duration)
      .map(input => input.action);
  }

  clear(): void {
    this.buffer = [];
  }

  setBufferSize(size: number): void {
    this.bufferSize = size;
    if (this.buffer.length > this.bufferSize) {
      this.buffer = this.buffer.slice(-this.bufferSize);
    }
  }

  setBufferDuration(duration: number): void {
    this.bufferDuration = duration;
  }
}
export class InputBuffer {
  private buffer: string[] = [];
  private bufferSize: number;
  private bufferDuration: number;

  constructor(bufferSize: number = 10, bufferDuration: number = 100) {
    this.bufferSize = bufferSize;
    this.bufferDuration = bufferDuration;
  }

  addInput(input: string): void {
    this.buffer.push(input);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  getRecentInputs(duration?: number): string[] {
    return this.buffer.slice();
  }

  clear(): void {
    this.buffer = [];
  }

  setBufferSize(size: number): void {
    this.bufferSize = size;
    while (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  setBufferDuration(duration: number): void {
    this.bufferDuration = duration;
  }
}
