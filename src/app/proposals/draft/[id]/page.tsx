import Tenant from "@/lib/tenant/tenant";
import DraftProposalForm from "../components/DraftProposalForm";
import BackButton from "../components/BackButton";
import {
  getStageMetadata,
  isPostSubmission,
  GET_DRAFT_STAGES,
} from "../utils/stages";
import OnlyOwner from "./components/OwnerOnly";
import ArchivedDraftProposal from "../components/ArchivedDraftProposal";
import DeleteDraftButton from "../components/DeleteDraftButton";
import ReactMarkdown from "react-markdown";
import { fetchDraftProposal } from "@/app/api/common/draftProposals/getDraftProposals";

export default async function DraftProposalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");
  const tenantSupportsProposalLifecycle = proposalLifecycleToggle?.enabled;

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  const draftProposal = await fetchDraftProposal(parseInt(params.id));
  const isPostSubmissionStage = isPostSubmission(draftProposal.stage);

  if (isPostSubmissionStage) {
    return <ArchivedDraftProposal draftProposal={draftProposal} />;
  }

  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;
  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = parseInt(stageParam, 10);
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];
  const stageMetadata = getStageMetadata(stageObject.stage);

  return (
    <OnlyOwner ownerAddress={draftProposal.author_address as `0x${string}`}>
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center space-x-6">
            {stageIndex > 0 && (
              <BackButton
                draftProposalId={parseInt(params.id)}
                index={stageIndex}
              />
            )}
            <h1 className="font-black text-primary text-2xl m-0">
              {stageMetadata?.title}
            </h1>
            <span className="bg-agora-stone-100 text-agora-stone-700 rounded-full px-2 py-1 text-sm">
              {/* stageObject.order + 1 is becuase order is zero indexed */}
              Step {stageObject.order + 1}/{DRAFT_STAGES_FOR_TENANT.length}
            </span>
          </div>
          <DeleteDraftButton proposalId={draftProposal.id} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6 mt-6">
          <section className="col-span-1 sm:col-span-2 order-last sm:order-first">
            <DraftProposalForm
              stage={stageObject.stage}
              draftProposal={draftProposal}
            />
          </section>
          <section className="col-span-1">
            <div className="bg-wash border border-line rounded-2xl p-4">
              <p className="mt-2">
                <ReactMarkdown className="prose-h2:text-lg prose-h2:font-bold prose-h2:text-primary prose-p:text-secondary prose-p:mt-2">
                  {proposalLifecycleToggle.config?.copy.helperText}
                </ReactMarkdown>
              </p>
            </div>
          </section>
        </div>
      </main>
    </OnlyOwner>
  );
}
