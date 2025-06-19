"use client";

import { useState } from "react";
import { DSButton } from "@/components/design-system/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as deleteAction } from "../actions/deleteDraftProposal";
import { TrashIcon } from "@heroicons/react/20/solid";

const DeleteDraftButton = ({ proposalId }: { proposalId: number }) => {
  const openDialog = useOpenDialog();
  return (
    <DSButton
      variant="text"
      size="small"
      className="flex items-end"
      iconBefore={<TrashIcon className="h-5 w-5" />}
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
      <span className="mt-[6px] inline-block align-bottom">
        Delete Proposal
      </span>
    </DSButton>
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
      <h3 className="text-center text-primary font-semibold text-lg mb-1">
        Delete my draft
      </h3>
      <p className="text-center text-secondary">
        Are you sure you want to delete this proposal?
      </p>
      <div className="mt-6 flex items-center justify-between space-x-2">
        <DSButton
          variant="secondary"
          size="small"
          fullWidth
          onClick={() => {
            closeDialog();
          }}
        >
          No
        </DSButton>
        <DSButton
          variant="primary"
          size="small"
          fullWidth
          loading={isPending}
          onClick={async () => {
            setIsPending(true);
            await deleteAction(proposalId);
            window.location.href = "/";
          }}
        >
          Yes
        </DSButton>
      </div>
    </div>
  );
};

export default DeleteDraftButton;
