import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useSafePendingTransactions } from "@/hooks/useSafePendingTransactions";
import { SafeTxnTooltip } from "@/components/shared/SafeTxnTooltip";
import { useWrappedWriteContract } from "@/hooks/useWrappedWriteContract";

interface Props {
  proposal: Proposal;
}

export const AgoraGovQueue = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  const { data, writeContract: write } = useWrappedWriteContract();
  const { getQueueProposalsForDescription } = useSafePendingTransactions();

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const pendingQueueProposals = useMemo(() => {
    return getQueueProposalsForDescription(proposal.description, proposal.id);
  }, [getQueueProposalsForDescription, proposal.description, proposal.id]);

  const onSubmit = () => {
    write({
      address: contracts.governor.address as `0x${string}`,
      abi: contracts.governor.abi,
      functionName: "queue",
      args: proposalToCallArgs(proposal),
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Queued. It might take a minute to see the updated status.",
        { duration: 10000 }
      );
    }
    if (isError) {
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error queuing proposal ${errorMessage}`, {
        duration: 10000,
      });
    }
  }, [isSuccess, isError, error]);
  if (pendingQueueProposals[proposal.id]) {
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
        <Button loading={isLoading} onClick={onSubmit}>
          Queue
        </Button>
      )}
    </>
  );
};
