"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useSIWE } from "connectkit";

const LOCAL_STORAGE_JWT_KEY = "agora-siwe-jwt";

export default function AutoSiweOnConnect() {
  const { isConnected } = useAccount();
  const { isSignedIn, signIn } = useSIWE();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isConnected) return;
    if (attemptedRef.current) return;

    // Scope: only auto-trigger SIWE on draft pages
    const isDraftScope =
      typeof window !== "undefined" &&
      /\/proposals\/draft\//.test(window.location.pathname);
    if (!isDraftScope) return;

    const hasJwt = (() => {
      try {
        const session = localStorage.getItem(LOCAL_STORAGE_JWT_KEY);
        if (!session) return false;
        const parsed = JSON.parse(session);
        return Boolean(parsed?.access_token);
      } catch {
        return false;
      }
    })();

    if (!hasJwt && !isSignedIn) {
      attemptedRef.current = true;
      // Trigger SIWE flow; ignore errors silently to avoid blocking UX
      signIn().catch(() => {
        attemptedRef.current = false;
      });
    }
  }, [isConnected, isSignedIn, signIn]);

  return null;
}
