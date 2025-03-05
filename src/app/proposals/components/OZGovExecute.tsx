import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  proposal: Proposal;
}

export const OZGovExecute = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const [canExecute, setCanExecute] = useState(false);
  const [executeTime, setExecuteTime] = useState(new Date());

  // Check whether user has the EXECUTOR_ROLE
  const { data: hasExecuteRole, isFetched: fetchedRole } = useReadContract({
    address: contracts.timelock!.address as `0x${string}`,
    abi: contracts.timelock!.abi,
    functionName: "hasRole",
    args: [
      "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63", // EXECUTOR_ROLE
      address as `0x${string}`,
    ],
    chainId: contracts.timelock!.chain.id,
  });

  // Check whether time has passed
  const { data: delayInSeconds, isFetched: fetchedDelay } = useReadContract({
    address: contracts.timelock!.address as `0x${string}`,
    abi: contracts.timelock!.abi,
    functionName: "getMinDelay",
    chainId: contracts.timelock!.chain.id,
  });

  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (fetchedRole && fetchedDelay) {
      if (proposal.queuedTime) {
        const queuedTimeInSeconds = Math.floor(
          (proposal.queuedTime as Date).getTime() / 1000
        );
        const executeTimeInSeconds =
          queuedTimeInSeconds + Number(delayInSeconds);
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        setCanExecute(currentTimeInSeconds >= executeTimeInSeconds);
        setExecuteTime(new Date(executeTimeInSeconds * 1000));
      }
    }
  }, [fetchedRole, fetchedDelay]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Executed. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      toast.error(`Error executing proposal ${error?.message}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  return (
    <div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          {!canExecute ? (
            <>
              <TooltipTrigger>
                <Button disabled={true} variant="outline">
                  Execute
                </Button>
              </TooltipTrigger>
            </>
          ) : (
            <>
              {!isFetched && (
                <Button
                  onClick={() =>
                    write({
                      address: contracts.governor!.address as `0x${string}`,
                      abi: contracts.governor!.abi,
                      functionName: "execute",
                      args: proposalToCallArgs(proposal),
                    })
                  }
                  loading={isLoading}
                >
                  Execute
                </Button>
              )}
            </>
          )}

          <TooltipContent>
            <div className="flex flex-col gap-1 p-2">
              <div>
                {!canExecute
                  ? `This proposal can be executed on ${executeTime.toLocaleString()}`
                  : `You don't have permission to execute this proposal.`}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
