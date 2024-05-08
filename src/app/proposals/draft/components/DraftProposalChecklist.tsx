import {
  ProposalLifecycleStageMetadata,
  ProposalLifecycleStage,
} from "../types";

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
}: {
  stage: ProposalLifecycleStage;
}) {
  const stageMetadata =
    ProposalLifecycleStageMetadata[
      stage as keyof typeof ProposalLifecycleStageMetadata
    ];

  return (
    <div className="bg-agora-stone-50 border border-agora-stone-100 rounded-2xl p-4">
      <h2 className="font-black text-agora-stone-900 text-2xl m-0">
        Proposal checklist
      </h2>
      <div className="space-y-4 mt-4 relative border-b border-dotted border-agora-stone-500 pb-4">
        <span className="h-[calc(100%-26px)] w-1 border-r border-agora-stone-100 absolute top-2 right-[6px] z-0"></span>
        {Object.keys(ProposalLifecycleStageMetadata).map((item, index) => {
          const metadata =
            ProposalLifecycleStageMetadata[
              item as keyof typeof ProposalLifecycleStageMetadata
            ];
          return (
            <div key={index} className="relative z-10">
              <div className="flex flex-row justify-between items-center w-full">
                <h3 className="text-stone-900 font-semibold">
                  {metadata.title}
                </h3>
                {stageMetadata.order > metadata.order ? (
                  <CompletedStepIcon />
                ) : stageMetadata.order === metadata.order ? (
                  <CurrentStepIcon />
                ) : (
                  <IncompleteStepIcon />
                )}
              </div>

              {stageMetadata.order === metadata.order && (
                <p className="text-xs text-agora-stone-700 mt-2">
                  {metadata.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-4 mt-4 relative">
        <span className="h-[calc(100%-26px)] w-1 border-r border-agora-stone-100 absolute top-2 right-[6px] z-0"></span>
        <div className="flex flex-row justify-between items-center w-full z-10 relative">
          <h3 className="text-stone-900 font-semibold">Contact voters</h3>
          <IncompleteStepIcon />
        </div>
        <div className="flex flex-row justify-between items-center w-full z-10 relative">
          <h3 className="text-stone-900 font-semibold">Queue proposal</h3>
          <IncompleteStepIcon />
        </div>
        <div className="flex flex-row justify-between items-center w-full z-10 relative">
          <h3 className="text-stone-900 font-semibold">Execute proposal</h3>
          <IncompleteStepIcon />
        </div>
      </div>
    </div>
  );
}
