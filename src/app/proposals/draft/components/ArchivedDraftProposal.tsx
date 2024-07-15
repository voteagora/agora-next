import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
  ProposalChecklist,
} from "@prisma/client";
import DraftPreview from "./DraftPreview";
import Image from "next/image";
import { icons } from "@/icons/icons";

const ArchivedDraftProposal = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
    checklist_items: ProposalChecklist[];
  };
}) => {
  return (
    <main className="max-w-screen-xl mx-auto mt-10">
      <div className="grid grid-cols-3 gap-12">
        <div className="col-span-2">
          <DraftPreview
            proposalDraft={draftProposal}
            actions={null}
            isArchived={true}
          />
        </div>
        <div className="self-start">
          {/* yellow color for draft proposal -- not themeable right now */}
          <div className="border bg-[#FAFAF2] border-[#ECE3CA] text-[#B16B19] p-6 rounded-lg">
            <div className="flex flex-row items-center space-x-4">
              <Image
                className="border bg-[#FAFAF2] border-[#ECE3CA] rounded-md p-2 shadow-newDefault"
                src={icons.sponsor}
                alt="Sponsor"
                width={42}
                height={42}
              />
              <p className="font-semibold">
                This draft proposal has been archived
              </p>
            </div>
            {/* yellow color for draft proposal -- not themeable right now */}
            <p className="text-[#B16B19]/70 mt-2">
              This draft has already been submitted and is no longer editable.
              You can still view the details of this proposal.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ArchivedDraftProposal;
