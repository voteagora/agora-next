"use client";

import { useState } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useReadContract, useSendTransaction } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { DraftProposal } from "../../draft/types";

const ApprovalProposalAction = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const openDialog = useOpenDialog();
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(draftProposal);
  const [proposalCreated, setProposalCreated] = useState(false);

  const {
    data: calldata,
    isError: isDescriptionError,
    error: descriptionError,
  } = useReadContract({
    address: contracts.votingModule?.address as `0x${string}`,
    abi: contracts.votingModule?.abi,
    functionName: "generateProposeCalldata",
    args: inputData as any,
    chainId: contracts.votingModule?.chain.id,
    query: {
      enabled:
        !!contracts.votingModule?.address &&
        !proposalCreated &&
        !!inputData &&
        inputData.length > 0,
    },
  });

  const { sendTransactionAsync, isPending: isWriteLoadingSend } =
    useSendTransaction();

  return (
    <>
      <UpdatedButton
        isLoading={isWriteLoadingSend}
        fullWidth={true}
        type={isDescriptionError ? "disabled" : "primary"}
        onClick={async () => {
          try {
            const data = await sendTransactionAsync({
              to: contracts.governor.address as `0x${string}`,
              data: calldata as `0x${string}`,
            });

            setProposalCreated(true);

            trackEvent({
              event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL,
              event_data: {
                transaction_hash: data,
                uses_plm: true,
                proposal_data: inputData,
              },
            });

            await sponsorDraftProposal({
              draftProposalId: draftProposal.id,
              onchain_transaction_hash: data,
            });

            openDialog({
              type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
              params: {
                redirectUrl: "/",
                txHash: data,
              },
            });
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Submit proposal
      </UpdatedButton>
      {descriptionError && (
        <div className="p-4 border border-line bg-wash rounded mt-4 text-sm text-tertiary break-words hyphens-auto">
          {descriptionError?.message}
        </div>
      )}
    </>
  );
};

export default ApprovalProposalAction;
