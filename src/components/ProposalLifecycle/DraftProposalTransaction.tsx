import { icons } from "@/icons/icons";
import Image from "next/image";

interface DraftProposalTransactionProps {
  label: string;
  description: string;
}

const DraftProposalTransaction: React.FC<DraftProposalTransactionProps> = (
  props
) => {
  const { label, description } = props;

  return (
    <div className="flex flex-col px-6 py-4 border-y border-gray-eb">
      <label className="font-medium mb-2">{label}</label>
      <p className="text-xs max-w-[620px] text-gray-4f mb-6">{description}</p>
      <div className="flex flex-row w-full gap-x-5">
        <button className="w-full flex flex-row justify-center py-3 font-medium rounded-lg border border-gray-eo shadow-sm">
          <span className="flex flex-row items-center">
            <Image
              src={icons.uploadTransaction}
              alt="Upload icon"
              width={16}
              height={16}
              className="mr-2"
            />
            Upload payload
          </span>
        </button>
        <button className="w-full flex flex-row justify-center py-3 font-medium rounded-lg border border-gray-eo shadow-sm">
          <span className="flex flex-row items-center">
            <Image
              src={icons.createTransaction}
              alt="Upload icon"
              width={16}
              height={16}
              className="mr-2"
            />
            Create transactions
          </span>
        </button>
      </div>
    </div>
  );
};

export default DraftProposalTransaction;
