interface TimestampedInput {
  input: string;
  timestamp: number;
}

/**
 * Manages a buffer of recent input actions with timestamps.
 * This class is useful for implementing features like input buffering,
 * which can make games feel more responsive by allowing inputs to be
 * registered slightly before or after their exact frame.
 */
export class InputBuffer {
  private buffer: TimestampedInput[] = [];
  private bufferSize: number;
  private bufferDuration: number;

  /**
   * Creates a new InputBuffer instance.
   * 
   * @param bufferSize - The maximum number of inputs to store in the buffer. Default is 10.
   * @param bufferDuration - The maximum age (in milliseconds) of inputs to keep in the buffer. Default is 100ms.
   */
  constructor(bufferSize: number = 10, bufferDuration: number = 100) {
    this.bufferSize = bufferSize;
    this.bufferDuration = bufferDuration;
  }

  /**
   * Adds a new input to the buffer.
   * 
   * @param input - The input action to add to the buffer.
   */
  addInput(input: string): void {
    this.buffer.push({ input, timestamp: Date.now() });
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  /**
   * Retrieves recent inputs from the buffer.
   * 
   * @param duration - Optional. If provided, only returns inputs within this duration (in milliseconds) from the current time.
   * @returns An array of recent input actions.
   */
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
