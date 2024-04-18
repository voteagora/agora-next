import React from "react";
import TransactionReceiptCard from "./TransactionReceiptCard";

const TransactionReceipt = () => {
  return (
    <div className="min-h-[723px] bg-[url('/images/receipt_bg.svg')] p-4 bg-cover bg-center flex justify-center items-center">
      <TransactionReceiptCard
        address="tokenholder.eth"
        ownedAmount="500,000 UNI"
        stakedAmount="0"
        totalStake="500,000"
        delegateTo="voter.eth"
      />
    </div>
  );
};

export default TransactionReceipt;
