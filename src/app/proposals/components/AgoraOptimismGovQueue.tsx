import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";
import { ProposalType } from "@/app/proposals/draft/types";
import { keccak256 } from "viem";
import { toUtf8Bytes } from "ethers";

interface Props {
  proposal: Proposal;
}

export const AgoraOptimismGovQueue = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isStandardType = proposal.proposalType === "STANDARD";

  const callArgs = () => {
    if (isStandardType) {
      return proposalToCallArgs(proposal);
    } else {
      const moduleAddress = getProposalTypeAddress(ProposalType.APPROVAL);

      if (!moduleAddress) {
        throw new Error(
          `Module address not found for tenant ${Tenant.current().namespace}`
        );
      }

      return [
        moduleAddress,
        proposal.unformattedProposalData,
        keccak256(toUtf8Bytes(proposal.description!)),
      ];
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Queued. It might take a minute to see the updated status.",
        { duration: 10000 }
      );
    }
    if (isError) {
      toast.error(`Error queuing proposal ${error?.message}`, {
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
          loading={isLoading}
          onClick={() =>
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: isStandardType ? "queue" : "queueWithModule",
              args: callArgs(),
            })
          }
        >
          Queue
        </Button>
      )}
    </>
  );
};
