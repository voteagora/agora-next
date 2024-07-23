import {
  getStageMetadata,
  DRAFT_STAGES_FOR_TENANT,
  POST_DRAFT_STAGES_FOR_TENANT,
} from "../utils/stages";
import DeleteDraftButton from "./DeleteDraftButton";
import { ProposalStage, ProposalDraft } from "@prisma/client";

const CompletedStepIcon = () => {
  return (
    <span className="h-3 w-3 rounded-full bg-black block ring-1 ring-agora-stone-500 ring-offset-4" />
  );
};

const CurrentStepIcon = () => {
  return (
    <span className="h-3 w-3 rounded-full block bg-agora-stone-100 ring-1 ring-agora-stone-500 ring-offset-4" />
  );
};

const IncompleteStepIcon = () => {
  return (
    <span className="h-3 w-3 rounded-full block bg-white ring-1 ring-agora-stone-500 ring-offset-4" />
  );
};
export default function DraftProposalChecklist({
  stage,
  draftProposal,
}: {
  stage: ProposalStage;
  draftProposal: ProposalDraft;
}) {
  const currentStageObject = DRAFT_STAGES_FOR_TENANT.find(
    (stageObject) => stageObject.stage === stage
  )!;

  return (
    <div className="bg-agora-stone-50 border border-agora-stone-100 rounded-2xl">
      <div className="pt-4 px-4">
        <h2 className="font-black text-agora-stone-900 text-2xl m-0">
          Proposal checklist
        </h2>
        <p className="text-xs font-mono text-agora-stone-700 mt-4">
          Creating your proposal
        </p>
        <div className="space-y-4 mt-2 relative border-b border-dotted border-agora-stone-500 pb-4">
          <span className="h-[calc(100%-26px)] w-1 border-r border-agora-stone-100 absolute top-2 right-[6px] z-0"></span>
          {DRAFT_STAGES_FOR_TENANT.map((stageObject, index) => {
            const metadata = getStageMetadata(stageObject.stage);
            return (
              <div key={index} className="relative z-10">
                <div className="flex flex-row justify-between items-center w-full">
                  <h3 className="text-primary font-semibold">
                    {metadata.title}
                  </h3>
                  {currentStageObject.order > stageObject.order ? (
                    <CompletedStepIcon />
                  ) : currentStageObject.order === stageObject.order ? (
                    <CurrentStepIcon />
                  ) : (
                    <IncompleteStepIcon />
                  )}
                </div>

                {currentStageObject.order === stageObject.order && (
                  <p className="text-xs text-agora-stone-700 mt-2">
                    {metadata.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-mono text-agora-stone-700">
          After proposal is created
        </p>
        <div className="space-y-4 mt-4 relative">
          <span className="h-[calc(100%-26px)] w-1 border-r border-agora-stone-100 absolute top-2 right-[6px] z-0"></span>
          {POST_DRAFT_STAGES_FOR_TENANT.map((stageObject, index) => {
            const metadata = getStageMetadata(stageObject.stage);
            return (
              <div key={index} className="relative z-10">
                <div className="flex flex-row justify-between items-center w-full">
                  <h3 className="text-primary font-semibold">
                    {metadata.title}
                  </h3>

                  <IncompleteStepIcon />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-agora-stone-100">
        <DeleteDraftButton proposalId={draftProposal.id} />
      </div>
    </div>
  );
}
