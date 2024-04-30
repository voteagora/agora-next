import React from "react";
import Image from "next/image";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "../../../components/Staking/TransactionReceipt/transactionReceipt.module.scss";
import ENSName from "@/components/shared/ENSName";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { StakedDeposit } from "@/lib/types";

interface IReceiptEntries {
  title: string;
  value: string;
  showDivider?: boolean;
}

interface ConfirmStakingTransactionCardProps {
  amount: string;
  delegatee: string;
  depositor: string;
  receiptEntries: IReceiptEntries[];
  receiptTitle?: string;
}

const DepositReceiptCard: React.FC<ConfirmStakingTransactionCardProps> = ({
  amount,
  delegatee,
  depositor,
  receiptEntries,
  receiptTitle,
}) => {
  return (
    <VStack
      className={`font-code max-w-[408px] w-full px-[34px] py-8 bg-gray-fa rounded-lg border border-gray-300 mt-6 ${styles["transaction-box"]}`}
    >
      <div className={`rounded-lg ${styles["transaction-box-border"]}`}></div>

      <Image
        src="/images/horse_icon.png"
        alt="img"
        width={40}
        height={40}
        className="rounded filter grayscale"
      />
      <h1 className="text-2xl text-black leading-[30px] mt-5">
        {receiptTitle ?? "Confirm your staking transaction"}
      </h1>
      <VStack className="w-full gap-[15px] mt-7">
        <HStack className="w-full justify-between items-center text-black">
          <p className="text-base leading-4">Your address</p>
          <p className="text-base leading-4">
            <ENSName address={depositor} />
          </p>
        </HStack>

        <HStack className="w-full justify-between items-center text-black">
          <p className="text-base leading-4">Delegated to</p>
          <p className="text-base leading-4">
            <ENSName address={delegatee} />
          </p>
        </HStack>

        <HStack className="w-full justify-between items-center text-black">
          <p className="text-base leading-4">You deposited</p>
          <p className="text-base leading-4">
            <TokenAmountDisplay maximumSignificantDigits={4} amount={amount} />
          </p>
        </HStack>

        <Divider />
        {receiptEntries.map((entry, index) => (
          <React.Fragment key={index}>
            <TextRow title={entry.title} value={entry.value} />
            {entry.showDivider && <Divider />}
          </React.Fragment>
        ))}
      </VStack>
      <div className="h-0.5 w-full border-t border-dashed border-gray-300 mt-[46px]"></div>
      <p className=" text-xs font-normal italic text-center mt-1 text-gray-4f ">
        Thanking for staking using Uniswap Agora!
      </p>
    </VStack>
  );
};

const TextRow = ({ title, value }: { title: string; value: string }) => {
  return (
    <HStack className="w-full justify-between items-center text-black">
      <p className="text-base leading-4">{title} </p>
      <p className="text-base leading-4">{value}</p>
    </HStack>
  );
};

const Divider = () => {
  return (
    <div className="h-0.5 w-full border-t border-dashed border-gray-300"></div>
  );
};

export default DepositReceiptCard;
