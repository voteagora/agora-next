import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { toUtf8Bytes } from "ethers";
import { Button } from "@/components/ui/button";
import { keccak256 } from "viem";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  proposal: Proposal;
}

export const ProposalQueueButton = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  const dynamicProposalType: keyof ParsedProposalData =
    proposal.proposalType as keyof ParsedProposalData;
  const proposalData =
    proposal.proposalData as ParsedProposalData[typeof dynamicProposalType]["kind"];

  const { data, write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "queue",
    args: [
      "options" in proposalData ? proposalData.options[0].targets : "",
      "options" in proposalData ? proposalData.options[0].values : "",
      "options" in proposalData ? proposalData.options[0].calldatas : "",
      keccak256(toUtf8Bytes(proposal.description!)),
    ],
  });

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransaction({
      hash: data?.hash,
    });

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

  return (
    <>
      {!isFetched && (
        <Button loading={isLoading} onClick={() => write?.()}>
          Queue
        </Button>
      )}
    </>
  );
};
