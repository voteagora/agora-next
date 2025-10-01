import { useRef, useLayoutEffect, useCallback } from "react";

/**
 * Creates a stable callback reference that always calls the latest version of the function.
 * This prevents stale closures without needing manual refs.
 *
 * @example
 * const stableHandler = useStableCallback((value) => {
 *   // This will always use the latest state/props
 *   console.log(currentState, value);
 * });
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  // Update ref before render to ensure it's always current
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // Return a stable function that calls the latest callback
  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}
