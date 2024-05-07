import {
  ProposalLifecycleStageMetadata,
  ProposalLifecycleStage,
} from "../types";

const CompletedStepIcon = () => {
  return <span className="h-4 w-4 rounded-full bg-black block" />;
};

const CurrentStepIcon = () => {
  return <span className="h-4 w-4 rounded-full bg-black block" />;
};

const IncompleteStepIcon = () => {
  return <span className="h-4 w-4 rounded-full bg-black block" />;
};
export default function DraftProposalChecklist({
  stage,
}: {
  stage: ProposalLifecycleStage;
}) {
  return (
    <div className="bg-agora-stone-50 border border-agora-stone-100 rounded-2xl p-4">
      <h2 className="font-black text-agora-stone-900 text-2xl m-0">
        Proposal checklist
      </h2>
      <div className="space-y-4 mt-4 relative">
        <span className="h-full w-1 border-r border-agora-stone-100 absolute top-2 right-2 z-0"></span>
        {Object.keys(ProposalLifecycleStageMetadata).map((item, index) => {
          const metadata =
            ProposalLifecycleStageMetadata[
              item as keyof typeof ProposalLifecycleStageMetadata
            ];
          return (
            <div key={index} className="relative z-10">
              <div className="flex flex-row justify-between items-center w-full">
                <h3>{metadata.title}</h3>
                <span className="h-4 w-4 rounded-full bg-black block" />
              </div>
              <div className="">
                <p className="text-xs text-agora-stone-700">
                  {metadata.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
