import React from "react";
import Image from "next/image";
import TransactionReceiptCard from "./TransactionReceiptCard";

const TransactionReceipt = () => {
  return (
    <div className="relative min-h-[723px]">
      <Image
        priority
        className="w-full"
        src="/images/receipt_bg.svg"
        width="686"
        height="723"
        alt=""
      />

      <div className="absolute inset-0 flex justify-center items-center">
        <TransactionReceiptCard
          address="tokenholder.eth"
          ownedAmount="500,000 UNI"
          stakedAmount="0"
          totalStake="500,000"
          delegateTo="voter.eth"
        />
      </div>
    </div>
  );
};

export default TransactionReceipt;
