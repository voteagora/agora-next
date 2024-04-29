"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HStack, VStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import { StakedDeposit } from "@/lib/types";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { useQueryClient } from "@tanstack/react-query";

interface IProps {
  buttonText?: string;
  deposit: StakedDeposit;
  isButtonDisabled?: boolean;
  onButtonClick?: () => void;
}

const RewardRedemptionCard: React.FC<IProps> = ({
  buttonText,
  deposit,
  isButtonDisabled,
  onButtonClick,
}) => {
  const { contracts } = Tenant.current();
  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "withdraw",
    args: [deposit.id, deposit.amount],
  });

  const { data, write, status } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash && !isLoading) {
      // TODO: Figure out why invalidating multiple queries didn't work
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      queryClient.invalidateQueries({ queryKey: ["totalStaked"] });
      // onSuccess();
    }
  }, [isLoading, data?.hash, queryClient]);

  return (
    <div className="border rounded-lg font-inter">
      <VStack className="p-4 rounded-lg border-b border-b-gray-300  shadow-newDefault ">
        <VStack className="w-full h-[123px] justify-center items-center rounded-lg border border-gray-300">
          <p className="text-xs font-semibold text-gray-4f">
            Collecting your reward
          </p>
          <h6 className="text-[44px] text-center font-semibold text-black">
            <TokenAmountDisplay
              maximumSignificantDigits={4}
              amount={deposit.amount}
            />
          </h6>
        </VStack>

        <p className="text-base font-medium text-gray-4f my-4 max-w-[322px]">
          Please verify your transaction details before confirming.
        </p>

        <Button
          disabled={isLoading}
          className="w-full mb-3"
          onClick={() => write?.()}
        >
          {isLoading ? "Withdrawing..." : "Withdraw"}
        </Button>
      </VStack>
      <HStack
        gap={4}
        className="p-4 justify-between items-center rounded-lg bg-gray-fa  border-b border-b-gray-300 shadow-newDefault"
      >
        <div className="flex flex-row gap-4">
          <div className="min-w-[48px] h-12 p-3 rounded-lg  border border-gray-300 shadow-newDefault ">
            <Image height={24} width={24} src={icons.logout} alt="" />
          </div>
          <VStack>
            <p className="text-xs font-semibold text-gray-4f">
              Also redeem my entire stake
            </p>
            <h6 className="text-base font-medium text-black">500,000ETH</h6>
          </VStack>
        </div>

        <Checkbox id="terms1" />
      </HStack>
    </div>
  );
};

export default RewardRedemptionCard;
