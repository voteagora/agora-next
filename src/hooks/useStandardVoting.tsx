import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { wrappedWaitForTransactionReceipt } from "@/lib/utils";
import { WriteContractErrorType } from "wagmi/actions";
import { encodeFunctionData } from "viem";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

const useStandardVoting = ({
  proposalId,
  support,
  reason = "",
  params,
  missingVote,
}: {
  proposalId: string;
  support: number;
  reason?: string;
  params?: `0x${string}`;
  missingVote: MissingVote;
}) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const {
    writeContractAsync: standardVote,
    isError: _standardVoteError,
    error: _error,
  } = useWriteContract();

  const [standardVoteError, setStandardVoteError] =
    useState(_standardVoteError);
  const [standardVoteErrorDetails, setStandardVoteErrorDetails] =
    useState<WriteContractErrorType | null>(_error);
  const [standardVoteLoading, setStandardVoteLoading] = useState(false);
  const [standardVoteSuccess, setStandardVoteSuccess] = useState(false);
  const [standardTxHash, setStandardTxHash] = useState<string | undefined>(
    undefined
  );
  const [advancedTxHash] = useState<string | undefined>(undefined);
  const traceRef = useRef<FrontendMiradorTrace>(null);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "governance_vote_unmounted",
        eventName: "governance_vote_unmounted",
        details: {
          proposalId,
          voteKind: "standard",
        },
      });
      traceRef.current = null;
    };
  }, [proposalId]);

  const write = useCallback(() => {
    const _standardVote = async () => {
      setStandardVoteLoading(true);
      const functionName = !!reason ? "castVoteWithReason" : "castVote";
      const args = !!reason
        ? [BigInt(proposalId), support, reason]
        : [BigInt(proposalId), support];
      const inputData = encodeFunctionData({
        abi: contracts.governor.abi as any,
        functionName,
        args: args as any,
      });
      const trace = startFrontendMiradorFlowTrace({
        name: "GovernanceVote",
        flow: MIRADOR_FLOW.governanceVote,
        step: "standard_vote_submit",
        context: {
          walletAddress: address,
          chainId: contracts.governor.chain.id,
          proposalId,
        },
        tags: ["governance", "vote", "frontend"],
        attributes: {
          voteKind: "standard",
          support,
          hasReason: Boolean(reason),
          hasParams: Boolean(params),
          missingVote,
        },
        startEventName: "governance_vote_started",
        startEventDetails: {
          proposalId,
          voteKind: "standard",
          support,
        },
      });
      traceRef.current = trace;
      attachMiradorTransactionArtifacts(trace, {
        chainId: contracts.governor.chain.id,
        inputData,
      });

      try {
        const directTx = await standardVote({
          address: contracts.governor.address as `0x${string}`,
          abi: contracts.governor.abi,
          functionName,
          args: args as any,
          chainId: contracts.governor.chain.id,
        });

        const { status, transactionHash } =
          await wrappedWaitForTransactionReceipt({
            hash: directTx,
            address: address as `0x${string}`,
          });

        if (status === "success") {
          attachMiradorTransactionArtifacts(trace, {
            chainId: contracts.governor.chain.id,
            inputData,
            submittedTxHash: directTx,
            submittedTxType: directTx !== transactionHash ? "safe" : "tx",
            submittedTxDetails:
              directTx !== transactionHash
                ? "Submitted Safe governance vote transaction"
                : "Submitted governance vote transaction",
            txHash: transactionHash,
            txDetails: "Governance vote transaction",
          });
          setStandardTxHash(transactionHash);

          await trackEvent({
            event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
            event_data: {
              proposal_id: proposalId,
              support,
              reason,
              params,
              voter: address as `0x${string}`,
              transaction_hash: transactionHash,
            },
          });
          setStandardVoteSuccess(true);
          await closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_succeeded",
            eventName: "governance_vote_succeeded",
            details: {
              proposalId,
              voteKind: "standard",
              transactionHash,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        } else {
          setStandardVoteError(true);
          await closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_failed",
            eventName: "governance_vote_failed",
            details: {
              proposalId,
              voteKind: "standard",
              error: `Unexpected vote receipt status: ${status}`,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        }
      } catch (error) {
        setStandardVoteError(true);
        setStandardVoteErrorDetails(error as WriteContractErrorType);
        await closeFrontendMiradorFlowTrace(trace, {
          reason: "governance_vote_failed",
          eventName: "governance_vote_failed",
          details: {
            proposalId,
            voteKind: "standard",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        if (traceRef.current === trace) {
          traceRef.current = null;
        }
      } finally {
        setStandardVoteLoading(false);
      }
    };

    const vote = async () => {
      switch (missingVote) {
        case "DIRECT":
          await _standardVote();
          break;
      }
    };

    void vote();
  }, [
    address,
    contracts.governor.abi,
    contracts.governor.address,
    contracts.governor.chain.id,
    missingVote,
    params,
    proposalId,
    reason,
    standardVote,
    support,
  ]);

  return {
    isLoading: standardVoteLoading,
    isError: standardVoteError || _standardVoteError,
    resetError: () => {
      setStandardVoteError(false);
      setStandardVoteErrorDetails(null);
    },
    isSuccess: standardVoteSuccess,
    write,
    error: standardVoteErrorDetails,
    data: { advancedTxHash, standardTxHash },
  };
};

export default useStandardVoting;
