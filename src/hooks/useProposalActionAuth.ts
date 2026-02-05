import { useSignMessage } from "wagmi";
import { useCallback } from "react";

import { getStoredSiweJwt } from "@/lib/siweSession";

export const useProposalActionAuth = () => {
  const { signMessageAsync } = useSignMessage();

  const getAuthenticationData = useCallback(
    async (messagePayload: Record<string, any>) => {
      const jwt = getStoredSiweJwt();

      if (jwt) {
        return { jwt };
      }

      const message = JSON.stringify(messagePayload);
      const signature = await signMessageAsync({ message }).catch(
        () => undefined
      );

      if (!signature) {
        return null;
      }

      return { message, signature };
    },
    [signMessageAsync]
  );

  return { getAuthenticationData };
};
