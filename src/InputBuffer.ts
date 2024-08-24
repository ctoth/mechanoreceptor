interface TimestampedInput {
  input: string;
  timestamp: number;
}

export class InputBuffer {
  private buffer: TimestampedInput[] = [];
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

  getRecentInputs(duration?: number): string[] {
    if (duration === undefined) {
      return this.buffer.map(item => item.input);
    }
    const currentTime = Date.now();
    return this.buffer
      .filter(item => currentTime - item.timestamp <= duration)
      .map(item => item.input);
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
