/**
 * Creates a throttled function that only invokes the provided function at most once per
 * every `limit` milliseconds.
 *
 * @template T - The type of the function to be throttled.
 * @param {T} func - The function to throttle.
 * @param {number} limit - The number of milliseconds to throttle invocations to.
 * @returns {(...args: Parameters<T>) => void} A new, throttled, function.
 *
 * @example
 * const throttledMouseMove = throttle((event: MouseEvent) => {
 *   console.log(event.clientX, event.clientY);
 * }, 100);
 * 
 * window.addEventListener('mousemove', throttledMouseMove);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Creates a debounced function that delays invoking the provided function until after
 * `delay` milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @template T - The type of the function to be debounced.
 * @param {T} func - The function to debounce.
 * @param {number} delay - The number of milliseconds to delay.
 * @returns {(...args: Parameters<T>) => void} A new, debounced, function.
 *
 * @example
 * const debouncedResize = debounce(() => {
 *   console.log('Resize event handled');
 * }, 250);
 * 
 * window.addEventListener('resize', debouncedResize);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
