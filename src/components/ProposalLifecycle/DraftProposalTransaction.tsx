import { icons } from "@/icons/icons";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";

import Image from "next/image";

import { useContext, useState } from "react";
import { DebounceInput } from "react-debounce-input";

interface DraftProposalTransactionProps {
  label: string;
  description: string;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  addTransaction: (proposalId: number) => Promise<ProposalDraftTransaction>;
  updateTransaction: (
    transactionId: number,
    data: Partial<ProposalDraftTransaction>
  ) => Promise<ProposalDraftTransaction>;
}

const DraftProposalTransaction: React.FC<DraftProposalTransactionProps> = (
  props
) => {
  const {
    label,
    description,
    proposalState,
    setProposalState,
    addTransaction,
    updateTransaction,
  } = props;

  const [transactions, setTransactions] = useState<ProposalDraftTransaction[]>(
    proposalState.transactions
  );

  async function handleAddTransaction() {
    const newTransaction = await addTransaction(proposalState.id);
    setTransactions([...transactions, newTransaction]);
  }

  return (
    <div className="flex flex-col px-6 py-4 border-y border-gray-eb">
      <label className="font-medium mb-2">{label}</label>
      <p className="text-xs max-w-[620px] text-gray-4f mb-6">{description}</p>
      {transactions.length === 0 && (
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
            onClick={() => handleAddTransaction()}
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
      {transactions.length > 0 && (
        <div className="flex flex-col w-full gap-y-8">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex flex-col w-full gap-y-4">
              <div className="flex flex-row w-full justify-between">
                <p className="text-xl font-semibold">{`Transaction ${
                  index + 1
                }`}</p>
                <button
                  className="rounded-full bg-stone-100 p-2 hover:bg-stone-200"
                  onClick={() => {}}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-row gap-x-10">
                <DraftProposalTransactionInput
                  id={transactions[index].id}
                  label="Target"
                  placeholder="address"
                  updateTransaction={updateTransaction}
                  setProposalState={setProposalState}
                  value={transactions[index].target}
                  field="target"
                />
                <DraftProposalTransactionInput
                  id={transactions[index].id}
                  label="Value"
                  placeholder="ETH amount"
                  updateTransaction={updateTransaction}
                  setProposalState={setProposalState}
                  value={transactions[index].value}
                  field="value"
                />
              </div>
              <div className="flex flex-row gap-x-10">
                <DraftProposalTransactionInput
                  id={transactions[index].id}
                  label="Calldata"
                  placeholder="bytes"
                  updateTransaction={updateTransaction}
                  setProposalState={setProposalState}
                  value={transactions[index].calldata}
                  field="calldata"
                />
                <DraftProposalTransactionInput
                  id={transactions[index].id}
                  label="Function details"
                  placeholder="transfer(to, amount)"
                  updateTransaction={updateTransaction}
                  setProposalState={setProposalState}
                  value={transactions[index].function_details}
                  field="function_details"
                />
              </div>
              <DraftProposalTransactionInput
                id={transactions[index].id}
                label="Contract ABI"
                placeholder="ABI"
                updateTransaction={updateTransaction}
                setProposalState={setProposalState}
                value={transactions[index].contract_abi}
                field="contract_abi"
              />
              <DraftProposalTransactionInput
                id={transactions[index].id}
                label="Transaction description"
                placeholder="Permits depositing ETH on Compound v3"
                updateTransaction={updateTransaction}
                setProposalState={setProposalState}
                value={transactions[index].description}
                field="description"
              />
            </div>
          ))}
          <DraftProposalAddAnotherTransaction
            handleAddTransaction={handleAddTransaction}
          />
          <DraftProposalTransactionValidity
            label="Transaction validity"
            placeholder="Permits depositing ETH on Compound v3"
            proposalState={proposalState}
          />
          <DraftProposalTransactionAuditPayload />
        </div>
      )}
    </div>
  );
};

export default DraftProposalTransaction;

interface DraftProposalTransactionInputProps {
  id: number;
  label: string;
  placeholder: string;
  updateTransaction: (
    transactionId: number,
    data: Partial<ProposalDraftTransaction>
  ) => Promise<ProposalDraftTransaction>;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  value: string;
  field: keyof ProposalDraftTransaction;
}

const DraftProposalTransactionInput: React.FC<
  DraftProposalTransactionInputProps
> = (props) => {
  const {
    id,
    label,
    placeholder,
    updateTransaction,
    setProposalState,
    value,
    field,
  } = props;

  async function handleUpdateTransaction(newValue: string) {
    const updatedTransaction = await updateTransaction(id, {
      [field]: newValue,
    });

    setProposalState((prevState) => {
      const newTransactions = prevState.transactions.map((transaction) => {
        if (transaction.id === id) {
          return updatedTransaction;
        }
        return transaction;
      });

      return {
        ...prevState,
        transactions: newTransactions,
      };
    });
  }

  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-sm mb-1">{label}</label>
      {/* @ts-expect-error Server Component */}
      <DebounceInput
        debounceTimeout={1000}
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleUpdateTransaction(e.target.value)}
      />
    </div>
  );
};

interface DraftProposalTransactionValidityProps {
  label: string;
  placeholder: string;
  proposalState: ProposalDraftWithTransactions;
}

const DraftProposalTransactionValidity: React.FC<
  DraftProposalTransactionValidityProps
> = (props) => {
  const { label, placeholder, proposalState } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"Unconfirmed" | "Valid" | "Invalid">(
    "Unconfirmed"
  );

  async function simulate() {
    // call tha backend /simulate endpoint
    setIsLoading(true);

    const transactionsBundle = proposalState.transactions.map((transaction) => {
      return {
        target: transaction.target,
        value: transaction.value,
        calldata: transaction.calldata,
        networkId: "1",
        from: "0xF417ACe7b13c0ef4fcb5548390a450A4B75D3eB3", // todo
      };
    });

    try {
      const response = await fetch("/api/simulate-bundle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionsBundle),
      });

      // 0x4F2083f5fBede34C2714aFfb3105539775f7FE64
      // 0x0000000000000000000000000000000000000000
      // 0x0000000000000000000000000000000000000000
      // 0x0000000000000000000000000000000000000000

      const res = await response.json();

      let allValid = true;

      for (const simulation of res.response.simulation_results) {
        if (!simulation.transaction.status) {
          allValid = false;
        }
      }

      if (allValid) {
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
        <div className="py-3 px-4 flex-grow border border-gray-eo placeholder-gray-af bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent">
          <p>{status}</p>
        </div>
        <button
          className="py-3 px-5 font-semibold border border-gray-eo placeholder-gray-af bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
          onClick={() => simulate()}
        >
          Simulate all
        </button>
      </div>
    </div>
  );
};

interface DraftProposalAddAnotherTransactionProps {
  handleAddTransaction: () => void;
}

const DraftProposalAddAnotherTransaction = (
  props: DraftProposalAddAnotherTransactionProps
) => {
  const { handleAddTransaction } = props;

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
          onClick={() => handleAddTransaction()}
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
