import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useWrappedWriteContract } from "@/hooks/useWrappedWriteContract";
import { useSafePendingTransactions } from "@/hooks/useSafePendingTransactions";
import { SafeTxnTooltip } from "@/components/shared/SafeTxnTooltip";

interface Props {
  proposal: Proposal;
}

export const BravoGovCancel = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { selectedWalletAddress: address } = useSelectedWallet();
  const { data: adminAddress } = useGovernorAdmin({ enabled: true });
  const proposer = proposal.proposer;
  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase() ||
    proposer?.toString().toLowerCase() === address?.toLowerCase();

  const { data, writeContract: write } = useWrappedWriteContract();

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Cancelled. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error cancelling proposal ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  const { getCancelProposalsForDescription } = useSafePendingTransactions();

  const pendingCancelProposals = useMemo(() => {
    return getCancelProposalsForDescription(proposal.description, proposal.id);
  }, [getCancelProposalsForDescription, proposal.description, proposal.id]);

  if (pendingCancelProposals?.[proposal.id]) {
    return (
      <SafeTxnTooltip className="inline-block">
        <Button className="w-full bg-primary/90 cursor-none" disabled>
          Pending Approval {pendingCancelProposals[proposal.id]}
        </Button>
      </SafeTxnTooltip>
    );
  }

  if (!canCancel) {
    return null;
  }

  return (
    <>
      {!isFetched && (
        <Button
          onClick={() =>
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: "cancel",
              args: [proposal.id],
            })
          }
          variant="outline"
          loading={isLoading}
        >
          Cancel
        </Button>
      )}
    </>
  );
};
