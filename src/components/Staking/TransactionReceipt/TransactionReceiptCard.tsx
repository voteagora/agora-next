import React from "react";
import Image from "next/image";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./transactionReceipt.module.scss";

interface ConfirmStakingTransactionCardProps {
  address: string;
  ownedAmount: string;
  stakedAmount: string;
  totalStake: string;
  delegateTo: string;
}

const TransactionReceiptCard: React.FC<ConfirmStakingTransactionCardProps> = ({
  address,
  ownedAmount,
  stakedAmount,
  totalStake,
  delegateTo,
}) => {
  return (
    <VStack
      className={`font-code max-w-[408px] w-full  px-[34px] py-8 bg-gray-fa rounded-lg border border-gray-300 shadow-newDefault mt-6 ${styles["transaction-box"]}`}
    >
      <Image
        src="/images/horse_icon.png"
        alt="img"
        width={40}
        height={40}
        className="rounded filter grayscale"
      />
      <h1 className="text-2xl text-black leading-[30px] mt-5">
        Confirm your staking transaction
      </h1>
      <VStack className="w-full gap-[15px] mt-7">
        <TextRow title="Your address" value={address} />
        <TextRow title="You own" value={ownedAmount} />
        <div className="h-0.5 w-full border-t border-dashed border-gray-300"></div>

        <TextRow title="Already staked" value={stakedAmount} />
        <TextRow title="Staking" value={`${totalStake} $ UNI`} />
        <TextRow title="Total stake after" value={stakedAmount} />
        <TextRow title="Staking" value={`${totalStake} $ UNI`} />
        <TextRow title="Delegating to " value={stakedAmount} />
        <TextRow title="Staking" value={delegateTo} />
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

export default TransactionReceiptCard;
