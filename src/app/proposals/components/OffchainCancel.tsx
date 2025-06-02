import { Proposal } from "@/app/api/common/proposals/proposal";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";
import { cancelProposalAttestation } from "@/lib/eas";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useState } from "react";

interface Props {
  proposal: Proposal;
}

export const OffchainCancel = ({ proposal }: Props) => {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: adminAddress } = useGovernorAdmin({ enabled: true });
  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();

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
      const apiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;

      if (!apiKey) {
        throw new Error("AGORA_API_KEY is not set");
      }

      const { transactionHash } = await cancelProposalAttestation({
        id: proposal.id,
        signer: signer,
        canceller: address,
      });

      const response = await fetch("/api/offchain-proposals/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          proposalId: proposal.id,
          transactionHash: transactionHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update cancellation in DB");
      }
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
