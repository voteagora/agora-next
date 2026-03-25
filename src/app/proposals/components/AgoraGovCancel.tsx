import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";
import {
  getGovernorByAddress,
  getDefaultGovernor,
} from "@/lib/tenant/governorUtils";
import {
  getProposalCallArgs,
  getProposalFunctionName,
} from "@/app/proposals/utils/moduleProposalUtils";

interface Props {
  proposal: Proposal;
  useOptimismStyling?: boolean;
}

export const AgoraGovCancel = ({
  proposal,
  useOptimismStyling = false,
}: Props) => {
  const { contracts } = Tenant.current();
  const governorInstance = proposal.contract
    ? (getGovernorByAddress(proposal.contract, contracts) ??
      getDefaultGovernor(contracts))
    : getDefaultGovernor(contracts);
  const { address } = useAccount();

  const { data: adminAddress } = useGovernorAdmin({ enabled: true });
  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();

  const { writeContract: write, data } = useWriteContract();
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

  if (!canCancel) {
    return null;
  }

  return (
    <>
      {!isFetched && (
        <Button
          className={
            useOptimismStyling
              ? undefined
              : "bg-neutral hover:bg-neutral border-line"
          }
          onClick={() =>
            write({
              address: governorInstance.governor.address as `0x${string}`,
              abi: governorInstance.governor.abi,
              functionName: getProposalFunctionName(
                proposal.proposalType!,
                "cancel"
              ),
              args: getProposalCallArgs(proposal),
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
