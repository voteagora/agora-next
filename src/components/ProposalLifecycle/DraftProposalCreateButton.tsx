import { icons } from "@/icons/icons";
import Image from "next/image";

interface DraftProposalCreateButtonProps {
  description: string;
}

const DraftProposalCreateButton: React.FC<DraftProposalCreateButtonProps> = (
  props
) => {
  const { description } = props;

  return (
    <div className="flex flex-col px-6 pt-6 pb-9 border-y border-gray-eb rounded-b-lg">
      <div className="flex flex-row w-full justify-between items-center">
        <p className="text-gray-4f max-w-[400px]">{description}</p>
        <button className="w-[200px] flex flex-row justify-center py-3 font-medium rounded-lg border border-gray-eo shadow-sm">
          <span className="flex flex-row items-center">Create draft</span>
        </button>
      </div>
    </div>
  );
};

export default DraftProposalCreateButton;
