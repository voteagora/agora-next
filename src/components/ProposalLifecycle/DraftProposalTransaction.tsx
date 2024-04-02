import { icons } from "@/icons/icons";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";

import Image from "next/image";

import { useContext, useState } from "react";
import { DebounceInput } from "react-debounce-input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount } from "wagmi";
import SimulateTransaction, {
  encodeTransfer,
} from "../shared/SimulateTransaction";
import { ethers } from "ethers";
import { VStack } from "../Layout/Stack";
import Tenant from "@/lib/tenant/tenant";

interface DraftProposalTransactionProps {
  label: string;
  description: string;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  addTransaction: (
    proposalId: number,
    transactionType: "transfer" | "custom"
  ) => Promise<ProposalDraftTransaction>;
  updateTransaction: (
    transactionId: number,
    data: Partial<ProposalDraftTransaction>
  ) => Promise<ProposalDraftTransaction>;
  deleteTransaction: (
    transactionId: number
  ) => Promise<ProposalDraftTransaction[]>;
  registerChecklistEvent: (
    proposal_id: string,
    stage: string,
    completed_by: string
  ) => void;
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
    deleteTransaction,
    registerChecklistEvent,
  } = props;

  const [transactions, setTransactions] = useState<ProposalDraftTransaction[]>(
    proposalState.transactions
  );

  async function handleAddTransaction(transactionType: "transfer" | "custom") {
    const newTransaction = await addTransaction(
      proposalState.id,
      transactionType
    );
    setTransactions([...transactions, newTransaction]);
  }

  async function handleDeleteTransaction(transactionId: number) {
    const updatedTransactions = await deleteTransaction(transactionId);
    setTransactions(updatedTransactions);
  }

  return (
    <div className="flex flex-col px-6 py-4 border-y border-gray-eb">
      <label className="font-medium mb-2">{label}</label>
      <p className="text-xs max-w-[620px] text-gray-4f mb-6">{description}</p>
      {transactions.length === 0 && (
        <div className="flex flex-row w-full gap-x-5">
          <button
            onClick={() => handleAddTransaction("transfer")}
            className="w-full flex flex-row justify-center py-3 font-medium rounded-lg border border-gray-eo shadow-sm"
          >
            <span className="flex flex-row items-center">
              Transfer from the treasury
            </span>
          </button>
          <button
            className="w-full flex flex-row justify-center py-3 font-medium rounded-lg border border-gray-eo shadow-sm"
            onClick={() => handleAddTransaction("custom")}
          >
            <span className="flex flex-row items-center">
              Custom transaction
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
                  onClick={() => handleDeleteTransaction(transaction.id)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-row gap-x-10">
                {transaction.type === "custom" ? (
                  <DraftProposalTransactionInput
                    id={transaction.id}
                    label="Target"
                    placeholder="address"
                    updateTransaction={updateTransaction}
                    setProposalState={setProposalState}
                    value={transaction.target}
                    field="target"
                  />
                ) : (
                  <DraftProposalTransactionInputTransferToken
                    id={transaction.id}
                    label="Token"
                    placeholder="Token"
                    updateTransaction={updateTransaction}
                    setProposalState={setProposalState}
                    value={transaction.token_address || ethers.ZeroAddress}
                    field="token_address"
                  />
                )}
                <DraftProposalTransactionInput
                  id={transaction.id}
                  label={transaction.type === "custom" ? "Value" : "Amount"}
                  placeholder={
                    transaction.type === "custom" ||
                    transaction.token_address === ethers.ZeroAddress
                      ? "ETH amount"
                      : "amount"
                  }
                  updateTransaction={updateTransaction}
                  setProposalState={setProposalState}
                  value={
                    transaction.token_address === ethers.ZeroAddress
                      ? transaction.value
                      : transaction.transfer_amount?.toString() || "0"
                  }
                  field={
                    transaction.token_address === ethers.ZeroAddress
                      ? "value"
                      : "transfer_amount"
                  }
                />
              </div>
              <div className="flex flex-row gap-x-10">
                {transaction.type === "custom" ? (
                  <DraftProposalTransactionInput
                    id={transaction.id}
                    label="Calldata"
                    placeholder="bytes"
                    updateTransaction={updateTransaction}
                    setProposalState={setProposalState}
                    value={transaction.calldata}
                    field="calldata"
                  />
                ) : (
                  <DraftProposalTransactionInput
                    id={transaction.id}
                    label="Recipient"
                    placeholder="address"
                    updateTransaction={updateTransaction}
                    setProposalState={setProposalState}
                    value={
                      transaction.token_address === ethers.ZeroAddress
                        ? transaction.target
                        : transaction.transfer_to || ethers.ZeroAddress
                    }
                    field={
                      transaction.token_address === ethers.ZeroAddress
                        ? "target"
                        : "transfer_to"
                    }
                  />
                )}
                {transaction.type === "custom" ? (
                  <DraftProposalTransactionInput
                    id={transaction.id}
                    label="Function details"
                    placeholder="transfer(to, amount)"
                    updateTransaction={updateTransaction}
                    setProposalState={setProposalState}
                    value={transaction.function_details}
                    field="function_details"
                  />
                ) : (
                  <DraftProposalTransactionInput
                    id={transaction.id}
                    label="Transaction description"
                    placeholder="Transfer tokens to the vendor"
                    updateTransaction={updateTransaction}
                    setProposalState={setProposalState}
                    value={transaction.description}
                    field="description"
                  />
                )}
              </div>
              {/* {transaction.type === "custom" && (
                <DraftProposalTransactionInput
                  id={transaction.id}
                  label="Contract ABI"
                  placeholder="ABI"
                  updateTransaction={updateTransaction}
                  setProposalState={setProposalState}
                  value={transaction.contract_abi}
                  field="contract_abi"
                />
              )} */}
              {transaction.type === "custom" && (
                <DraftProposalTransactionInput
                  id={transaction.id}
                  label="Transaction description"
                  placeholder="Permits depositing ETH on Compound v3"
                  updateTransaction={updateTransaction}
                  setProposalState={setProposalState}
                  value={transaction.description}
                  field="description"
                />
              )}
              {/* {transaction.type === "transfer" ? (
                transaction.token_address === ethers.ZeroAddress ? (
                  <SimulateTransaction
                    className="flex flex-row space gap-x-6 text:py-3 px-4 button:py-3 px-4"
                    target={transaction.transfer_to || ethers.ZeroAddress}
                    value={ethers.parseEther(
                      transaction.transfer_amount?.toString() || "0"
                    )}
                    calldata={"0x"}
                  />
                ) : (
                  <SimulateTransaction
                    className="flex flex-row gap-x-6 text:py-3 px-4 button:py-3 px-4"
                    target={transaction.token_address || ethers.ZeroAddress}
                    value={0n}
                    calldata={encodeTransfer(
                      ethers.isAddress(transaction.transfer_to)
                        ? transaction.transfer_to
                        : ethers.ZeroAddress,
                      Number(transaction.transfer_amount?.toString()) || 0,
                      tokens.find(
                        (token) => token.address === transaction.token_address
                      )?.decimals || 18
                    )}
                  />
                )
              ) : (
                <SimulateTransaction
                  className="flex flex-row gap-x-6 text:py-3 px-4"
                  target={transaction.target}
                  value={ethers.parseEther(transaction.value.toString() || "0")}
                  calldata={transaction.calldata}
                />
              )} */}
            </div>
          ))}
          <DraftProposalAddAnotherTransaction
            handleAddTransaction={handleAddTransaction}
          />
          <DraftProposalTransactionValidity
            label="Tenderly transaction simulation status"
            placeholder="Unconfirmed"
            proposalState={proposalState}
            registerChecklistEvent={registerChecklistEvent}
          />
          {/* <DraftProposalTransactionAuditPayload /> */}
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

const DraftProposalTransactionInputTransferToken: React.FC<
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

  const CONTRACT_ADDRESSES = {
    ETH: ethers.ZeroAddress,
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    ENS: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
  };

  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-sm mb-1">{label}</label>
      <Select onValueChange={(value) => handleUpdateTransaction(value)}>
        <SelectTrigger className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent">
          <SelectValue placeholder="Token" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={CONTRACT_ADDRESSES["ETH"]}>ETH</SelectItem>
          <SelectItem value={CONTRACT_ADDRESSES["USDC"]}>USDC</SelectItem>
          <SelectItem value={CONTRACT_ADDRESSES["ENS"]}>ENS</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

interface DraftProposalTransactionValidityProps {
  label: string;
  placeholder: string;
  proposalState: ProposalDraftWithTransactions;
  registerChecklistEvent: (
    proposal_id: string,
    stage: string,
    completed_by: string
  ) => void;
}

const DraftProposalTransactionValidity: React.FC<
  DraftProposalTransactionValidityProps
> = (props) => {
  const { label, placeholder, proposalState, registerChecklistEvent } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("Unconfirmed");

  const { address } = useAccount();

  async function simulate() {
    if (!address) return;
    // call tha backend /simulate endpoint
    setIsLoading(true);

    const transactionsBundle = proposalState.transactions.map((transaction) => {
      if (transaction.type === "transfer") {
        if (transaction.token_address === ethers.ZeroAddress) {
          return {
            target: transaction.transfer_to || ethers.ZeroAddress,
            value: ethers
              .parseEther(transaction.transfer_amount?.toString() || "0")
              .toString(),
            calldata: "0x",
            networkId: Tenant.current().contracts.governor.chainId.toString(),
            from: Tenant.current().contracts.governor.address,
          };
        }

        return {
          target: transaction.token_address || ethers.ZeroAddress,
          value: "0",
          calldata: encodeTransfer(
            ethers.isAddress(transaction.transfer_to)
              ? transaction.transfer_to
              : ethers.ZeroAddress,
            Number(transaction.transfer_amount?.toString()) || 0,
            tokens.find((token) => token.address === transaction.token_address)
              ?.decimals || 18
          ),
          networkId: Tenant.current().contracts.governor.chainId.toString(),
          from: Tenant.current().contracts.governor.address,
        };
      }
      return {
        target: transaction.target || ethers.ZeroAddress,
        value: ethers
          .parseEther(transaction.value.toString() || "0")
          .toString(),
        calldata: transaction.calldata,
        networkId: Tenant.current().contracts.governor.chainId.toString(),
        from: Tenant.current().contracts.governor.address,
      };
    });

    try {
      const response = await fetch("/api/simulate-bundle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionsBundle }),
      });

      // 0x4F2083f5fBede34C2714aFfb3105539775f7FE64
      // 0x0000000000000000000000000000000000000000
      // 0x0000000000000000000000000000000000000000
      // 0x0000000000000000000000000000000000000000

      const res = await response.json();

      let allValid = true;

      console.log(res);

      if (!res.response.simulation_results) {
        allValid = false;
        setStatus(res.response.error?.message ?? "Invalid");
        return;
      }

      for (const idx in res.response.simulation_results) {
        if (!res.response.simulation_results[idx].transaction.status) {
          allValid = false;
          setStatus(
            `Transaction #${idx + 1} failed: ${
              res.response.simulation_results[idx]?.transaction
                ?.error_message ?? "Unknown error"
            }`
          );
          return;
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
    registerChecklistEvent(
      proposalState.id.toString(),
      "transaction_simulation",
      address
    );
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
          disabled={!address}
        >
          Simulate all
        </button>
      </div>
    </div>
  );
};

interface DraftProposalAddAnotherTransactionProps {
  handleAddTransaction: (transactionType: "transfer" | "custom") => void;
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
          onClick={() => handleAddTransaction("transfer")}
        >
          Transfer from the treasury
        </button>
        <button
          className="py-3 w-full border border-gray-eo rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
          onClick={() => handleAddTransaction("custom")}
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

const tokens = [
  { name: "ETH", address: ethers.ZeroAddress, decimals: 18 },
  {
    name: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  {
    name: "ENS",
    address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
    decimals: 18,
  },
];
