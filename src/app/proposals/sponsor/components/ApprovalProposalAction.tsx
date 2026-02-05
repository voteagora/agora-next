"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useSimulateContract, useWriteContract } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";

import { ApprovalProposal, ProposalScope } from "@/app/proposals/draft/types";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { parseError } from "../../draft/utils/stages";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

const ApprovalProposalAction = ({
  draftProposal,
}: {
  draftProposal: ApprovalProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);
  const [proposalCreated, setProposalCreated] = useState(false);
  const { address } = useAccount();
  const { getAuthenticationData } = useProposalActionAuth();

  const {
    data: config,
    isError: onPrepareError,
    error,
  } = useSimulateContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "proposeWithModule",
    args: inputData as any,
    query: {
      enabled: !proposalCreated,
    },
  });

  console.log(error);
  const { writeContractAsync: writeAsync, isPending: isWriteLoading } =
    useWriteContract();

  return (
    <>
      <UpdatedButton
        isLoading={isWriteLoading}
        fullWidth={true}
        type={onPrepareError ? "disabled" : "primary"}
        onClick={async () => {
          try {
            const data = await writeAsync?.(config!.request);
            if (!data) {
              // for dev
              console.log(error);
              return;
            }
            setProposalCreated(true);

            trackEvent({
              event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL,
              event_data: {
                transaction_hash: data,
                uses_plm: true,
                proposal_data: inputData,
              },
            });

            const messagePayload = {
              action: "sponsorDraft",
              draftProposalId: draftProposal.id,
              creatorAddress: address,
              timestamp: new Date().toISOString(),
            };
            const auth = await getAuthenticationData(messagePayload);
            if (!auth) return;

            await sponsorDraftProposal({
              draftProposalId: draftProposal.id,
              onchain_transaction_hash: data,
              is_offchain_submission: false,
              proposal_scope: draftProposal.proposal_scope,
              creatorAddress: address as `0x${string}`,
              message: auth.message,
              signature: auth.signature,
              jwt: auth.jwt,
            });

            openDialog({
              type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
              params: {
                redirectUrl: "/",
                txHash: data,
                isHybrid: draftProposal.proposal_scope === ProposalScope.HYBRID,
                draftProposal,
              },
            });
          } catch (error) {}
        }}
      >
        Submit proposal
      </UpdatedButton>
      {onPrepareError && (
        <div className="p-4 border border-negative bg-negative/10 rounded mt-4 text-sm text-negative break-words hyphens-auto">
          {parseError(error)}
        </div>
      )}
    </>
  );
};

export default ApprovalProposalAction;
