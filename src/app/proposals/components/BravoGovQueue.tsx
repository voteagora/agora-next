import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
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

export const BravoGovQueue = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (isSuccess) {
      if (traceRef.current) {
        attachMiradorTransactionArtifacts(traceRef.current, {
          chainId: contracts.governor.chain.id,
          txHash: data,
          txDetails: "Queue governance proposal transaction",
        });
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "governance_admin_succeeded",
          eventName: "governance_admin_succeeded",
          details: {
            action: "queue",
            proposalId: proposal.id,
            transactionHash: data,
          },
        });
        traceRef.current = null;
      }
      toast.success(
        "Proposal Queued. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      if (traceRef.current) {
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "governance_admin_failed",
          eventName: "governance_admin_failed",
          details: {
            action: "queue",
            proposalId: proposal.id,
            error: error?.message,
          },
        });
        traceRef.current = null;
      }
      toast.error(`Error queuing proposal ${error?.message}`, {
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
          action: "queue",
          proposalId: proposal.id,
        },
      });
      traceRef.current = null;
    };
  }, [proposal.id]);

  return (
    <>
      {!isFetched && (
        <Button
          loading={isLoading}
          onClick={() => {
            if (traceRef.current) {
              void closeFrontendMiradorFlowTrace(traceRef.current, {
                reason: "governance_admin_restarted",
                eventName: "governance_admin_restarted",
                details: {
                  action: "queue",
                  proposalId: proposal.id,
                },
              });
            }

            const inputData = encodeFunctionData({
              abi: contracts.governor.abi as any,
              functionName: "queue",
              args: [proposal.id],
            });
            const trace = startFrontendMiradorFlowTrace({
              name: "GovernanceAdmin",
              flow: MIRADOR_FLOW.governanceAdmin,
              step: "queue_submit",
              context: {
                chainId: contracts.governor.chain.id,
                proposalId: proposal.id,
              },
              tags: ["governance", "admin", "frontend"],
              attributes: { action: "queue" },
              startEventName: "governance_admin_started",
              startEventDetails: { action: "queue", proposalId: proposal.id },
            });
            traceRef.current = trace;
            attachMiradorTransactionArtifacts(trace, {
              chainId: contracts.governor.chain.id,
              inputData,
            });
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: "queue",
              args: [proposal.id],
            });
          }}
        >
          Queue
        </Button>
      )}
    </>
  );
};
