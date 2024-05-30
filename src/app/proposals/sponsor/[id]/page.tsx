import prisma from "@/app/lib/prisma";
import {
  ProposalChecklist,
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import SponsorForm from "../components/SponsorForm";
import Image from "next/image";
import { icons } from "@/icons/icons";
import SponsorAuthCheck from "../components/SponsorAuthCheck";
import ENSName from "@/components/shared/ENSName";
import { isPostSubmission } from "../../draft/utils/stages";
import ArchivedDraftProposal from "../../draft/components/ArchivedDraftProposal";

const getDraftProposal = async (id: number) => {
  const draftProposal = await prisma.proposalDraft.findUnique({
    where: {
      id: id,
    },
    include: {
      transactions: true,
      social_options: true,
      checklist_items: true,
    },
  });

  return draftProposal as ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
    checklist_items: ProposalChecklist[];
  };
};

const ProposalSponsorPage = async ({ params }: { params: { id: string } }) => {
  const draftProposal = await getDraftProposal(parseInt(params.id));
  const isPostSubmissionStage = isPostSubmission(draftProposal.stage);

  if (isPostSubmissionStage) {
    return <ArchivedDraftProposal draftProposal={draftProposal} />;
  }

  return (
    <SponsorAuthCheck sponsorAddress={draftProposal.sponsor_address!}>
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="grid grid-cols-3 gap-12">
          <div className="col-span-2">
            <SponsorForm draftProposal={draftProposal} />
          </div>
          <div className="self-start">
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
                  <ENSName address={draftProposal.author_address} /> would like
                  your help to submit this proposal
                </p>
              </div>
              <p className="text-[#B16B19]/70 mt-2">
                The proposer has created a draft proposal, but might not meet
                the proposal threshold to submit it themselves. They&apos;d like
                you to help them submit it.
              </p>
              <p className="text-[#B16B19]/70 mt-2">
                If you choose to do so, this proposal will be marked as
                &apos;submitted by{" "}
                <ENSName address={draftProposal.sponsor_address || ""} />,
                authored by <ENSName address={draftProposal.author_address} />
                &apos;
              </p>
            </div>
          </div>
        </div>
      </main>
    </SponsorAuthCheck>
  );
};

export default ProposalSponsorPage;
