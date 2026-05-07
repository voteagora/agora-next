import { useCallback } from "react";
import { useAccount } from "wagmi";

import { useSiweJwt } from "@/hooks/useSiweJwt";

export const useProposalActionAuth = () => {
  const { address } = useAccount();
  const { ensureSession } = useSiweJwt({
    expectedAddress: address?.toLowerCase(),
    purpose: "proposal_draft",
  });

  const getAuthenticationData = useCallback(
    async (
      _messagePayload?: Record<string, unknown>
    ): Promise<{ jwt: string } | null> => {
      if (!address) {
        return null;
      }

      const jwt = await ensureSession();
      if (!jwt) {
        return null;
      }

      return {
        jwt,
      };
    },
    [address, ensureSession]
  );

  return { getAuthenticationData };
};
