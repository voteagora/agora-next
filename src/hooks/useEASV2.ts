import { useAccount, useWalletClient } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { BrowserProvider } from "ethers";
import { createV2CreateProposalAttestation } from "@/lib/eas";
import Tenant from "@/lib/tenant/tenant";

export function useEASV2() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { ui } = Tenant.current();

  const isEASV2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;

  const getSigner = async () => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    return await new BrowserProvider(walletClient.transport as any).getSigner();
  };

  const createProposalMutation = useMutation({
    mutationFn: async ({
      proposal_id,
      title,
      description,
      startts,
      endts,
      tags,
      proposal_type_uid,
    }: {
      proposal_id: bigint;
      title: string;
      description: string;
      startts: bigint;
      endts: bigint;
      tags: string;
      proposal_type_uid?: string;
    }) => {
      if (!walletClient || !isEASV2Enabled) {
        throw new Error("EAS v2 not enabled or wallet not connected");
      }
      const signer = await getSigner();
      const result = await createV2CreateProposalAttestation({
        proposal_id,
        title,
        description,
        startts,
        endts,
        tags,
        proposal_type_uid,
        signer,
      });

      return result;
    },
  });

  return {
    isEASV2Enabled,
    address,
    createProposal: createProposalMutation.mutateAsync,
    isCreatingProposal: createProposalMutation.isPending,
  };
}
