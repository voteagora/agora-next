import React from "react";
import Image from "next/image";
import ENSName from "@/components/shared/ENSName";
import Tenant from "@/lib/tenant/tenant";
import { formatNumber, numberToToken } from "@/lib/utils";
import type { StakedDeposit } from "@/lib/types";

interface ReceiptProps {
  amount?: number;
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
  const { token, ui } = Tenant.current();

  return (
    <div className="flex flex-col font-code max-w-[408px] w-full px-[34px] py-8 mt-6 rounded-lg border border-gray-300 bg-neutral">
      <Image
        src={ui.assets.delegate}
        alt="img"
        width={40}
        height={40}
        className="rounded-full filter grayscale bg-gray-400"
      />
      <h1 className="text-2xl text-primary leading-[30px] mt-5">{title}</h1>
      <div className="flex flex-col w-full gap-[15px] mt-7">
        <div className="flex flex-row w-full justify-between items-center text-primary">
          <p className="text-base leading-4">Your address</p>
          <p className="text-base leading-4">
            {depositor && <ENSName address={depositor} />}
          </p>
        </div>

        {delegatee && (
          <div className="flex flex-row w-full justify-between items-center text-primary">
            <p className="text-base leading-4">Delegating to</p>
            <p className="text-base leading-4">
              <ENSName address={delegatee} />
            </p>
          </div>
        )}

        {amount !== undefined && (
          <div className="flex flex-row w-full justify-between items-center text-primary">
            <p className="text-base leading-4">Depositing</p>
            <p className="text-base leading-4">
              {formatNumber(numberToToken(amount).toString(), token.decimals)}{" "}
              {token.symbol}
            </p>
          </div>
        )}

        {deposit && (
          <>
            <div className="h-0.5 w-full border-t border-dashed border-gray-300 my-5"></div>
            {deposit.delegatee !== delegatee && (
              <div className="flex flex-row w-full justify-between items-center text-primary">
                <p className="text-base leading-4">Existing delegate</p>
                <p className="text-base leading-4">
                  <ENSName address={deposit.delegatee} />
                </p>
              </div>
            )}
            <div className="flex flex-row w-full justify-between items-center text-primary">
              <p className="text-base leading-4">Existing stake amount</p>
              <p className="text-base leading-4">
                {formatNumber(deposit.amount, token.decimals)} {token.symbol}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="h-0.5 w-full border-t border-dashed border-gray-300 mt-[46px]"></div>
      <p className=" text-xs font-normal italic text-center mt-1 text-gray-4f ">
        Thanking for staking using Uniswap Agora!
      </p>
    </div>
  );
};
