import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  getProposalCallArgs,
  getProposalFunctionName,
} from "@/app/proposals/utils/moduleProposalUtils";

interface Props {
  proposal: Proposal;
  className?: string;
  style?: React.CSSProperties;
}

export const AgoraGovQueue = ({ proposal, className, style }: Props) => {
  const { contracts } = Tenant.current();

  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

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

  // Note: Optimistic proposals are not queued
  if (proposal.proposalType === "OPTIMISTIC") {
    return null;
  }

  return (
    <>
      {!isFetched && (
        <Button
          className={className}
          style={style}
          loading={isLoading}
          onClick={() =>
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: getProposalFunctionName(
                proposal.proposalType!,
                "queue"
              ),
              args: getProposalCallArgs(proposal),
            })
          }
        >
          Queue
        </Button>
      )}
    </>
  );
};
