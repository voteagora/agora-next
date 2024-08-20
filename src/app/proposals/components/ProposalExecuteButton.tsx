import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { keccak256 } from "viem";
import { toUtf8Bytes } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blocksToSeconds } from "@/lib/blockTimes";

interface Props {
  proposal: Proposal;
}

export const ProposalExecuteButton = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  const dynamicProposalType: keyof ParsedProposalData =
    proposal.proposalType as keyof ParsedProposalData;
  const proposalData =
    proposal.proposalData as ParsedProposalData[typeof dynamicProposalType]["kind"];

  const [latestBlockNumber, setLatestBlockNumber] = useState(0);
  contracts.token.provider.getBlock("latest").then((block) => {
    if (block) {
      setLatestBlockNumber(block?.number);
    }
  });
  const { data: executionDelayInBlocks } = useContractRead({
    address: contracts.timelock!.address as `0x${string}`,
    abi: contracts.timelock!.abi,
    functionName: "getMinDelay",
  });
  // const hasDelayPassed = blocksToSeconds(latestBlockNumber + Number(executionDelayInBlocks as any)) < proposal.executedTime / 1000;

  const { data, write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "execute",
    args: [
      "options" in proposalData ? proposalData.options[0].targets : "",
      "options" in proposalData ? proposalData.options[0].values : "",
      "options" in proposalData ? proposalData.options[0].calldatas : "",
      keccak256(toUtf8Bytes(proposal.description!)),
    ],
  });

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Executed. It might take a minute to see the updated status.",
        { duration: 10000 }
      );
    }
    if (isError) {
      toast.error(`Error executing proposal ${error?.message}`, {
        duration: 10000,
      });
    }
  }, [isSuccess, isError, error]);

  return (
    <>
      {!isFetched && (
        <Button onClick={() => write?.()} loading={isLoading}>
          Execute
        </Button>
      )}
    </>
  );
};
