"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as deleteAction } from "../actions/deleteDraftProposal";
import { TrashIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { getStoredSiweJwt } from "@/lib/siweSession";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

const DeleteDraftButton = ({ proposalId }: { proposalId: number }) => {
  const openDialog = useOpenDialog();
  return (
    <button
      className="flex flex-row items-center space-x-2 text-secondary"
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "DELETE_DRAFT_PROPOSAL",
          params: {
            proposalId,
          },
        });
      }}
    >
      <TrashIcon className="h-5 w-5" />
      <span className="block">Delete Proposal</span>
    </button>
  );
};

export const DeleteDraftProposalDialog = ({
  proposalId,
  closeDialog,
}: {
  proposalId: number;
  closeDialog: () => void;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { address } = useAccount();
  const { getAuthenticationData } = useProposalActionAuth();
  return (
    <div>
      <h3 className="text-center text-primary font-semibold text-lg mb-1">
        Delete my draft
      </h3>
      <p className="text-center text-secondary">
        Are you sure you want to delete this proposal?
      </p>
      <div className="mt-6 flex items-center justify-between space-x-2">
        <UpdatedButton
          type="secondary"
          fullWidth
          onClick={() => {
            closeDialog();
          }}
        >
          No
        </UpdatedButton>
        <UpdatedButton
          type="primary"
          fullWidth
          isLoading={isPending}
          onClick={async () => {
            setIsPending(true);
            // Require SIWE JWT before prompting for action signature
            if (!getStoredSiweJwt({ expectedAddress: address })) {
              toast("Session expired. Please sign in to continue.");
              setIsPending(false);
              window.location.reload();
              return;
            }
            const messagePayload = {
              action: "deleteDraft",
              draftProposalId: proposalId,
              creatorAddress: address,
              timestamp: new Date().toISOString(),
            };
            const auth = await getAuthenticationData(messagePayload);
            if (!auth || !address) {
              setIsPending(false);
              return;
            }

            await deleteAction(proposalId, {
              address: address as `0x${string}`,
              message: auth.message,
              signature: auth.signature,
              jwt: auth.jwt,
            });
            window.location.href = "/";
          }}
        >
          Yes
        </UpdatedButton>
      </div>
    </div>
  );
};

export default DeleteDraftButton;
