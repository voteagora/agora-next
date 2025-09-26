import { useCallback, useEffect, useRef } from "react";
import { useModal } from "connectkit";
import { useAccount } from "wagmi";

/**
 * Ensures the user is logged in before continuing. If not logged in, triggers the
 * wallet connect modal and resolves once the user connects (true) or dismisses it (false).
 */
const useRequireLogin = () => {
  const { isConnected } = useAccount();
  const { setOpen, open } = useModal();
  const resolversRef = useRef<Array<(value: boolean) => void>>([]);

  const resolveAll = useCallback((value: boolean) => {
    if (!resolversRef.current.length) return;
    const resolvers = [...resolversRef.current];
    resolversRef.current = [];
    resolvers.forEach((resolve) => resolve(value));
  }, []);

  useEffect(() => {
    if (isConnected) {
      resolveAll(true);
    }
  }, [isConnected, resolveAll]);

  useEffect(() => {
    if (open === false && !isConnected) {
      resolveAll(false);
    }
  }, [open, isConnected, resolveAll]);

  useEffect(() => {
    return () => {
      resolveAll(false);
    };
  }, [resolveAll]);

  return useCallback((): Promise<boolean> => {
    if (isConnected) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      resolversRef.current.push(resolve);
      setOpen(true);
    });
  }, [isConnected, setOpen]);
};

export default useRequireLogin;
