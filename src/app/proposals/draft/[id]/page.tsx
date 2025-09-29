export const dynamic = "force-dynamic";

import Tenant from "@/lib/tenant/tenant";
import DraftProposalForm from "../components/DraftProposalForm";
import BackButton from "../components/BackButton";
import {
  GET_DRAFT_STAGES,
  getStageMetadata,
  isPostSubmission,
} from "../utils/stages";
import OnlyOwner from "./components/OwnerOnly";
import ArchivedDraftProposal from "../components/ArchivedDraftProposal";
import DeleteDraftButton from "../components/DeleteDraftButton";
import ReactMarkdown from "react-markdown";
import { getDraftProposalByUuid } from "@/app/api/common/draftProposals/getDraftProposals";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { PLMConfig } from "@/app/proposals/draft/types";

export const maxDuration = 120;

const DraftNotFoundError = ({ message }: { message: string }) => (
  <div className="max-w-screen-xl mx-auto mt-10 text-center">
    <h1 className="text-2xl font-bold text-primary mb-4">Draft Not Found</h1>
    <p className="text-secondary mb-6">{message}</p>
    <a
      href="/proposals"
      className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
    >
      Back to Proposals
    </a>
  </div>
);

export default async function DraftProposalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");
  const config = proposalLifecycleToggle?.config as PLMConfig;
  const tenantSupportsProposalLifecycle = proposalLifecycleToggle?.enabled;

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  const draftProposal = await getDraftProposalByUuid(params.id);

  if (!draftProposal) {
    return (
      <DraftNotFoundError message="The draft you're looking for doesn't exist. If you think this is an error, please contact jeff@voteagora.com." />
    );
  }

  const proposalTypes = await fetchProposalTypes();

  const isPostSubmissionStage = isPostSubmission(draftProposal.stage);

  if (isPostSubmissionStage) {
    return <ArchivedDraftProposal draftProposal={draftProposal} />;
  }

  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;
  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = parseInt(stageParam, 10);
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];
  const stageMetadata = getStageMetadata(stageObject.stage);

  const ownerAddresses = [
    draftProposal.author_address,
    ...(config.offchainProposalCreator || []),
  ].filter(Boolean) as string[];

  return (
    <OnlyOwner ownerAddresses={ownerAddresses}>
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center space-x-6">
            {stageIndex > 0 && (
              <BackButton
                draftProposalId={
                  draftProposal.uuid ?? draftProposal.id.toString()
                }
                index={stageIndex}
              />
            )}
            <h1 className="font-black text-primary text-2xl m-0">
              {stageMetadata?.title}
            </h1>
            <span className="bg-tertiary/5 text-primary rounded-full px-2 py-1 text-sm">
              {/* stageObject.order + 1 is becuase order is zero indexed */}
              Step {stageObject.order + 1}/{DRAFT_STAGES_FOR_TENANT.length}
            </span>
          </div>
          <DeleteDraftButton proposalId={draftProposal.id} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6 mt-6">
          <section className="col-span-1 sm:col-span-2 order-last sm:order-first">
            <DraftProposalForm
              proposalTypes={proposalTypes}
              stage={stageObject.stage}
              draftProposal={draftProposal}
            />
          </section>
          <section className="col-span-1">
            <div className="bg-wash border border-line rounded-2xl p-4">
              <div className="mt-2">
                <ReactMarkdown
                  className="prose-h2:text-lg
                    prose-h2:font-bold
                    prose-h2:text-primary
                    prose-p:text-secondary
                    prose-p:mt-2
                    prose-li:list-inside
                    prose-li:list-decimal
                    prose-li:my-2
                    prose-a:text-primary
                    prose-a:underline
                    prose-li:text-secondary"
                >
                  {
                    (proposalLifecycleToggle.config as PLMConfig)?.copy
                      .helperText
                  }
                </ReactMarkdown>
              </div>
            </div>
          </section>
        </div>
      </main>
    </OnlyOwner>
  );
}
