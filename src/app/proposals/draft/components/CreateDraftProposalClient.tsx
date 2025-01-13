"use client";

import Tenant from "@/lib/tenant/tenant";
import DraftProposalForm from "../components/DraftProposalForm";
import BackButton from "../components/BackButton";
import { GET_DRAFT_STAGES, getStageMetadata } from "../utils/stages";
import DeleteDraftButton from "../components/DeleteDraftButton";
import ReactMarkdown from "react-markdown";
import { PLMConfig } from "@/app/proposals/draft/types";
import { DraftProposal } from "../types";
import { useForm, FormProvider } from "react-hook-form";

const CreateDraftProposalClient = ({
  draftProposal,
  proposalTypes,
  params,
  searchParams,
}: {
  draftProposal: DraftProposal;
  proposalTypes: any[];
  params: any;
  searchParams: any;
}) => {
  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");

  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;
  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = parseInt(stageParam, 10);
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];
  const stageMetadata = getStageMetadata(stageObject.stage);

  return (
    <form>
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
              proposalTypes={proposalTypes}
              stage={stageObject.stage}
              draftProposal={draftProposal}
            />
          </section>
          <section className="col-span-1">
            <div className="bg-wash border border-line rounded-2xl p-4">
              <p className="mt-2">
                <ReactMarkdown className="prose-h2:text-lg prose-h2:font-bold prose-h2:text-primary prose-p:text-secondary prose-p:mt-2 prose-li:list-inside prose-li:list-disc prose-li:my-2">
                  {
                    (proposalLifecycleToggle?.config as PLMConfig)?.copy
                      .helperText
                  }
                </ReactMarkdown>
              </p>
            </div>
          </section>
        </div>
      </main>
    </form>
  );
};

export default CreateDraftProposalClient;
