import React from "react";
import DepositReceiptCard from "./DepositReceiptCard";
import { StakedDeposit } from "@/lib/types";

interface IDepositReceiptProps {
  deposit: StakedDeposit;
}

const DepositReceipt = ({ deposit }: IDepositReceiptProps) => {
  return (
    <div
      className="min-h-[723px] bg-[url('/images/receipt_bg.svg')] p-4 bg-cover bg-center flex justify-center items-center">
      <DepositReceiptCard
        deposit={deposit}
        receiptTitle="Confirm your staked UNI withdrawal transaction"
        receiptEntries={[]}
      />
    </div>
  );
};

export default DepositReceipt;
