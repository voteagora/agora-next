import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
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

export const BravoGovCancel = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const proposer = proposal.proposer;
  const canCancel =
    proposer?.toString().toLowerCase() === address?.toLowerCase();

  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (isSuccess) {
      if (traceRef.current) {
        attachMiradorTransactionArtifacts(traceRef.current, {
          chainId: contracts.governor.chain.id,
          txHash: data,
          txDetails: "Cancel governance proposal transaction",
        });
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "governance_admin_succeeded",
          eventName: "governance_admin_succeeded",
          details: {
            action: "cancel",
            proposalId: proposal.id,
            transactionHash: data,
          },
        });
        traceRef.current = null;
      }
      toast.success(
        "Proposal Cancelled. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      if (traceRef.current) {
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "governance_admin_failed",
          eventName: "governance_admin_failed",
          details: {
            action: "cancel",
            proposalId: proposal.id,
            error: "shortMessage" in error ? error.shortMessage : error.message,
          },
        });
        traceRef.current = null;
      }
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error cancelling proposal ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "governance_admin_unmounted",
        eventName: "governance_admin_unmounted",
        details: {
          action: "cancel",
          proposalId: proposal.id,
        },
      });
      traceRef.current = null;
    };
  }, [proposal.id]);

  if (!canCancel) {
    return null;
  }

  return (
    <>
      {!isFetched && (
        <Button
          onClick={() => {
            if (traceRef.current) {
              void closeFrontendMiradorFlowTrace(traceRef.current, {
                reason: "governance_admin_restarted",
                eventName: "governance_admin_restarted",
                details: {
                  action: "cancel",
                  proposalId: proposal.id,
                },
              });
            }

            const inputData = encodeFunctionData({
              abi: contracts.governor.abi as any,
              functionName: "cancel",
              args: [proposal.id],
            });
            const trace = startFrontendMiradorFlowTrace({
              name: "GovernanceAdmin",
              flow: MIRADOR_FLOW.governanceAdmin,
              step: "cancel_submit",
              context: {
                walletAddress: address,
                chainId: contracts.governor.chain.id,
                proposalId: proposal.id,
              },
              tags: ["governance", "admin", "frontend"],
              attributes: { action: "cancel" },
              startEventName: "governance_admin_started",
              startEventDetails: { action: "cancel", proposalId: proposal.id },
            });
            traceRef.current = trace;
            attachMiradorTransactionArtifacts(trace, {
              chainId: contracts.governor.chain.id,
              inputData,
            });
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: "cancel",
              args: [proposal.id],
            });
          }}
          variant="outline"
          loading={isLoading}
        >
          Cancel
        </Button>
      )}
    </>
  );
};
