import React from "react";
import TransactionReceiptCard from "./TransactionReceiptCard";

const TransactionReceipt = () => {
  return (
    <div className="min-h-[723px] bg-[url('/images/receipt_bg.svg')] p-4 bg-cover bg-center flex justify-center items-center">
      <TransactionReceiptCard
        receiptTitle="Confirm your staked UNI withdrawal transaction"
        address="tokenholder.eth"
        ownedAmount="500,000 UNI"
        receiptEntries={[
          {
            title: "Already staked",
            value: "100,000 UNI",
            showDivider: true,
          },
          {
            title: "Collecting rewards",
            value: "2.1 ETH",
          },
        ]}
      />
    </div>
  );
};

export default TransactionReceipt;
