import Tenant from "@/lib/tenant/tenant";
import DraftProposalForm from "../components/DraftProposalForm";
import DraftProposalChecklist from "../components/DraftProposalChecklist";
import BackButton from "../components/BackButton";
import prisma from "@/app/lib/prisma";
import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import { getStageMetadata, DRAFT_STAGES_FOR_TENANT } from "../utils/stages";

const getDraftProposal = async (id: number) => {
  const draftProposal = await prisma.proposalDraft.findUnique({
    where: {
      id: id,
    },
    include: {
      transactions: true,
      social_options: true,
    },
  });

  return draftProposal as ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
};

export default async function DraftProposalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const draftProposal = await getDraftProposal(parseInt(params.id));

  const {
    ui: { _toggles },
  } = Tenant.current();
  const tenantSupportsProposalLifecycle = _toggles?.some(
    (toggle: { name: string; enabled: boolean }) =>
      toggle.name === "proposal-lifecycle" && toggle.enabled
  );

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = parseInt(stageParam, 10);
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];
  const stageMetadata = getStageMetadata(stageObject.stage);

  return (
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
      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2">
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
  );
}
