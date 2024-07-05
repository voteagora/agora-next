import Tenant from "@/lib/tenant/tenant";
import DraftProposalForm from "../components/DraftProposalForm";
import DraftProposalChecklist from "../components/DraftProposalChecklist";
import BackButton from "../components/BackButton";
import prisma from "@/app/lib/prisma";
import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
  ProposalChecklist,
} from "@prisma/client";
import {
  getStageMetadata,
  isPostSubmission,
  DRAFT_STAGES_FOR_TENANT,
} from "../utils/stages";
import OnlyOwner from "./components/OwnerOnly";
import ArchivedDraftProposal from "../components/ArchivedDraftProposal";

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

export default async function DraftProposalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { ui } = Tenant.current();
  const tenantSupportsProposalLifecycle = ui.toggle("proposal-lifecycle");

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  const draftProposal = await getDraftProposal(parseInt(params.id));
  const isPostSubmissionStage = isPostSubmission(draftProposal.stage);

  if (isPostSubmissionStage) {
    return <ArchivedDraftProposal draftProposal={draftProposal} />;
  }

  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = parseInt(stageParam, 10);
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];
  const stageMetadata = getStageMetadata(stageObject.stage);

  return (
    <OnlyOwner ownerAddress={draftProposal.author_address as `0x${string}`}>
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="mb-4 flex flex-row items-center space-x-6">
          {stageIndex > 0 && (
            <BackButton
              draftProposalId={parseInt(params.id)}
              index={stageIndex}
            />
          )}
          <h1 className="font-black text-stone-900 text-2xl m-0">
            {stageMetadata?.title}
          </h1>
          <span className="bg-agora-stone-100 text-agora-stone-700 rounded-full px-2 py-1 text-sm">
            {/* stageObject.order + 1 is becuase order is zero indexed */}
            Step {stageObject.order + 1}/{DRAFT_STAGES_FOR_TENANT.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6">
          <section className="col-span-1 sm:col-span-2 order-last sm:order-first">
            <DraftProposalForm
              stage={stageObject.stage}
              draftProposal={draftProposal}
            />
          </section>
          <section className="col-span-1">
            <DraftProposalChecklist
              draftProposal={draftProposal}
              stage={stageObject.stage}
            />
          </section>
        </div>
      </main>
    </OnlyOwner>
  );
}
