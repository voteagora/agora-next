"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSIWE } from "connectkit";
import { useAccount } from "wagmi";

import {
  clearStoredSiweSession,
  getStoredSiweJwt,
  SIWE_SESSION_CHANGE_EVENT,
  waitForStoredSiweJwt,
} from "@/lib/siweSession";

interface UseSiweJwtOptions {
  expectedAddress?: string;
  autoAuthenticate?: boolean;
}

const siweSessionRequests = new Map<string, Promise<string | null>>();

export function useSiweJwt(options: UseSiweJwtOptions = {}) {
  const { address, isConnected } = useAccount();
  const { signIn, signOut } = useSIWE();
  const [jwt, setJwt] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const hasAutoSignAttemptedRef = useRef(false);

  const expectedAddress = (options.expectedAddress ??
    address?.toLowerCase() ??
    null) as `0x${string}` | null;

  const loadJwt = useCallback((): string | null => {
    if (!expectedAddress) return null;
    return getStoredSiweJwt({ expectedAddress });
  }, [expectedAddress]);

  const clearSession = useCallback(async () => {
    try {
      await signOut();
    } catch {
      clearStoredSiweSession();
    }
    setJwt(null);
  }, [signOut]);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (!expectedAddress) {
      throw new Error("Wallet not connected");
    }

    const existing = loadJwt();
    if (existing) {
      setJwt(existing);
      return existing;
    }

    const existingRequest = siweSessionRequests.get(expectedAddress);
    if (existingRequest) {
      setIsSigningIn(true);
      try {
        const token = await existingRequest;
        setJwt(token);
        return token;
      } finally {
        setIsSigningIn(false);
      }
    }

    setIsSigningIn(true);
    setError(null);

    const sessionRequest = (async (): Promise<string | null> => {
      try {
        await signIn();
      } catch (signInError) {
        const stored = getStoredSiweJwt({ expectedAddress });
        if (stored) return stored;

        setError(
          signInError instanceof Error
            ? signInError.message
            : "Sign-in cancelled."
        );
        return null;
      }

      const token =
        getStoredSiweJwt({ expectedAddress }) ??
        (await waitForStoredSiweJwt({ expectedAddress, timeoutMs: 1_000 }));
      if (!token) {
        setError("Sign-in failed. Please try again.");
        return null;
      }

      return token;
    })();

    siweSessionRequests.set(expectedAddress, sessionRequest);

    try {
      const token = await sessionRequest;
      setJwt(token);
      return token;
    } finally {
      if (siweSessionRequests.get(expectedAddress) === sessionRequest) {
        siweSessionRequests.delete(expectedAddress);
      }
      setIsSigningIn(false);
    }
  }, [expectedAddress, isSigningIn, loadJwt, signIn]);

  useEffect(() => {
    setError(null);
    setJwt(undefined);
    hasAutoSignAttemptedRef.current = false;
    setJwt(loadJwt());
  }, [loadJwt, expectedAddress]);

  useEffect(() => {
    if (jwt) {
      setError(null);
    }
  }, [jwt]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncJwt = () => {
      setJwt(loadJwt());
    };

    window.addEventListener("storage", syncJwt);
    window.addEventListener(SIWE_SESSION_CHANGE_EVENT, syncJwt);

    return () => {
      window.removeEventListener("storage", syncJwt);
      window.removeEventListener(SIWE_SESSION_CHANGE_EVENT, syncJwt);
    };
  }, [loadJwt]);

  useEffect(() => {
    if (!options.autoAuthenticate) return;
    if (!isConnected || !expectedAddress) return;
    if (jwt !== null) return;
    if (hasAutoSignAttemptedRef.current) return;

    hasAutoSignAttemptedRef.current = true;
    void ensureSession().catch((sessionError) => {
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : "Failed to request signature. Please retry from your wallet."
      );
    });
  }, [
    ensureSession,
    expectedAddress,
    isConnected,
    jwt,
    options.autoAuthenticate,
  ]);

  return {
    jwt,
    error,
    isSigningIn,
    ensureSession,
    clearSession,
  };
}
