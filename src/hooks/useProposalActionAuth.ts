import { useAccount } from "wagmi";
import { useCallback } from "react";

import { useSiweJwt } from "@/hooks/useSiweJwt";

type ProposalActionAuthData = {
  jwt: string;
  address: `0x${string}`;
};

export const useProposalActionAuth = () => {
  const { address } = useAccount();
  const { ensureSession } = useSiweJwt({
    expectedAddress: address?.toLowerCase(),
  });

  const getAuthenticationData = useCallback(
    async (
      _messagePayload: Record<string, unknown>
    ): Promise<ProposalActionAuthData | null> => {
      if (!address) {
        return null;
      }

      const normalizedAddress = address.toLowerCase() as `0x${string}`;
      const jwt = await ensureSession();

      if (!jwt) {
        return null;
      }

      return {
        jwt,
        address: normalizedAddress,
      };
    },
    [address, ensureSession]
  );

  return { getAuthenticationData };
};
