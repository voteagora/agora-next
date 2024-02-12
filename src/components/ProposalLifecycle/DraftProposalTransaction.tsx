import { icons } from "@/icons/icons";
import Image from "next/image";

import { SetStateAction, useState } from "react";

interface DraftProposalTransactionProps {
  label: string;
  description: string;
}

const DraftProposalTransaction: React.FC<DraftProposalTransactionProps> = (
  props
) => {
  const { label, description } = props;

  const [transactionMode, setTransactionMode] = useState<
    "init" | "upload" | "create"
  >("init");

  return (
    <div className="flex flex-col px-6 py-4 border-y border-gray-eb">
      <label className="font-medium mb-2">{label}</label>
      <p className="text-xs max-w-[620px] text-gray-4f mb-6">{description}</p>
      {transactionMode === "init" && (
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
          <button
            className="w-full flex flex-row justify-center py-3 font-medium rounded-lg border border-gray-eo shadow-sm"
            onClick={() => setTransactionMode("create")}
          >
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
      )}
      {transactionMode === "create" && (
        <div className="flex flex-col w-full gap-y-4">
          <div className="flex flex-row gap-x-10">
            <DraftProposalTransactionInput
              label="Target"
              placeholder="0x4F2083f5fBede34C2714aFfb3105"
              value=""
              updateFunction={() => {}}
            />
            <DraftProposalTransactionInput
              label="Value"
              placeholder="0x4F2083f5fBede34C2714aFfb3105"
              value=""
              updateFunction={() => {}}
            />
          </div>
          <div className="flex flex-row gap-x-10">
            <DraftProposalTransactionInput
              label="Calldata"
              placeholder="0x4F2083f5fBede34C2714aFfb3105"
              value=""
              updateFunction={() => {}}
            />
            <DraftProposalTransactionInput
              label="Function details"
              placeholder="0x4F2083f5fBede34C2714aFfb3105"
              value=""
              updateFunction={() => {}}
            />
          </div>
          <DraftProposalTransactionInput
            label="Contract ABI"
            placeholder="ABI"
            value=""
            updateFunction={() => {}}
          />
          <DraftProposalTransactionInput
            label="Transaction description"
            placeholder="Permits depositing ETH on Compound v3"
            value=""
            updateFunction={() => {}}
          />
          <DraftProposalTransactionValidity
            label="Transaction validity"
            placeholder="Permits depositing ETH on Compound v3"
            value=""
            updateFunction={() => {}}
          />
          <DraftProposalAddAnotherTransaction />
          <DraftProposalTransactionAuditPayload />
        </div>
      )}
    </div>
  );
};

export default DraftProposalTransaction;

interface DraftProposalTransactionInputProps {
  label: string;
  placeholder: string;
  value: string;
  updateFunction: React.Dispatch<React.SetStateAction<string>>;
}

const DraftProposalTransactionInput: React.FC<
  DraftProposalTransactionInputProps
> = (props) => {
  const { label, placeholder, value, updateFunction } = props;

  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-sm mb-1">{label}</label>
      <input
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={(e) => updateFunction(e.target.value)}
      ></input>
    </div>
  );
};

interface DraftProposalTransactionValidityProps {
  label: string;
  placeholder: string;
  value: string;
  updateFunction: React.Dispatch<React.SetStateAction<string>>;
}

const DraftProposalTransactionValidity: React.FC<
  DraftProposalTransactionValidityProps
> = (props) => {
  const { label, placeholder, value, updateFunction } = props;

  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-sm mb-1">{label}</label>
      <div className="flex flex-row gap-x-6">
        <div className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent">
          <p>Unconfirmed</p>
        </div>
        <button
          className="py-3 px-5 font-semibold border border-gray-eo placeholder-gray-af bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
          onClick={() => alert("Simulating transaction")}
        >
          Simulate
        </button>
      </div>
    </div>
  );
};

const DraftProposalAddAnotherTransaction = () => {
  return (
    <div className="flex flex-col px-6 py-4 w-full border border-gray-eo rounded-lg">
      <label className="font-medium mb-4">{"Add another transaction"}</label>
      <div className="flex flex-row gap-x-5">
        <button
          className="py-3 w-full border border-gray-eo rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
          onClick={() => alert("Transfer from the treasury")}
        >
          Transfer from the treasury
        </button>
        <button
          className="py-3 w-full border border-gray-eo rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
          onClick={() => alert("Custom transaction")}
        >
          Custom transaction
        </button>
      </div>
    </div>
  );
};

const DraftProposalTransactionAuditPayload = () => {
  return (
    <div className="flex flex-col w-full">
      <label className="font-medium mb-2">{"Payload audit"}</label>
      <p className="text-stone-700 mb-2 max-w-[600px]">
        Use this field to upload an optional audit report for your transaction
        payload. This can help voters verify that your proposal does what it
        intends to.
      </p>
      <button
        className="flex items-center justify-center w-full border border-dashed rounded-lg bg-stone-50 border-stone-200 h-20"
        onClick={() => alert("Upload audit")}
      >
        <div className="flex flex-row">
          <Image
            src={icons.uploadTransaction}
            alt="Upload icon"
            width={16}
            height={16}
            className="mr-2 text-stone-500"
          />
          <p className="text-stone-500 font-medium">Upload</p>
        </div>
      </button>
    </div>
  );
};
