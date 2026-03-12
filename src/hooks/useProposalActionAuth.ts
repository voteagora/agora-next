import { useSignMessage } from "wagmi";
import { useCallback } from "react";

import { getStoredSiweJwt } from "@/lib/siweSession";

function isUserRejectedSigningError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: number | string;
    name?: string;
    message?: string;
    shortMessage?: string;
    details?: string;
    cause?: unknown;
  };

  if (
    candidate.code === 4001 ||
    candidate.code === "ACTION_REJECTED" ||
    candidate.name === "UserRejectedRequestError"
  ) {
    return true;
  }

  const messages = [
    candidate.message,
    candidate.shortMessage,
    candidate.details,
  ].filter((value): value is string => typeof value === "string");

  if (messages.some((value) => value.toLowerCase().includes("user rejected"))) {
    return true;
  }

  return isUserRejectedSigningError(candidate.cause);
}

export const useProposalActionAuth = () => {
  const { signMessageAsync } = useSignMessage();

  const getAuthenticationData = useCallback(
    async (messagePayload: Record<string, any>) => {
      const jwt = getStoredSiweJwt();

      if (jwt) {
        return { jwt };
      }

      const message = JSON.stringify(messagePayload);
      let signature;
      try {
        signature = await signMessageAsync({ message });
      } catch (error) {
        if (isUserRejectedSigningError(error)) {
          return null;
        }

        throw error;
      }

      if (!signature) {
        return null;
      }

      return { message, signature };
    },
    [signMessageAsync]
  );

  return { getAuthenticationData };
};
