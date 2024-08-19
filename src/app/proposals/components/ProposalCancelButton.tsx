import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { keccak256 } from "viem";
import { toUtf8Bytes } from "ethers";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  proposal: Proposal;
}

export const ProposalCancelButton = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();

  const { data: adminAddress, isFetched: isAdminFetched } = useContractRead({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "admin",
  });

  const canCancel =
    isAdminFetched &&
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();
  const dynamicProposalType: keyof ParsedProposalData =
    proposal.proposalType as keyof ParsedProposalData;
  const proposalData =
    proposal.proposalData as ParsedProposalData[typeof dynamicProposalType]["kind"];

  const { data, write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "cancel",
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
        "Proposal Cancelled. It might take a minute to see the updated status.",
        { duration: 10000 }
      );
    }
    if (isError) {
      toast.error(`Error cancelling proposal ${error?.message}`, {
        duration: 10000,
      });
    }
  }, [isSuccess, isError, error]);

  return (
    <div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          {!canCancel ? (
            <TooltipTrigger>
              <Button disabled={true} variant="outline">
                Cancel
              </Button>
            </TooltipTrigger>
          ) : (
            <>
              {!isFetched && (
                <Button
                  onClick={() => write?.()}
                  variant="outline"
                  loading={isLoading}
                >
                  Cancel
                </Button>
              )}
            </>
          )}

          <TooltipContent>
            <div className="flex flex-col gap-1 p-2">
              <div>Only the admin wallet can cancel proposals:</div>
              <div className="font-semibold">{adminAddress}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
