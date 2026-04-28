"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

import { useEnsureSiweSession } from "@/hooks/useEnsureSiweSession";
import * as siweSession from "@/lib/siweSession";
import type { SafeOffchainSigningPurpose } from "@/lib/safeOffchainFlow";

interface UseSiweJwtOptions {
  expectedAddress?: string;
  autoAuthenticate?: boolean;
  purpose?: SafeOffchainSigningPurpose;
  chainId?: number;
}

const siweSessionRequests = new Map<string, Promise<string | null>>();
const SAFE_SIGN_IN_TIMEOUT_MS = 3 * 60 * 1000;
const DEFAULT_SIWE_SESSION_CHANGE_EVENT = "agora:siwe-session-change";

export function useSiweJwt(options: UseSiweJwtOptions = {}) {
  const { address, chain, isConnected } = useAccount();
  const [jwt, setJwt] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const hasAutoSignAttemptedRef = useRef(false);

  const expectedAddress = (options.expectedAddress ??
    address?.toLowerCase() ??
    null) as `0x${string}` | null;
  const purpose = options.purpose ?? "notification_preferences";
  const sessionKey = expectedAddress ? `${purpose}:${expectedAddress}` : null;

  const { clearSiweSession, ensureSiweSession, loadSiweJwt, walletType } =
    useEnsureSiweSession({
      address: expectedAddress ?? undefined,
      chainId: options.chainId ?? chain?.id,
      purpose,
    });

  const loadJwt = useCallback((): string | null => {
    if (!expectedAddress) return null;
    const sessionJwt = typeof loadSiweJwt === "function" ? loadSiweJwt() : null;
    return sessionJwt ?? siweSession.getStoredSiweJwt({ expectedAddress });
  }, [expectedAddress, loadSiweJwt]);

  const clearSession = useCallback(async () => {
    setError(null);
    await clearSiweSession();
    setJwt(null);
  }, [clearSiweSession]);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (!expectedAddress || !sessionKey) {
      throw new Error("Wallet not connected");
    }

    const existing = loadJwt();
    if (existing) {
      setError(null);
      setJwt(existing);
      return existing;
    }

    const existingRequest = siweSessionRequests.get(sessionKey);
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

    const sessionRequest = new Promise<string | null>((resolve, reject) => {
      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const settle = (token: string | null, nextError?: string | null) => {
        if (settled) return;
        settled = true;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (nextError !== undefined) {
          setError(nextError);
        } else if (token) {
          setError(null);
        }

        setJwt(token);
        resolve(token);
      };

      const rejectSession = (sessionError: Error) => {
        if (settled) return;
        settled = true;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        setError(sessionError.message);
        setJwt(null);
        reject(sessionError);
      };

      void (async () => {
        try {
          const token = await ensureSiweSession({
            onSafeAuthenticated: (safeJwt) => {
              settle(safeJwt, null);
            },
            onSafeClosed: (reason) => {
              settle(
                null,
                reason === "expired"
                  ? "The Safe sign-in flow expired. Please try again."
                  : "Safe sign-in was cancelled or failed."
              );
            },
          });

          if (token) {
            settle(token, null);
            return;
          }

          const stored = loadJwt();
          if (stored) {
            settle(stored, null);
            return;
          }

          if (walletType === "safe" || walletType === "loading") {
            timeoutId = setTimeout(() => {
              settle(null, "The Safe sign-in flow expired. Please try again.");
            }, SAFE_SIGN_IN_TIMEOUT_MS);
            return;
          }

          settle(null, null);
        } catch (sessionError) {
          const stored = loadJwt();
          if (stored) {
            settle(stored, null);
            return;
          }

          rejectSession(
            sessionError instanceof Error
              ? sessionError
              : new Error("Sign-in cancelled.")
          );
        }
      })();
    });

    siweSessionRequests.set(sessionKey, sessionRequest);

    try {
      return await sessionRequest;
    } finally {
      if (siweSessionRequests.get(sessionKey) === sessionRequest) {
        siweSessionRequests.delete(sessionKey);
      }
      setIsSigningIn(false);
    }
  }, [ensureSiweSession, expectedAddress, loadJwt, sessionKey, walletType]);

  useEffect(() => {
    setError(null);
    setJwt(undefined);
    hasAutoSignAttemptedRef.current = false;
    setJwt(loadJwt());
  }, [loadJwt, expectedAddress, purpose]);

  useEffect(() => {
    if (jwt) {
      setError(null);
    }
  }, [jwt]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sessionChangeEvent =
      "SIWE_SESSION_CHANGE_EVENT" in siweSession
        ? siweSession.SIWE_SESSION_CHANGE_EVENT
        : DEFAULT_SIWE_SESSION_CHANGE_EVENT;

    const syncJwt = () => {
      setJwt(loadJwt());
    };

    window.addEventListener("storage", syncJwt);
    window.addEventListener(sessionChangeEvent, syncJwt);

    return () => {
      window.removeEventListener("storage", syncJwt);
      window.removeEventListener(sessionChangeEvent, syncJwt);
    };
  }, [loadJwt]);

  useEffect(() => {
    return () => {
      if (sessionKey) {
        siweSessionRequests.delete(sessionKey);
      }
    };
  }, [sessionKey]);

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
