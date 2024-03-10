"use client";

import { Proposal } from "@/app/api/common/proposals/proposal";
import useIsOpManager from "@/app/lib/hooks/useIsOpManager";
import { Button } from "@/components/ui/button";
import {
  approvalModuleAddress,
  optimisticModuleAddress,
} from "@/lib/contracts/contracts";
import { keccak256, toHex } from "viem";
import { useContractWrite } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

export default function OpManagerDeleteProposal({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { isOpManager } = useIsOpManager();

  const { contracts } = Tenant.getInstance();
  const proposalType = proposal.proposalType;

  const getArgs = () => {
    const descriptionHash = keccak256(toHex(proposal?.description!));

    if (proposalType === "STANDARD") {
      const targets = proposal.proposalData.options[0]
        ?.targets as `0x${string}`[];
      const values = proposal.proposalData.options[0]?.values.map((v) =>
        BigInt(v)
      );
      const calldata = proposal.proposalData.options[0]
        ?.calldatas as `0x${string}`[];

      return [targets, values, calldata, descriptionHash];
    } else {
      const moduleAddress =
        proposalType === "APPROVAL"
          ? approvalModuleAddress
          : optimisticModuleAddress;

      const proposalData = proposal.unformattedProposalData;

      return [moduleAddress, proposalData, descriptionHash];
    }
  };

  const { write, isLoading, isSuccess } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: proposalType === "STANDARD" ? "cancel" : "cancelWithModule",
    // @ts-ignore
    args: getArgs(),
  });

  if (!isOpManager) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Button
        variant="destructive"
        className="w-1/2 mb-4"
        onClick={() => write()}
        disabled={isLoading || isSuccess}
      >
        {isLoading
          ? "Loading..."
          : isSuccess
          ? "Proposal deleted"
          : "Delete proposal"}
      </Button>
    </div>
  );
}
