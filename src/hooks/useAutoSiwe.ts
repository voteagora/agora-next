"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  LOCAL_STORAGE_SIWE_JWT_KEY,
  LOCAL_STORAGE_SIWE_STAGE_KEY,
} from "@/lib/constants";
import { useAccount } from "wagmi";
import { useSIWE } from "connectkit";

type UseAutoSiweOptions = {
  autoTrigger?: boolean;
  scope?: RegExp | ((path: string) => boolean);
};

type UseAutoSiweReturn = {
  isConnected: boolean;
  isSignedIn: boolean;
  hasJwt: boolean;
  stage: "awaiting_response" | "signed" | "error" | null;
  signInIfNeeded: () => Promise<boolean>;
  resetAttempt: () => void;
};

const LOCAL_STORAGE_JWT_KEY = LOCAL_STORAGE_SIWE_JWT_KEY;
const LOCAL_STORAGE_STAGE_KEY = LOCAL_STORAGE_SIWE_STAGE_KEY;

export function useAutoSiwe(
  options: UseAutoSiweOptions = {}
): UseAutoSiweReturn {
  const { autoTrigger = false, scope } = options;
  const { isConnected } = useAccount();
  const { isSignedIn, signIn } = useSIWE();
  const attemptedRef = useRef(false);

  const hasJwt = useMemo(() => {
    try {
      const session = localStorage.getItem(LOCAL_STORAGE_JWT_KEY);
      if (!session) return false;
      const parsed = JSON.parse(session);
      return Boolean(parsed?.access_token);
    } catch {
      return false;
    }
  }, []);

  const stage = useMemo(() => {
    try {
      const s = localStorage.getItem(LOCAL_STORAGE_STAGE_KEY);
      if (s === "awaiting_response" || s === "signed" || s === "error")
        return s;
      return null;
    } catch {
      return null;
    }
  }, []);

  const withinScope = useMemo(() => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    if (scope) {
      return typeof scope === "function" ? scope(path) : scope.test(path);
    }
    // Default: only allow auto-trigger under drafts; manual calls can still opt-in elsewhere
    if (autoTrigger) {
      return path.startsWith("/proposals/draft");
    }
    return true;
  }, [scope, autoTrigger]);

  const doSignIn = useCallback(async (): Promise<boolean> => {
    if (!isConnected) return false;
    if (attemptedRef.current) return false;
    if (!withinScope) return false;
    if (hasJwt || isSignedIn) return true;
    attemptedRef.current = true;
    try {
      await signIn();
      return true;
    } catch {
      attemptedRef.current = false;
      return false;
    }
  }, [isConnected, withinScope, hasJwt, isSignedIn, signIn]);

  // Expose explicit trigger; callers decide when to invoke
  const signInIfNeeded = useCallback(async () => {
    if (!autoTrigger) {
      // Manual mode
      return doSignIn();
    }
    // Auto mode (rare): still respect scope
    return doSignIn();
  }, [autoTrigger, doSignIn]);

  const resetAttempt = useCallback(() => {
    attemptedRef.current = false;
  }, []);

  return {
    isConnected,
    isSignedIn,
    hasJwt,
    stage,
    signInIfNeeded,
    resetAttempt,
  };
}

export default useAutoSiwe;
