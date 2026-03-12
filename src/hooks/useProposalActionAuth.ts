import { useCallback } from "react";
import { useAccount } from "wagmi";

import { useEnsureSiweSession } from "@/hooks/useEnsureSiweSession";

export const useProposalActionAuth = () => {
  const { address, chain } = useAccount();
  const { ensureSiweSession } = useEnsureSiweSession({
    address: address as `0x${string}` | undefined,
    chainId: chain?.id,
    purpose: "proposal_draft",
  });

  const getAuthenticationData = useCallback(
    async (_messagePayload?: Record<string, any>) => {
      const jwt = await ensureSiweSession();
      if (!jwt) {
        return null;
      }

      return { jwt };
    },
    [ensureSiweSession]
  );

  return { getAuthenticationData };
};
