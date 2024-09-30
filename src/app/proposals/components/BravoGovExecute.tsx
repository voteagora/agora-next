import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blocksToSeconds } from "@/lib/blockTimes";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  proposal: Proposal;
}

export const BravoGovExecute = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const [canExecute, setCanExecute] = useState(false);
  const [executeTime, setExecuteTime] = useState<Date | undefined>();

  const { data: executionDelayInBlocks, isFetched: executionDelayFetched } =
    useContractRead({
      address: contracts.timelock!.address as `0x${string}`,
      abi: contracts.timelock!.abi,
      functionName: "delay",
    });

  const { data, write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "execute",
    args: [proposal.id],
  });

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  useEffect(() => {
    const delayInSeconds = blocksToSeconds(Number(executionDelayInBlocks));

    console.log(delayInSeconds);

    let executeTimeInSeconds = 0;

    if (proposal.queuedTime) {
      const queuedTimeInSeconds = Math.floor(
        (proposal.queuedTime as Date).getTime() / 1000
      );
      executeTimeInSeconds = queuedTimeInSeconds + delayInSeconds;
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      setCanExecute(currentTimeInSeconds >= executeTimeInSeconds);
      setExecuteTime(new Date(executeTimeInSeconds * 1000));
    }
  }, [executionDelayFetched]);

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
          {!canExecute && executeTime ? (
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
                <Button onClick={() => write?.()} loading={isLoading}>
                  Execute
                </Button>
              )}
            </>
          )}
          <TooltipContent>
            <div className="flex flex-col gap-1 p-2">
              <div>
                This proposal can be executed on{" "}
                {executeTime ? executeTime.toLocaleString() : "N/A"}.
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
