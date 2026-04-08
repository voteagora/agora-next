import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { encodeFunctionData } from "viem";
import {
  getProposalCallArgs,
  getProposalFunctionName,
} from "@/app/proposals/utils/moduleProposalUtils";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface Props {
  proposal: Proposal;
  className?: string;
  style?: React.CSSProperties;
}

export const AgoraGovQueue = ({ proposal, className, style }: Props) => {
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
        { duration: 10000 }
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
            error: "shortMessage" in error ? error.shortMessage : error.message,
          },
        });
        traceRef.current = null;
      }
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error queuing proposal ${errorMessage}`, {
        duration: 10000,
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

  // Note: Optimistic proposals are not queued
  if (proposal.proposalType === "OPTIMISTIC") {
    return null;
  }

  return (
    <>
      {!isFetched && (
        <Button
          className={className}
          style={style}
          loading={isLoading}
          onClick={() => {
            const functionName = getProposalFunctionName(
              proposal.proposalType!,
              "queue"
            );
            const args = getProposalCallArgs(proposal);
            const inputData = encodeFunctionData({
              abi: contracts.governor.abi as any,
              functionName,
              args: args as any,
            });

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

            const trace = startFrontendMiradorFlowTrace({
              name: "GovernanceAdmin",
              flow: MIRADOR_FLOW.governanceAdmin,
              step: "queue_submit",
              context: {
                chainId: contracts.governor.chain.id,
                proposalId: proposal.id,
              },
              tags: ["governance", "admin", "frontend"],
              attributes: {
                action: "queue",
                proposalType: proposal.proposalType,
              },
              startEventName: "governance_admin_started",
              startEventDetails: {
                action: "queue",
                proposalId: proposal.id,
              },
            });
            traceRef.current = trace;
            attachMiradorTransactionArtifacts(trace, {
              chainId: contracts.governor.chain.id,
              inputData,
            });

            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName,
              args,
            });
          }}
        >
          Queue
        </Button>
      )}
    </>
  );
};
