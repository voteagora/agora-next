import { ProposalDraft } from "@prisma/client";
import { ProposalLifecycleStageMetadata } from "@/app/proposals/draft/types";
import { getStageMetadata } from "@/app/proposals/draft/utils/stages";
import Tenant from "@/lib/tenant/tenant";

const DraftProposalCard = ({ proposal }: { proposal: ProposalDraft }) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  const ALL_STAGES_FOR_TENANT = plmToggle.config?.stages || [];
  const currentStageObject = plmToggle.config?.stages.find(
    (stage) => stage.stage === proposal.stage
  )!;

  const currentStageMetadata = getStageMetadata(proposal.stage);

  return (
    <div className="bg-wash border border-line rounded-2xl p-2 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between bg-neutral border border-line rounded-2xl px-6 py-5 shadow-sm">
        <div>
          <p className="font-semibold text-secondary text-xs">{`By ${proposal.author_address}`}</p>
          <p className="font-medium">{proposal.title || "[Title pending]"}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-x-16 space-y-4 sm:space-y-0 mt-4 sm:mt-0">
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Status`}</p>
            <p className="font-medium">{currentStageMetadata.shortTitle}</p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Type`}</p>
            <p className="font-medium">
              {proposal.proposal_type || "[Type pending]"}
            </p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Waiting for`}</p>
            <p className="font-medium">{currentStageMetadata.waitingFor}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between px-6 pt-2">
        {ALL_STAGES_FOR_TENANT.map((stageObject, idx) => {
          const stageMetadata =
            ProposalLifecycleStageMetadata[
              stageObject.stage as keyof typeof ProposalLifecycleStageMetadata
            ];

          return (
            <div key={`stage-${idx}`} className="w-full">
              <div className="flex flex-row items-center my-2">
                <div
                  className={`h-1 w-1 rounded-full bg-stone-300 ${
                    currentStageObject.order >= stageObject.order
                      ? "bg-stone-700"
                      : "bg-stone-300"
                  }`}
                ></div>
                <div
                  className={`w-full h-px bg-stone-300 ${
                    currentStageObject.order >= stageObject.order
                      ? "bg-stone-700"
                      : "bg-stone-300"
                  }`}
                ></div>
              </div>
              <p className="text-xs font-medium text-gray-800">
                {stageMetadata.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DraftProposalCard;
