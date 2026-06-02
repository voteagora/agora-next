"use client";

import { useCallback, useEffect, useState } from "react";
import { useSIWE, SIWE_NONCE_QUERY_KEY } from "connectkit";
import { useQueryClient } from "@tanstack/react-query";
import { useSignMessage } from "wagmi";
import { getAddress } from "viem";

import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  closeStoredSiweLoginTrace,
  prepareFreshSiweLoginTrace,
  shouldTrackMiradorSiweLogin,
} from "@/lib/mirador/siweLoginTrace";
import {
  clearStoredSafeOffchainSigningState,
  getStoredSafeOffchainSigningState,
  isSafeOffchainSigningFlowExpired,
  isSafeOffchainSigningFlowTerminal,
  type SafeOffchainSigningPurpose,
} from "@/lib/safeOffchainFlow";
import {
  clearStoredSiweSession,
  getStoredSiweJwt,
  waitForStoredSiweJwt,
} from "@/lib/siweSession";
import { isSafeOffchainMessageTrackingEnabled } from "@/lib/safeFeatures";
import { isSafeWallet } from "@/lib/utils";

export type WalletType = "loading" | "safe" | "eoa";

type SafeFlowClosedReason = "cancelled" | "failed" | "expired";

type EnsureSiweSessionOptions = {
  dialogClassName?: string;
  onSafeAuthenticated?: (jwt: string) => Promise<void> | void;
  onSafeClosed?: (reason: SafeFlowClosedReason) => void;
};

function getSiweLoginCloseOptions(reason: SafeFlowClosedReason) {
  switch (reason) {
    case "expired":
      return {
        eventName: "siwe_login_expired",
        details: { reason },
        reason: "siwe_login_expired",
      };
    case "failed":
      return {
        eventName: "siwe_login_failed",
        details: { reason },
        reason: "siwe_login_failed",
      };
    default:
      return {
        eventName: "siwe_login_cancelled",
        details: { reason },
        reason: "siwe_login_cancelled",
      };
  }
}

export function useEnsureSiweSession(params: {
  address?: `0x${string}`;
  chainId?: number;
  purpose: SafeOffchainSigningPurpose;
}) {
  const { address, chainId, purpose } = params;
  const { signOut } = useSIWE();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();
  const openDialog = useOpenDialog();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>("loading");

  useEffect(() => {
    if (!address) {
      setWalletType("loading");
      return;
    }

    let cancelled = false;
    setWalletType("loading");

    void isSafeWallet(address, chainId)
      .then((safeWallet) => {
        if (!cancelled) {
          setWalletType(safeWallet ? "safe" : "eoa");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWalletType("eoa");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, chainId]);

  const loadSiweJwt = useCallback(() => {
    if (!address) {
      return null;
    }

    return getStoredSiweJwt({ expectedAddress: address });
  }, [address]);

  const clearSiweSession = useCallback(async () => {
    try {
      await signOut();
    } catch {}

    clearStoredSiweSession();
  }, [signOut]);

  const prepareMiradorSiweLoginTrace = useCallback(async () => {
    if (!address || !shouldTrackMiradorSiweLogin(purpose)) {
      return;
    }

    await prepareFreshSiweLoginTrace({
      purpose,
      walletAddress: address,
      chainId,
    });
  }, [address, chainId, purpose]);

  // Custom sign-in that fetches the nonce directly, bypassing ConnectKit's
  // pre-fetched nonce state which can be undefined on first render.
  const doSignIn = useCallback(async () => {
    if (!address || !chainId) {
      throw new Error("Wallet not connected");
    }
    const nonce = await siweProviderConfig.getNonce();
    const message = await siweProviderConfig.createMessage({
      // siwe library requires EIP-55 checksummed address; params.address is lowercased
      address: getAddress(address),
      chainId,
      nonce,
    });
    const signature = await signMessageAsync({ message });
    const success = await siweProviderConfig.verifyMessage({
      message,
      signature,
    });
    void queryClient.invalidateQueries({ queryKey: [SIWE_NONCE_QUERY_KEY] });
    return success;
  }, [address, chainId, signMessageAsync, queryClient]);

  const openSafeSiweDialog = useCallback(
    (options?: EnsureSiweSessionOptions) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const storedFlow = getStoredSafeOffchainSigningState();
      const shouldClearStoredFlow =
        storedFlow &&
        (storedFlow.signingKind !== "siwe" ||
          storedFlow.safeAddress.toLowerCase() !== address.toLowerCase() ||
          storedFlow.purpose !== purpose ||
          isSafeOffchainSigningFlowTerminal(storedFlow) ||
          isSafeOffchainSigningFlowExpired(storedFlow));

      if (shouldClearStoredFlow) {
        clearStoredSafeOffchainSigningState();
        clearStoredSiweSession();
      }

      openDialog({
        type: "SAFE_OFFCHAIN_SIGNING",
        className: options?.dialogClassName ?? "sm:w-[42rem]",
        disableDismiss: true,
        params: {
          safeAddress: address,
          chainId,
          purpose,
          signingKind: "siwe",
          onAuthenticated: options?.onSafeAuthenticated,
          onClosed: (reason) => {
            if (shouldTrackMiradorSiweLogin(purpose)) {
              void closeStoredSiweLoginTrace(getSiweLoginCloseOptions(reason));
            }
            options?.onSafeClosed?.(reason);
          },
        },
      });
    },
    [address, chainId, openDialog, purpose]
  );

  const ensureSiweSession = useCallback(
    async (options?: EnsureSiweSessionOptions): Promise<string | null> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const existingJwt = loadSiweJwt();
      if (existingJwt) {
        return existingJwt;
      }

      let resolvedWalletType = walletType;
      if (resolvedWalletType === "loading") {
        resolvedWalletType = await isSafeWallet(address, chainId)
          .then((safeWallet) => (safeWallet ? "safe" : "eoa"))
          .catch(() => "eoa");
        setWalletType(resolvedWalletType);
      }

      if (resolvedWalletType === "safe") {
        if (isSafeOffchainMessageTrackingEnabled()) {
          await prepareMiradorSiweLoginTrace();
          openSafeSiweDialog(options);
          return null;
        }

        clearStoredSafeOffchainSigningState();
        clearStoredSiweSession();
      }

      if (isSigningIn) {
        return null;
      }

      setIsSigningIn(true);
      try {
        await prepareMiradorSiweLoginTrace();
        const signInSuccess = await doSignIn();
        if (!signInSuccess) {
          throw new Error("Sign-in cancelled or failed.");
        }
      } catch (error) {
        if (shouldTrackMiradorSiweLogin(purpose)) {
          await closeStoredSiweLoginTrace({
            eventName: "siwe_login_failed",
            details: {
              message:
                error instanceof Error ? error.message : "Sign-in cancelled.",
            },
            reason: "siwe_login_failed",
          });
        }
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Sign-in cancelled.");
      } finally {
        setIsSigningIn(false);
      }

      const jwt = await waitForStoredSiweJwt({ expectedAddress: address });

      if (!jwt) {
        throw new Error("Unable to load SIWE session. Please try again.");
      }

      return jwt;
    },
    [
      address,
      chainId,
      doSignIn,
      isSigningIn,
      loadSiweJwt,
      openSafeSiweDialog,
      prepareMiradorSiweLoginTrace,
      purpose,
      walletType,
    ]
  );

  return {
    clearSiweSession,
    ensureSiweSession,
    isSigningIn,
    loadSiweJwt,
    walletType,
  };
}
