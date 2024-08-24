export class InputBuffer {
  private buffer: string[] = [];
  private bufferSize: number;
  private bufferDuration: number;

  constructor(bufferSize: number = 10, bufferDuration: number = 100) {
    this.bufferSize = bufferSize;
    this.bufferDuration = bufferDuration;
  }

  addInput(input: string): void {
    this.buffer.push({ input, timestamp: Date.now() });
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  getRecentInputs(): string[] {
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
    if (duration === undefined) {
      return [...this.buffer];
    }
    const currentTime = Date.now();
    return this.buffer.filter(input => currentTime - input.timestamp <= duration);
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
