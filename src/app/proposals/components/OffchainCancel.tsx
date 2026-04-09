import { Proposal } from "@/app/api/common/proposals/proposal";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { cancelProposalAttestation } from "@/lib/eas";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useState } from "react";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { cancelOffchainProposal } from "@/app/api/offchain-proposals/actions";
import { PLMConfig } from "../draft/types";
import Tenant from "@/lib/tenant/tenant";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";
import { extractFailedEasTxContext } from "@/lib/easTxContext";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  getFrontendMiradorTraceContext,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface Props {
  proposal: Proposal;
}

const { ui } = Tenant.current();

export const OffchainCancel = ({ proposal }: Props) => {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const plmConfig = ui.toggle("proposal-lifecycle")?.config as PLMConfig;
  const offchainProposalCreator = plmConfig.offchainProposalCreator;
  const { getAuthenticationData } = useProposalActionAuth();

  const canCancel =
    address &&
    offchainProposalCreator?.some(
      (creator) => creator.toLowerCase() === address?.toLowerCase()
    );

  const handleCancel = async () => {
    if (!proposal.id || !walletClient || !address || !chain) {
      toast.error("Missing proposal ID, wallet client, address, or chain.");
      return;
    }
    setIsLoading(true);
    const trace = startFrontendMiradorFlowTrace({
      name: "ProposalAttestation",
      flow: MIRADOR_FLOW.proposalAttestation,
      step: "offchain_proposal_cancel_submit",
      context: {
        walletAddress: address,
        chainId: chain.id,
        proposalId: proposal.id,
      },
      tags: ["governance", "proposal", "frontend", "offchain"],
      attributes: {
        action: "cancel_offchain_proposal",
      },
      startEventName: "proposal_attestation_started",
      startEventDetails: {
        action: "cancel_offchain_proposal",
        proposalId: proposal.id,
      },
    });

    const transport = walletClient.transport;
    const network = { chainId: chain.id, name: chain.name };
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, address);

    try {
      const messagePayload = {
        action: "cancelOffchainProposal",
        proposalId: proposal.id,
        canceller: address,
        timestamp: new Date().toISOString(),
      };
      const authData = await getAuthenticationData(messagePayload);
      if (!authData) {
        throw new Error("Authentication failed");
      }

      const attestationUID = (
        proposal.proposalData as ParsedProposalData["OFFCHAIN_STANDARD"]["kind"]
      ).created_attestation_hash;

      if (!attestationUID) {
        throw new Error("Attestation UID not found");
      }

      const {
        txHash,
        chainId: attestationChainId,
        txInputData,
      } = await cancelProposalAttestation({
        attestationUID,
        signer: signer,
        canceller: address,
      });
      attachMiradorTransactionArtifacts(trace, {
        chainId: attestationChainId ?? chain.id,
        inputData: txInputData,
        txHash,
        txDetails: "Offchain proposal cancellation attestation transaction",
      });
      const traceContext = getFrontendMiradorTraceContext(trace, {
        flow: MIRADOR_FLOW.proposalAttestation,
        step: "offchain_proposal_cancel_record",
        context: {
          walletAddress: address,
          chainId: attestationChainId ?? chain.id,
          proposalId: proposal.id,
        },
      });

      await cancelOffchainProposal({
        proposalId: proposal.id,
        attestationUid: attestationUID,
        auth: {
          jwt: authData.jwt,
        },
        traceContext,
      });

      await closeFrontendMiradorFlowTrace(trace, {
        reason: "proposal_attestation_succeeded",
        eventName: "proposal_attestation_succeeded",
        details: {
          action: "cancel_offchain_proposal",
          proposalId: proposal.id,
          attestationUid: attestationUID,
          txHash,
        },
      });
      toast.success("Offchain proposal cancelled successfully.");
    } catch (e: any) {
      console.error("Error in offchain cancel flow:", e);
      const failedTxContext = extractFailedEasTxContext(e);
      attachMiradorTransactionArtifacts(trace, {
        chainId: failedTxContext.chainId ?? chain?.id,
        inputData: failedTxContext.txInputData,
        txHash: failedTxContext.txHash,
        txDetails: "Offchain proposal cancellation attestation transaction",
      });
      await closeFrontendMiradorFlowTrace(trace, {
        reason: "proposal_attestation_failed",
        eventName: "proposal_attestation_failed",
        details: {
          action: "cancel_offchain_proposal",
          proposalId: proposal.id,
          error: e.shortMessage || e.message || "Unknown error",
        },
      });
      const errorMessage = e.shortMessage || e.message || "Unknown error";
      toast.error(`Error: ${errorMessage}`, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCancel) {
    return null;
  }

  return (
    <>
      <Button
        className="bg-neutral hover:bg-neutral border-line"
        onClick={handleCancel}
        variant="outline"
        disabled={isLoading}
        loading={isLoading}
      >
        {isLoading ? "Cancelling..." : "Cancel Offchain"}
      </Button>
    </>
  );
};
