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
import { ParsedProposalData } from "@/lib/proposalUtils";

export default function OpManagerDeleteProposal({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { isOpManager } = useIsOpManager();

  const { contracts } = Tenant.current();
  const proposalType = proposal.proposalType;

  const getArgs = () => {
    const descriptionHash = keccak256(toHex(proposal?.description!));

    if (proposalType === "STANDARD") {
      const proposalData =
        proposal.proposalData as ParsedProposalData["STANDARD"]["kind"];
      const targets = proposalData.options[0]?.targets as `0x${string}`[];
      const values = proposalData.options[0]?.values.map((v) => BigInt(v));
      const calldata = proposalData.options[0]?.calldatas as `0x${string}`[];

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

  // If proposal is cancelled, it means it has been deleted and we don't need to show the button
  if (!!proposal.cancelled_transaction_hash) {
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
