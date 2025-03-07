// Implementation of https://react.dev/reference/react/experimental_useEffectEvent
import { useCallback, useLayoutEffect, useRef } from "react";

const useEffectEvent = (handler: Function) => {
  const handlerRef = useRef<null | Function>(null);

  useLayoutEffect(() => {
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
