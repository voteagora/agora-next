import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";
import { icons } from "@/icons/icons";
import Image from "next/image";
import { useContext } from "react";

interface DraftProposalCreateButtonProps {
  description: string;
  checkmarkInfo: string;
  setStage: React.Dispatch<
    React.SetStateAction<"draft-temp-check" | "draft-create" | "draft-submit">
  >;
}

const DraftProposalCreateButton: React.FC<DraftProposalCreateButtonProps> = (
  props
) => {
  const { description, checkmarkInfo } = props;

  const { state } = useContext(ProposalLifecycleDraftContext);

  return (
    <div className="bg-gray-fa rounded-b-2xl">
      <div className="flex flex-col px-6 pt-6 pb-9 bg-white border-gray-eb rounded-b-lg shadow">
        <div className="flex flex-row w-full justify-between items-center">
          <p className="text-gray-4f max-w-[400px]">{description}</p>
          <button
            className={`w-[200px] py-3 px-6 border font-medium border-black bg-black text-white rounded-lg disabled:opacity-75 disabled:cursor-not-allowed`}
            onClick={() => props.setStage("draft-submit")}
            disabled={!state.title || !state.description || !state.abstract}
          >
            <span className="text-center">Create draft</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 p-6">
        <p className="font-medium text-gray-af text-xs">{checkmarkInfo}</p>
        <div className="flex flex-row w-full items-center">
          <p className="text-gray-4f pr-5">Update ENS docs</p>
          <div className="border-b border-dashed flex-grow border-gray-eo mr-5"></div>
          <input type="checkbox" className="w-4 h-4 border-2 border-gray-eo" />
        </div>
        <div className="flex flex-row w-full items-center">
          <p className="text-gray-4f pr-5">Update ENS docs</p>
          <div className="border-b border-dashed flex-grow border-gray-eo mr-5"></div>
          <input type="checkbox" className="w-4 h-4 border-2 border-gray-eo" />
        </div>
      </div>
    </div>
  );
};

export default DraftProposalCreateButton;
