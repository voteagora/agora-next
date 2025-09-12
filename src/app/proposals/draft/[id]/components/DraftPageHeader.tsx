"use client";

import BackButton from "../../components/BackButton";

export function DraftPageHeader({
  stageIndex,
  stageTitle,
  totalStages,
  draftIdForBack,
}: {
  stageIndex: number;
  stageTitle: string;
  totalStages: number;
  draftIdForBack: string;
}) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center space-x-6">
        {stageIndex > 0 && (
          <BackButton draftProposalId={draftIdForBack} index={stageIndex} />
        )}
        <h1 className="font-black text-primary text-2xl m-0">{stageTitle}</h1>
        <span className="bg-tertiary/5 text-primary rounded-full px-2 py-1 text-sm">
          Step {stageIndex + 1}/{totalStages}
        </span>
      </div>
    </div>
  );
}
