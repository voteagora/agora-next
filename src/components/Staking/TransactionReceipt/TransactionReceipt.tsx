import React from "react";
import TransactionReceiptCard, {
  IReceiptEntries,
} from "./TransactionReceiptCard";
interface ConfirmStakingTransactionCardProps {
  address: string;
  ownedAmount: string;
  receiptEntries: IReceiptEntries[];
  receiptTitle?: string;
}

const TransactionReceipt: React.FC<ConfirmStakingTransactionCardProps> = ({
  address,
  ownedAmount,
  receiptEntries,
  receiptTitle,
}) => {
  return (
    <div
      className={`min-h-[723px] bg-[url('/images/receipt_bg.svg')] p-4 bg-center bg-cover flex justify-center items-center`}
    >
      <TransactionReceiptCard
        receiptTitle={receiptTitle}
        address={address}
        ownedAmount={ownedAmount}
        receiptEntries={receiptEntries}
      />
    </div>
  );
};

export default TransactionReceipt;
