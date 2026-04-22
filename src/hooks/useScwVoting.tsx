import { MissingVote } from "@/lib/voteUtils";
import { useEffect, useRef, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useLyraDeriveAccount } from "@/hooks/useSmartAccountDerive";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

export const useScwVoting = ({
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
  const { data: smartAccountClient } = useLyraDeriveAccount();

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>(undefined);
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const data = contracts.governor.contract.interface.encodeFunctionData(
    !!reason ? "castVoteWithReason" : "castVote",
    !!reason
      ? [BigInt(proposalId), support, reason]
      : [BigInt(proposalId), support]
  ) as `0x${string}`;

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
          voteKind: "scw",
        },
      });
      traceRef.current = null;
    };
  }, [proposalId]);

  const write = () => {
    if (!smartAccountClient) {
      return;
    }

    const trace = startFrontendMiradorFlowTrace({
      name: "GovernanceVote",
      flow: MIRADOR_FLOW.governanceVote,
      step: "scw_vote_submit",
      context: {
        walletAddress: smartAccountClient.account?.address,
        chainId: contracts.governor.chain.id,
        proposalId,
      },
      tags: ["governance", "vote", "frontend", "scw"],
      attributes: {
        voteKind: "scw",
        support,
        hasReason: Boolean(reason),
        hasParams: Boolean(params),
        missingVote,
      },
      startEventName: "governance_vote_started",
      startEventDetails: {
        proposalId,
        voteKind: "scw",
        support,
      },
    });
    traceRef.current = trace;
    attachMiradorTransactionArtifacts(trace, {
      chainId: contracts.governor.chain.id,
      inputData: data,
    });
    setIsLoading(true);

    smartAccountClient
      .sendUserOperation({
        account: smartAccountClient.account!,
        uo: {
          target: contracts.governor.address as `0x${string}`,
          data,
        },
      })
      .then((txn: any) => {
        setIsLoading(false);
        setIsError(false);
        setIsSuccess(true);
        setTxnHash(txn.hash);
        attachMiradorTransactionArtifacts(trace, {
          chainId: contracts.governor.chain.id,
          inputData: data,
          txHash: txn.hash,
          txDetails: "Smart account governance vote transaction",
        });
        void closeFrontendMiradorFlowTrace(trace, {
          reason: "governance_vote_succeeded",
          eventName: "governance_vote_succeeded",
          details: {
            proposalId,
            voteKind: "scw",
            transactionHash: txn.hash,
          },
        });
        if (traceRef.current === trace) {
          traceRef.current = null;
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setIsError(true);
        setIsSuccess(false);
        void closeFrontendMiradorFlowTrace(trace, {
          reason: "governance_vote_failed",
          eventName: "governance_vote_failed",
          details: {
            proposalId,
            voteKind: "scw",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        if (traceRef.current === trace) {
          traceRef.current = null;
        }
      });
  };

  return {
    isLoading,
    isError,
    isSuccess,
    write,
    data: { standardTxHash: txnHash, advancedTxHash: undefined },
  };
};
