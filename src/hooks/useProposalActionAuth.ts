import { useAccount } from "wagmi";
import { useCallback } from "react";

import { useSiweJwt } from "@/hooks/useSiweJwt";

export const useProposalActionAuth = () => {
  const { address } = useAccount();
  const { ensureSession } = useSiweJwt({
    expectedAddress: address?.toLowerCase(),
  });

  const getAuthenticationData = useCallback(
    async (_messagePayload: Record<string, any>) => {
      if (!address) {
        return null;
      }

      const normalizedAddress = address.toLowerCase() as `0x${string}`;
      const jwt = await ensureSession();

      if (!jwt) {
        return null;
      }

      return { jwt, address: normalizedAddress };
    },
    [address, ensureSession]
  );

  return { getAuthenticationData };
};
