import { useCallback, useEffect, useRef } from "react";
import { useModal } from "connectkit";
import { useAccount } from "wagmi";

/**
 * Ensures the user is logged in before continuing. If not logged in, triggers the
 * wallet connect modal and resolves with the address once connected, or null if dismissed.
 */
const useRequireLogin = () => {
  const { isConnected, address, isConnecting } = useAccount();
  const { setOpen, open } = useModal();
  const resolversRef = useRef<Array<(value: string | null) => void>>([]);

  const resolveAll = useCallback((value: string | null) => {
    if (!resolversRef.current.length) return;
    const resolvers = [...resolversRef.current];
    resolversRef.current = [];
    resolvers.forEach((resolve) => resolve(value));
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      resolveAll(address);
    }
  }, [isConnected, address, resolveAll]);

  useEffect(() => {
    if (open === false && !isConnected && !isConnecting) {
      resolveAll(null);
    }
  }, [open, isConnected, resolveAll, isConnecting]);

  useEffect(() => {
    return () => {
      resolveAll(null);
    };
  }, [resolveAll]);

  return useCallback((): Promise<string | null> => {
    // If already connected with address, resolve immediately
    if (isConnected && address) {
      return Promise.resolve(address);
    }

    // Not connected or no address yet, open modal and wait
    return new Promise<string | null>((resolve) => {
      resolversRef.current.push(resolve);
      if (!open) {
        setOpen(true);
      }
    });
  }, [isConnected, address, setOpen, open]);
};

export default useRequireLogin;
