"use client";

import Tenant from "@/lib/tenant/tenant";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Button } from "@/components/ui/button";
import { icons } from "@/assets/icons/icons";
import React, { useEffect } from "react";
import Image from "next/image";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import {
  TOKEN_ALLOWANCE_QK,
  useTokenAllowance,
} from "@/hooks/useTokenAllowance";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useQueryClient } from "@tanstack/react-query";

const MAX_UINT_256 =
  BigInt(
    115792089237316195423570985008687907853269984665640564039457584007913129639935n
  );

export const PanelSetAllowance = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { token, contracts } = Tenant.current();

  const { data: allowance } = useTokenAllowance(address);
  const hasAllowance = Boolean(allowance && allowance > 0);

  const { config } = usePrepareContractWrite({
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    chainId: contracts.token.chain.id,
    functionName: "approve",
    args: [contracts.staker!.address, MAX_UINT_256],
  });

  const { data, write } = useContractWrite(config);
  const { isLoading, isFetched: didUpdateAllowance } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (didUpdateAllowance) {
      // Invalidate the token allowance query
      queryClient.invalidateQueries({
        queryKey: [TOKEN_ALLOWANCE_QK],
      });
    }
  }, [didUpdateAllowance, queryClient]);

  return (
    <VStack className="max-w-[354px] w-full py-5 px-[17px] rounded-xl border border-gray-300 shadow-newDefault">
      The staking allowance determines the amount of tokens available for
      staking.
      <HStack gap={4} className="my-4">
        <div className="min-w-[48px] h-12 p-3 rounded-lg  border border-gray-300 shadow-newDefault ">
          <Image height={24} width={24} src={icons.currency} alt="" />
        </div>
        <VStack>
          <p className="text-xs font-semibold text-gray-4f">
            Spending Allowance
          </p>
          <h6 className="text-base font-medium text-black">
            <TokenAmountDisplay
              maximumSignificantDigits={4}
              amount={hasAllowance ? allowance! : BigInt(0)}
            />
          </h6>
        </VStack>
      </HStack>
      <Button
        variant="outline"
        size="lg"
        disabled={isLoading}
        onClick={() => write?.()}
      >
        {isLoading ? "Updating..." : "Update Allowance"}
      </Button>
      {data?.hash && <BlockScanUrls hash1={data?.hash} />}
    </VStack>
  );
};
