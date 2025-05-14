import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useWrappedWriteContract } from "@/hooks/useWrappedWriteContract";
import { useSafePendingTransactions } from "@/hooks/useSafePendingTransactions";
import { SafeTxnTooltip } from "@/components/shared/SafeTxnTooltip";

interface Props {
  proposal: Proposal;
}

export const OZGovQueue = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  const { data, writeContract: write } = useWrappedWriteContract();

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Queued. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error queuing proposal ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  const { getQueueProposalsForDescription } = useSafePendingTransactions();

  const pendingQueueProposals = useMemo(() => {
    return getQueueProposalsForDescription(proposal.description, proposal.id);
  }, [getQueueProposalsForDescription, proposal.description, proposal.id]);

  if (pendingQueueProposals?.[proposal.id]) {
    return (
      <SafeTxnTooltip className="inline-block">
        <Button className="w-full bg-primary/90 cursor-none" disabled>
          Pending Approval {pendingQueueProposals[proposal.id]}
        </Button>
      </SafeTxnTooltip>
    );
  }

  return (
    <>
      {!isFetched && (
        <Button
          loading={isLoading}
          onClick={() =>
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: "queue",
              args: proposalToCallArgs(proposal),
            })
          }
        >
          Queue
        </Button>
      )}
    </>
  );
};
