"use client";

import { useState } from "react";
import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as deleteAction } from "../actions/deleteDraftProposal";
import { TrashIcon } from "@heroicons/react/20/solid";

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
  return (
    <div>
      <h3 className="text-center font-semibold">Delete my draft</h3>
      <p className="text-center text-agora-stone-700">
        Are you sure you want to delete this proposal?
      </p>
      <div className="mt-6 flex items-center justify-end space-x-2">
        <UpdatedButton
          type="secondary"
          onClick={() => {
            closeDialog();
          }}
        >
          No
        </UpdatedButton>
        <UpdatedButton
          type="primary"
          isLoading={isPending}
          onClick={async () => {
            setIsPending(true);
            await deleteAction(proposalId);
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
