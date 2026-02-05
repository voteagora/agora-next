import { Proposal } from "@/app/api/common/proposals/proposal";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { cancelProposalAttestation } from "@/lib/eas";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useState } from "react";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { cancelOffchainProposal } from "@/app/api/offchain-proposals/actions";
import { PLMConfig } from "../draft/types";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  proposal: Proposal;
}

const { ui } = Tenant.current();

export const OffchainCancel = ({ proposal }: Props) => {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const plmConfig = ui.toggle("proposal-lifecycle")?.config as PLMConfig;
  const offchainProposalCreator = plmConfig.offchainProposalCreator;

  const canCancel =
    address &&
    offchainProposalCreator?.some(
      (creator) => creator.toLowerCase() === address?.toLowerCase()
    );

  const handleCancel = async () => {
    if (!proposal.id || !walletClient || !address || !chain) {
      toast.error("Missing proposal ID, wallet client, address, or chain.");
      return;
    }
    setIsLoading(true);

    const transport = walletClient.transport;
    const network = { chainId: chain.id, name: chain.name };
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, address);

    try {
      const attestationUID = (
        proposal.proposalData as ParsedProposalData["OFFCHAIN_STANDARD"]["kind"]
      ).created_attestation_hash;

      if (!attestationUID) {
        throw new Error("Attestation UID not found");
      }

      const { transactionHash } = await cancelProposalAttestation({
        attestationUID,
        signer: signer,
        canceller: address,
      });

      await cancelOffchainProposal({
        proposalId: proposal.id,
        transactionHash: attestationUID,
      });

      toast.success("Offchain proposal cancelled successfully.");
    } catch (e: any) {
      console.error("Error in offchain cancel flow:", e);
      const errorMessage = e.shortMessage || e.message || "Unknown error";
      toast.error(`Error: ${errorMessage}`, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCancel) {
    return null;
  }

  return (
    <>
      <Button
        className="bg-neutral hover:bg-neutral border-line"
        onClick={handleCancel}
        variant="outline"
        disabled={isLoading}
        loading={isLoading}
      >
        {isLoading ? "Cancelling..." : "Cancel Offchain"}
      </Button>
    </>
  );
};
