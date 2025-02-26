"use client";

import { useState } from "react";
import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as deleteAction } from "../actions/deleteDraftProposal";
import { TrashIcon } from "@heroicons/react/24/outline";
import X from "@/assets/icons/x.svg";
import Image from "next/image";

const DeleteDraftButton = ({ proposalId }: { proposalId: number }) => {
  const openDialog = useOpenDialog();
  return (
    <div
      className="border border-line rounded p-1 h-[42px] aspect-square flex items-center justify-center bg-tertiary/5 hover:bg-tertiary/10 transition-colors cursor-pointer"
      onClick={() => {
        openDialog({
          type: "DELETE_DRAFT_PROPOSAL",
          params: {
            proposalId,
          },
        });
      }}
    >
      <TrashIcon className="h-4 w-4 text-secondary" />
    </div>
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
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2 bg-tertiary/5 rounded-lg relative overflow-y-hidden py-4 mt-2">
        <div className="absolute w-full h-full bg-[url('/images/grid.svg')]"></div>
        <div className="mt-2 relative block h-[85px] w-[85px] mx-auto">
          <Image
            src={X}
            alt="X"
            width={85}
            height={85}
            className={`${isHovering ? "duration-500 scale-105" : "duration-300 scale-100"} transition-all`}
          />
        </div>
      </div>
      <h3 className="text-primary text-xl font-bold mt-4">
        Are you sure you want to delete your proposal?
      </h3>
      <div className="flex flex-col items-center gap-2 mt-4">
        <UpdatedButton
          type="secondary"
          fullWidth
          onClick={() => {
            closeDialog();
          }}
        >
          Cancel
        </UpdatedButton>
        <UpdatedButton
          type="primary"
          fullWidth
          isLoading={isPending}
          onClick={async () => {
            setIsPending(true);
            await deleteAction(proposalId);
            window.location.href = "/";
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Delete forever
        </UpdatedButton>
      </div>
    </div>
  );
};

export default DeleteDraftButton;
