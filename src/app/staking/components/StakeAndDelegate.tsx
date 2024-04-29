"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { StakeButton } from "@/app/staking/components/StakeButton";
import { Input } from "@/components/ui/input";
import Tenant from "@/lib/tenant/tenant";

import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { useDepositorTotalStaked } from "@/hooks/useDepositorTotalStaked";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Button } from "@/components/ui/button";

export const StakeAndDelegate = ({ isFirstStep }: { isFirstStep: boolean }) => {
  const { token } = Tenant.current();
  const { address } = useAccount();

  const [amountToStake, setAmountToStake] = useState<number>(0);
  const [addressToDelegate, setAddressToDelegate] = useState<
    string | undefined
  >(address);

  const { data: totalStaked, isFetched: isLoadedTotalStaked } =
    useDepositorTotalStaked(address as `0x${string}`);

  const hasTotalStaked = isLoadedTotalStaked && totalStaked !== undefined;

  const { data: tokenBalance, isFetched: isLoadedBalance } = useTokenBalance(
    address as `0x${string}`
  );
  const hasTokenBalance = isLoadedBalance && tokenBalance !== undefined;

  return (
    <div className="px-4 py-6 rounded-lg border border-gray-300 shadow-newDefault font-inter">
      <div className="rounded-lg border border-gray-300 mb-5 shadow-newDefault">
        <HStack className="max-w-[354px] w-full items-end justify-center py-[26px] px-[30px] rounded-lg  border-b border-gray-300 shadow-newDefault">
          {isFirstStep && (
            <button
              onClick={() => setAmountToStake(Number(tokenBalance))}
              className="w-10 h-10 py-3 px-[6px] text-xs font-semibold flex justify-center items-center rounded-full border border-gray-300 shadow-newDefault"
            >
              MAX
            </button>
          )}
          <div className="text-center">
            <h1 className="text-xs font-semibold text-gray-4f mb-2">
              {isFirstStep ? "Enter UNI to stake" : "Staking UNI"}
            </h1>
            <Input
              placeholder={"0"}
              value={
                amountToStake > 10 ** token.decimals
                  ? amountToStake / 10 ** token.decimals
                  : amountToStake
              }
              onChange={(e) => {
                setAmountToStake(Math.floor(Number(e.target.value)));
              }}
              type="number"
              className="border-none outline-none bg-white text-center text-[44px] font-semibold placeholder:text-black"
            />
          </div>
          <Image
            src="/images/horse_icon.png"
            alt="img"
            width={40}
            height={40}
            className="rounded"
          />
        </HStack>
        <HStack className="w-full flex items-center bg-gray-fa rounded-lg">
          <VStack className="w-full text-xs font-semibold text-gray-4f items-start p-4 border-r border-r-gray-300 ">
            Available to stake
            <h6 className="text-base font-medium text-black">
              {" "}
              {hasTokenBalance ? (
                <TokenAmountDisplay
                  maximumSignificantDigits={5}
                  amount={tokenBalance}
                />
              ) : (
                0
              )}
            </h6>
          </VStack>
          <VStack className="w-full items-end p-4">
            <p className="text-xs font-semibold text-gray-4f">Already staked</p>
            <h6 className="text-base font-medium text-black">
              {hasTotalStaked ? (
                <TokenAmountDisplay
                  maximumSignificantDigits={5}
                  amount={totalStaked}
                />
              ) : (
                0
              )}
            </h6>
          </VStack>
        </HStack>
      </div>
      {isFirstStep ? (
        <Link href="/staking/deposits/delegates">
          <Button disabled={!(amountToStake > 0)} className="w-full">
            Continue
          </Button>
        </Link>
      ) : (
        <StakeButton address={addressToDelegate} amount={amountToStake} />
      )}
    </div>
  );
};
