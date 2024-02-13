import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";
import { icons } from "@/icons/icons";
import Image from "next/image";

import { useContext, useState } from "react";

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

  const { proposalState, addTransaction, updateTransaction } = useContext(
    ProposalLifecycleDraftContext
  );

  const handleCreateTransaction = () => {
    addTransaction();
    setTransactionMode("create");
  };

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
            onClick={() => handleCreateTransaction()}
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
              value={proposalState.transactions[0].target}
              field="target"
              order={0}
            />
            <DraftProposalTransactionInput
              label="Value"
              placeholder="0x4F2083f5fBede34C2714aFfb3105"
              value={proposalState.transactions[0].value}
              field="value"
              order={0}
            />
          </div>
          <div className="flex flex-row gap-x-10">
            <DraftProposalTransactionInput
              label="Calldata"
              placeholder="0x4F2083f5fBede34C2714aFfb3105"
              value={proposalState.transactions[0].calldata}
              field="calldata"
              order={0}
            />
            <DraftProposalTransactionInput
              label="Function details"
              placeholder="0x4F2083f5fBede34C2714aFfb3105"
              value={proposalState.transactions[0].functionDetails}
              field="functionDetails"
              order={0}
            />
          </div>
          <DraftProposalTransactionInput
            label="Contract ABI"
            placeholder="ABI"
            value={proposalState.transactions[0].contractABI}
            field="contractABI"
            order={0}
          />
          <DraftProposalTransactionInput
            label="Transaction description"
            placeholder="Permits depositing ETH on Compound v3"
            value={proposalState.transactions[0].description}
            field="description"
            order={0}
          />
          <DraftProposalTransactionValidity
            label="Transaction validity"
            placeholder="Permits depositing ETH on Compound v3"
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
  field:
    | "target"
    | "value"
    | "calldata"
    | "functionDetails"
    | "contractABI"
    | "description";
  order: number;
}

const DraftProposalTransactionInput: React.FC<
  DraftProposalTransactionInputProps
> = (props) => {
  const { label, placeholder, value, field, order } = props;

  const { updateTransaction } = useContext(ProposalLifecycleDraftContext);

  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-sm mb-1">{label}</label>
      <input
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={(e) => updateTransaction(order, field, e.target.value)}
      ></input>
    </div>
  );
};

interface DraftProposalTransactionValidityProps {
  label: string;
  placeholder: string;
}

const DraftProposalTransactionValidity: React.FC<
  DraftProposalTransactionValidityProps
> = (props) => {
  const { label, placeholder } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"Unconfirmed" | "Valid" | "Invalid">(
    "Unconfirmed"
  );

  const { proposalState } = useContext(ProposalLifecycleDraftContext);

  async function simulate() {
    // call tha backend /simulate endpoint
    setIsLoading(true);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: proposalState.transactions[0].target,
          value: proposalState.transactions[0].value,
          calldata: proposalState.transactions[0].calldata,
          networkId: "1",
          from: "0xF417ACe7b13c0ef4fcb5548390a450A4B75D3eB3", // todo
        }),
      });

      // 0x4F2083f5fBede34C2714aFfb3105539775f7FE64
      // 0x0000000000000000000000000000000000000000
      // 0x0000000000000000000000000000000000000000
      // 0x0000000000000000000000000000000000000000

      const res = await response.json();

      if (res.response.transaction.status) {
        setStatus("Valid");
      } else {
        setStatus("Invalid");
      }
    } catch (e) {
      console.log(e);
      setStatus("Invalid");
    }

    setIsLoading(false);
  }

  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-sm mb-1">{label}</label>
      <div className="flex flex-row gap-x-6">
        <div className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent">
          <p>{status}</p>
        </div>
        <button
          className="py-3 px-5 font-semibold border border-gray-eo placeholder-gray-af bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
          onClick={() => simulate()}
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
