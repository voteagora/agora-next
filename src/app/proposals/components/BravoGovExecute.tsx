import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { encodeFunctionData } from "viem";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface Props {
  proposal: Proposal;
}

export const BravoGovExecute = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const [canExecute, setCanExecute] = useState(false);
  const [executeTime, setExecuteTime] = useState<Date | undefined>();
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const { data: delayInSeconds, isFetched: executionDelayFetched } =
    useReadContract({
      address: contracts.timelock!.address as `0x${string}`,
      abi: contracts.timelock!.abi,
      functionName: "delay",
      chainId: contracts.timelock!.chain.id,
    });

  const { data, writeContract } = useWriteContract();

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
      if (traceRef.current) {
        attachMiradorTransactionArtifacts(traceRef.current, {
          chainId: contracts.governor.chain.id,
          txHash: data,
          txDetails: "Execute governance proposal transaction",
        });
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "governance_admin_succeeded",
          eventName: "governance_admin_succeeded",
          details: {
            action: "execute",
            proposalId: proposal.id,
            transactionHash: data,
          },
        });
        traceRef.current = null;
      }
      toast.success(
        "Proposal Executed. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      if (traceRef.current) {
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "governance_admin_failed",
          eventName: "governance_admin_failed",
          details: {
            action: "execute",
            proposalId: proposal.id,
            error: "shortMessage" in error ? error.shortMessage : error.message,
          },
        });
        traceRef.current = null;
      }
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error executing proposal ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [
    contracts.governor.chain.id,
    data,
    error,
    isError,
    isSuccess,
    proposal.id,
  ]);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "governance_admin_unmounted",
        eventName: "governance_admin_unmounted",
        details: {
          action: "execute",
          proposalId: proposal.id,
        },
      });
      traceRef.current = null;
    };
  }, [proposal.id]);

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
                  onClick={() => {
                    if (traceRef.current) {
                      void closeFrontendMiradorFlowTrace(traceRef.current, {
                        reason: "governance_admin_restarted",
                        eventName: "governance_admin_restarted",
                        details: {
                          action: "execute",
                          proposalId: proposal.id,
                        },
                      });
                    }

                    const inputData = encodeFunctionData({
                      abi: contracts.governor.abi as any,
                      functionName: "execute",
                      args: [proposal.id],
                    });
                    const trace = startFrontendMiradorFlowTrace({
                      name: "GovernanceAdmin",
                      flow: MIRADOR_FLOW.governanceAdmin,
                      step: "execute_submit",
                      context: {
                        chainId: contracts.governor.chain.id,
                        proposalId: proposal.id,
                      },
                      tags: ["governance", "admin", "frontend"],
                      attributes: { action: "execute" },
                      startEventName: "governance_admin_started",
                      startEventDetails: {
                        action: "execute",
                        proposalId: proposal.id,
                      },
                    });
                    traceRef.current = trace;
                    attachMiradorTransactionArtifacts(trace, {
                      chainId: contracts.governor.chain.id,
                      inputData,
                    });
                    writeContract({
                      address: contracts.governor.address as `0x${string}`,
                      abi: contracts.governor.abi,
                      functionName: "execute",
                      args: [proposal.id],
                    });
                  }}
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
