import React from "react";
import TransactionReceipt from "@/components/Staking/TransactionReceipt/TransactionReceipt";
import { useSearchParams } from "next/navigation";

const CreateNewStakeReceipt = () => {
  const searchParams = useSearchParams();
  const delegateAddress = searchParams?.get("delegate");
  return (
    <TransactionReceipt
      receiptTitle={
        delegateAddress
          ? "Confirm your staking transaction"
          : "Creating new stake"
      }
      address="tokenholder.eth"
      ownedAmount="500,000 UNI"
      receiptEntries={[
        {
          title: "Already staked across all deposits",
          value: "0 UNI",
        },
        {
          title: "Staking",
          value: "0 UNI",
        },
        {
          title: "Total stake after",
          value: "0 UNI",
        },
        {
          title: "Delegating to",
          value: "N/A",
        },
      ]}
    />
  );
};

export default CreateNewStakeReceipt;
