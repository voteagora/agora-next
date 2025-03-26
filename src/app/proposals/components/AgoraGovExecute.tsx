import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect } from "react";
import toast from "react-hot-toast";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  proposal: Proposal;
}

export const AgoraGovExecute = ({ proposal }: Props) => {
  const { contracts, ui } = Tenant.current();

  const { data: delayInSeconds } = useReadContract({
    address: contracts.timelock!.address as `0x${string}`,
    abi: contracts.timelock!.abi,
    functionName: "getMinDelay",
    chainId: contracts.timelock!.chain.id,
  });

  let canExecute = false;
  let executeTimeInSeconds = 0;

  if (proposal.queuedTime) {
    const queuedTimeInSeconds = Math.floor(
      (proposal.queuedTime as Date).getTime() / 1000
    );
    executeTimeInSeconds = queuedTimeInSeconds + Number(delayInSeconds);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    canExecute = currentTimeInSeconds >= executeTimeInSeconds;
  }

  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransactionReceipt({ hash: data });

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
    <div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          {!canExecute ? (
            <>
              <TooltipTrigger>
                <Button
                  className={cn(ui.theme === "dark" && "text-neutral")}
                  disabled={true}
                  variant="outline"
                >
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
                      address: contracts.governor.address as `0x${string}`,
                      abi: contracts.governor.abi,
                      functionName: "execute",
                      args: proposalToCallArgs(proposal),
                    })
                  }
                  loading={isLoading}
                  className={cn(ui.theme === "dark" && "text-neutral")}
                >
                  Execute
                </Button>
              )}
            </>
          )}
          <TooltipContent>
            <div className="flex flex-col gap-1 p-2 text-secondary">
              <div>
                This proposal can be executed on{" "}
                {new Date(executeTimeInSeconds * 1000).toLocaleString()}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
