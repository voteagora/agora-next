"use client";

import { useState } from "react";
import HumanAddress from "@/components/shared/HumanAddress";
import { ProposalDraft } from "@prisma/client";
import Link from "next/link";
import {
  getStageIndexForTenant,
  isPostSubmission,
} from "@/app/proposals/draft/utils/stages";
import { formatFullDate } from "@/lib/utils";
import { PencilIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

const MyDraftProposalCard = ({ proposal }: { proposal: ProposalDraft }) => {
  const openDialog = useOpenDialog();
  const isDrafting = !isPostSubmission(proposal.stage);
  const [open, setOpen] = useState(false);

  return (
    <Link
      href={
        isDrafting
          ? `/proposals/draft/${proposal.id}?stage=${getStageIndexForTenant(proposal.stage)}`
          : `/proposals/sponsor/${proposal.id}`
      }
      className="block cursor-pointer border-b border-line last:border-b-0 hover:bg-tertiary/5 transition-colors"
    >
      <div className="py-4 px-6 flex flex-row gap-4 items-center">
        <div className="w-full sm:w-[60%] flex flex-col justify-between gap-1">
          <div className="flex flex-row gap-1 text-xs text-tertiary">
            <div>
              Created by <HumanAddress address={proposal.author_address} />
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <span className="text-primary">{proposal.title || "Untitled"}</span>
          </div>
        </div>
        <div className="hidden sm:flex flex-row gap-24">
          <div className="w-[180px] flex flex-col justify-between gap-y-1">
            <span className="text-xs text-tertiary">Last updated</span>
            <span className="">{formatFullDate(proposal.updated_at)}</span>
          </div>
          <div className="flex flex-col justify-between gap-y-1">
            <div className="flex flex-row gap-1 text-xs text-tertiary">
              <div>Status</div>
            </div>
            <div className="text-primary">Draft</div>
          </div>
          <div className="flex flex-row gap-2 items-center text-tertiary ">
            <span className="cursor-pointer flex flex-row items-center bg-neutral rounded-full p-2 hover:text-secondary transition-colors">
              <PencilIcon className="w-5 h-5" />
            </span>
            <span className="cursor-pointer flex flex-row items-center bg-neutral rounded-full p-2 hover:text-secondary transition-colors">
              <DropdownMenu.Root open={open} onOpenChange={setOpen}>
                <DropdownMenu.Trigger asChild>
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent bg-neutral rounded-lg border border-line shadow-newDefault w-[250px]"
                    sideOffset={10}
                    alignOffset={0}
                    align="end"
                  >
                    <div
                      className="py-3 px-5 border-b border-line cursor-pointer hover:bg-tertiary/5"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setOpen(false);
                        openDialog({
                          type: "DELETE_DRAFT_PROPOSAL",
                          params: {
                            proposalId: proposal.id,
                          },
                        });
                      }}
                    >
                      Delete
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MyDraftProposalCard;
