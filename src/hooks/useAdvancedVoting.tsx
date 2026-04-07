import { MissingVote } from "@/lib/voteUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { track } from "@vercel/analytics";
import Tenant from "@/lib/tenant/tenant";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { wrappedWaitForTransactionReceipt } from "@/lib/utils";
import toast from "react-hot-toast";
import { WriteContractErrorType } from "wagmi/actions";
import { encodeFunctionData } from "viem";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

const useAdvancedVoting = ({
  proposalId,
  support,
  advancedVP,
  authorityChains,
  reason = "",
  params,
  missingVote,
}: {
  proposalId: string;
  support: number;
  advancedVP: bigint | null;
  authorityChains: string[][] | null;
  reason?: string;
  params?: `0x${string}`;
  missingVote: MissingVote;
}) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const {
    writeContractAsync: advancedVote,
    isError: _advancedVoteError,
    error: _advancedVoteErrorDetails,
  } = useWriteContract();
  const {
    writeContractAsync: standardVote,
    isError: _standardVoteError,
    error: _standardVoteErrorDetails,
  } = useWriteContract();

  const [standardVoteError, setStandardVoteError] =
    useState(_standardVoteError);
  const [standardVoteErrorDetails, setStandardVoteErrorDetails] =
    useState<WriteContractErrorType | null>(_standardVoteErrorDetails);
  const [advancedVoteError, setAdvancedVoteError] =
    useState(_advancedVoteError);
  const [advancedVoteErrorDetails, setAdvancedVoteErrorDetails] =
    useState<WriteContractErrorType | null>(_advancedVoteErrorDetails);
  const [standardVoteLoading, setStandardVoteLoading] = useState(false);
  const [advancedVoteLoading, setAdvancedVoteLoading] = useState(false);
  const [standardVoteSuccess, setStandardVoteSuccess] = useState(false);
  const [advancedVoteSuccess, setAdvancedVoteSuccess] = useState(false);
  const [standardTxHash, setStandardTxHash] = useState<string | undefined>(
    undefined
  );
  const [advancedTxHash, setAdvancedTxHash] = useState<string | undefined>(
    undefined
  );
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
        },
      });
      traceRef.current = null;
    };
  }, [proposalId]);

  const write = useCallback(() => {
    const startVoteTrace = ({
      step,
      voteKind,
      chainId,
      inputData,
    }: {
      step: string;
      voteKind: "standard" | "advanced";
      chainId?: number;
      inputData?: string;
    }) => {
      const trace = startFrontendMiradorFlowTrace({
        name: "GovernanceVote",
        flow: MIRADOR_FLOW.governanceVote,
        step,
        context: {
          walletAddress: address,
          chainId,
          proposalId,
        },
        tags: ["governance", "vote", "frontend"],
        attributes: {
          voteKind,
          support,
          hasReason: Boolean(reason),
          hasParams: Boolean(params),
          missingVote,
          hasAdvancedVp: advancedVP !== null,
        },
        startEventName: "governance_vote_started",
        startEventDetails: {
          proposalId,
          voteKind,
          support,
        },
      });
      traceRef.current = trace;
      attachMiradorTransactionArtifacts(trace, {
        chainId,
        inputData,
      });
      return trace;
    };

    const _standardVote = async () => {
      setStandardVoteLoading(true);
      const functionName = reason
        ? params
          ? "castVoteWithReasonAndParams"
          : "castVoteWithReason"
        : params
          ? "castVoteWithReasonAndParams"
          : "castVote";
      const args = reason
        ? params
          ? [BigInt(proposalId), support, reason, params]
          : [BigInt(proposalId), support, reason]
        : params
          ? [BigInt(proposalId), support, reason, params]
          : [BigInt(proposalId), support];
      const inputData = encodeFunctionData({
        abi: contracts.governor.abi as any,
        functionName,
        args: args as any,
      });
      const trace = startVoteTrace({
        step: "standard_vote_submit",
        voteKind: "standard",
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
            submittedTxType:
              directTx !== transactionHash ? "safe" : "tx",
            submittedTxDetails:
              directTx !== transactionHash
                ? "Submitted Safe governance vote transaction"
                : "Submitted governance vote transaction",
            txHash: transactionHash,
            txDetails: "Governance vote transaction",
          });
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
          setStandardTxHash(transactionHash);
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

    const _advancedVote = async () => {
      if (!authorityChains || !advancedVP) {
        toast.error("No authority chains or advanced VP found");
        return;
      }
      setAdvancedVoteLoading(true);
      const args = [
        advancedVP,
        authorityChains as any,
        BigInt(proposalId),
        support,
        reason,
        params ?? "0x",
      ];
      const inputData = encodeFunctionData({
        abi: contracts.alligator!.abi as any,
        functionName: "limitedCastVoteWithReasonAndParamsBatched",
        args: args as any,
      });
      const trace = startVoteTrace({
        step: "advanced_vote_submit",
        voteKind: "advanced",
        chainId: contracts.alligator?.chain.id,
        inputData,
      });

      try {
        const advancedTx = await advancedVote({
          address: contracts.alligator!.address as `0x${string}`,
          abi: contracts.alligator!.abi,
          functionName: "limitedCastVoteWithReasonAndParamsBatched",
          args: args as any,
          chainId: contracts.alligator?.chain.id,
        });
        const { status, transactionHash } =
          await wrappedWaitForTransactionReceipt({
            hash: advancedTx,
            address: address as `0x${string}`,
          });
        if (status === "success") {
          attachMiradorTransactionArtifacts(trace, {
            chainId: contracts.alligator?.chain.id,
            inputData,
            submittedTxHash: advancedTx,
            submittedTxType:
              advancedTx !== transactionHash ? "safe" : "tx",
            submittedTxDetails:
              advancedTx !== transactionHash
                ? "Submitted Safe advanced governance vote transaction"
                : "Submitted advanced governance vote transaction",
            txHash: transactionHash,
            txDetails: "Advanced governance vote transaction",
          });
          await trackEvent({
            event_name: ANALYTICS_EVENT_NAMES.ADVANCED_VOTE,
            event_data: {
              proposal_id: proposalId,
              support,
              reason,
              params,
              voter: address as `0x${string}`,
              transaction_hash: transactionHash,
            },
          });
          setAdvancedTxHash(transactionHash);
          setAdvancedVoteSuccess(true);
          await closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_succeeded",
            eventName: "governance_vote_succeeded",
            details: {
              proposalId,
              voteKind: "advanced",
              transactionHash,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        } else {
          setAdvancedVoteError(true);
          await closeFrontendMiradorFlowTrace(trace, {
            reason: "governance_vote_failed",
            eventName: "governance_vote_failed",
            details: {
              proposalId,
              voteKind: "advanced",
              error: `Unexpected vote receipt status: ${status}`,
            },
          });
          if (traceRef.current === trace) {
            traceRef.current = null;
          }
        }
      } catch (error) {
        setAdvancedVoteError(true);
        setAdvancedVoteErrorDetails(error as WriteContractErrorType);
        await closeFrontendMiradorFlowTrace(trace, {
          reason: "governance_vote_failed",
          eventName: "governance_vote_failed",
          details: {
            proposalId,
            voteKind: "advanced",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        if (traceRef.current === trace) {
          traceRef.current = null;
        }
      } finally {
        setAdvancedVoteLoading(false);
      }
    };

    const vote = async () => {
      const trackingData: any = {
        dao_slug: "OP",
        proposal_id: BigInt(proposalId),
        support,
      };

      if (reason) {
        trackingData.reason = reason;
      }

      if (params) {
        trackingData.params = params;
      }

      if (
        address?.toLowerCase() ===
        "0x5d36a202687fD6Bd0f670545334bF0B4827Cc1E2".toLowerCase()
      ) {
        track("Standard Vote", trackingData);
        await _standardVote();
        return;
      }

      switch (missingVote) {
        case "DIRECT":
          track("Standard Vote", trackingData);
          await _standardVote();
          break;
        case "ADVANCED":
          track("Advanced Vote", trackingData);
          await _advancedVote();
          break;
        case "BOTH":
          track("Standard + Advanced Vote (single transaction)", trackingData);
          await _advancedVote();
          break;
      }
    };

    void vote();
  }, [
    address,
    advancedVP,
    advancedVote,
    authorityChains,
    contracts.alligator,
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
    isLoading:
      missingVote === "DIRECT" ? standardVoteLoading : advancedVoteLoading,
    isError: missingVote === "DIRECT" ? standardVoteError : advancedVoteError,
    resetError: () => {
      if (missingVote === "DIRECT") {
        setStandardVoteError(false);
        setStandardVoteErrorDetails(null);
      } else {
        setAdvancedVoteError(false);
        setAdvancedVoteErrorDetails(null);
      }
    },
    error:
      missingVote === "DIRECT"
        ? standardVoteErrorDetails
        : advancedVoteErrorDetails,
    isSuccess:
      missingVote === "DIRECT" ? standardVoteSuccess : advancedVoteSuccess,
    write,
    data: { advancedTxHash, standardTxHash },
  };
};

export default useAdvancedVoting;
