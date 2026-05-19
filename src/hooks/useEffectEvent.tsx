// Implementation of https://react.dev/reference/react/experimental_useEffectEvent
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const useEffectEvent = (handler: Function) => {
  const handlerRef = useRef<null | Function>(null);

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: any[]) => {
    const fn = handlerRef.current;
    if (fn) {
      return fn(...args);
    }
  }, []);
};

export default useEffectEvent;
