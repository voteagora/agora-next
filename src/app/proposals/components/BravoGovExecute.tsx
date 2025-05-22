import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWrappedWriteContract } from "@/hooks/useWrappedWriteContract";
import { useSafePendingTransactions } from "@/hooks/useSafePendingTransactions";
import { SafeTxnTooltip } from "@/components/shared/SafeTxnTooltip";

interface Props {
  proposal: Proposal;
}

export const BravoGovExecute = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const [canExecute, setCanExecute] = useState(false);
  const [executeTime, setExecuteTime] = useState<Date | undefined>();

  const { data: delayInSeconds, isFetched: executionDelayFetched } =
    useReadContract({
      address: contracts.timelock!.address as `0x${string}`,
      abi: contracts.timelock!.abi,
      functionName: "delay",
      chainId: contracts.timelock!.chain.id,
    });

  const { data, writeContract } = useWrappedWriteContract();

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    let executeTimeInSeconds = 0;

    if (proposal.queuedTime) {
      const queuedTimeInSeconds = Math.floor(
        (proposal.queuedTime as Date).getTime() / 1000
      );
      executeTimeInSeconds = queuedTimeInSeconds + Number(delayInSeconds);
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
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error executing proposal ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  const { getExecuteProposalsForDescription } = useSafePendingTransactions();

  const pendingExecuteProposals = useMemo(() => {
    return getExecuteProposalsForDescription(proposal.description, proposal.id);
  }, [getExecuteProposalsForDescription, proposal.description, proposal.id]);

  if (pendingExecuteProposals?.[proposal.id]) {
    return (
      <SafeTxnTooltip className="inline-block">
        <Button className="w-full bg-primary/90 cursor-none" disabled>
          Pending Approval {pendingExecuteProposals[proposal.id]}
        </Button>
      </SafeTxnTooltip>
    );
  }

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
                <Button
                  onClick={() =>
                    writeContract({
                      address: contracts.governor.address as `0x${string}`,
                      abi: contracts.governor.abi,
                      functionName: "execute",
                      args: [proposal.id],
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
