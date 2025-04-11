import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";
import { ProposalType } from "@/app/proposals/draft/types";
import { keccak256 } from "viem";
import { toUtf8Bytes } from "ethers";
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";

interface Props {
  proposal: Proposal;
}

export const AgoraOptimismGovCancel = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();

  const { data: adminAddress } = useGovernorAdmin({ enabled: true });

  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();

  const { writeContract: write, data } = useWriteContract();
  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isStandardType = proposal.proposalType === "STANDARD";

  const callArgs = () => {
    if (isStandardType) {
      return proposalToCallArgs(proposal);
    } else {
      const approvalModuleAddress = getProposalTypeAddress(
        ProposalType.APPROVAL
      );
      const optimisticModuleAddress = getProposalTypeAddress(
        ProposalType.OPTIMISTIC
      );

      const moduleAddress =
        proposal.proposalType === "APPROVAL"
          ? approvalModuleAddress
          : optimisticModuleAddress;

      // When using cancelWithModule, the proposal data needs to be a hex string otherwise the bytecode
      // won't match the proposal and the transaction will fail.
      const proposalData = proposal.unformattedProposalData?.startsWith("0x")
        ? proposal.unformattedProposalData
        : `0x${proposal.unformattedProposalData}`;

      if (!moduleAddress) {
        throw new Error(
          `Module address not found for tenant ${Tenant.current().namespace}`
        );
      }
      return [
        moduleAddress,
        proposalData,
        keccak256(toUtf8Bytes(proposal.description!)),
      ];
    }
  };

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
              functionName: isStandardType ? "cancel" : "cancelWithModule",
              args: callArgs(),
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
