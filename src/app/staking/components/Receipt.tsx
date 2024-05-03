import React from "react";
import Image from "next/image";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "../../../components/Staking/TransactionReceipt/transactionReceipt.module.scss";
import ENSName from "@/components/shared/ENSName";
import Tenant from "@/lib/tenant/tenant";
import { formatNumber, numberToToken } from "@/lib/utils";
import type { StakedDeposit } from "@/lib/types";

interface ReceiptProps {
  amount: number;
  delegatee?: string;
  deposit?: StakedDeposit;
  depositor?: string;
  title: string;
}

export const Receipt = ({
                          amount,
                          delegatee,
                          depositor,
                          title,
                          deposit,
                        }: ReceiptProps) => {

  const { token } = Tenant.current();

  return (
    <VStack
      className={`font-code max-w-[408px] w-full px-[34px] py-8 mt-6 rounded-lg border border-gray-300 ${styles["transaction-box"]}`}
    >
      <div className={`rounded-lg ${styles["transaction-box-border"]}`}></div>

      <Image
        src="/images/horse_icon.png"
        alt="img"
        width={40}
        height={40}
        className="rounded filter grayscale"
      />
      <h1 className="text-2xl text-black leading-[30px] mt-5">{title}</h1>
      <VStack className="w-full gap-[15px] mt-7">
        <HStack className="w-full justify-between items-center text-black">
          <p className="text-base leading-4">Your address</p>
          <p className="text-base leading-4">
            {depositor && <ENSName address={depositor} />}
          </p>
        </HStack>

        {delegatee && (
          <HStack className="w-full justify-between items-center text-black">
            <p className="text-base leading-4">Delegated to</p>
            <p className="text-base leading-4">
              <ENSName address={delegatee} />
            </p>
          </HStack>
        )}

        <HStack className="w-full justify-between items-center text-black">
          <p className="text-base leading-4">Deposit</p>
          <p className="text-base leading-4">
            {formatNumber(numberToToken(amount).toString(), token.decimals)} {token.symbol}
          </p>
        </HStack>


        {deposit && (
          <>
            <div className="h-0.5 w-full border-t border-dashed border-gray-300 my-5"></div>
            {deposit.delegatee !== delegatee && (
              <HStack className="w-full justify-between items-center text-black">
                <p className="text-base leading-4">Previous delegate</p>
                <p className="text-base leading-4">
                  <ENSName address={deposit.delegatee} />
                </p>
              </HStack>
            )}
            <HStack className="w-full justify-between items-center text-black">
              <p className="text-base leading-4">Previous deposit</p>
              <p className="text-base leading-4">
                {formatNumber(deposit.amount, token.decimals)} {token.symbol}
              </p>
            </HStack>

          </>
        )}

      </VStack>
      <div className="h-0.5 w-full border-t border-dashed border-gray-300 mt-[46px]"></div>
      <p className=" text-xs font-normal italic text-center mt-1 text-gray-4f ">
        Thanking for staking using Uniswap Agora!
      </p>
    </VStack>
  );
};
