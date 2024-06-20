"use client";

import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import HumanAddress from "@/components/shared/HumanAddress";
import React, { useEffect, useRef, useState } from "react";
import { StakedDeposit } from "@/lib/types";
import type { Delegate } from "@/app/api/common/delegates/delegate";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { TOKEN_BALANCE_QK, useTokenBalance } from "@/hooks/useTokenBalance";
import { DEPOSITOR_TOTAL_STAKED_QK } from "@/hooks/useDepositorTotalStaked";
import { INDEXER_DELAY } from "@/lib/constants";
import { TOKEN_ALLOWANCE_QK } from "@/hooks/useTokenAllowance";

interface DepositProps {
  deposit: StakedDeposit;
  fetchDelegate: (address: string) => Promise<Delegate>;
  refreshPath: (path: string) => void;
}

export const Deposit = ({
  deposit,
  fetchDelegate,
  refreshPath,
}: DepositProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { data: tokenBalance } = useTokenBalance(address);
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const isDelegateFetched = useRef(false);

  const { contracts } = Tenant.current();
  const { config } = usePrepareContractWrite({
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "withdraw",
    args: [BigInt(deposit.id), BigInt(deposit.amount)],
  });

  const { data, write } = useContractWrite(config);
  const isDepositOwner =
    isConnected && address?.toLowerCase() === deposit.depositor.toLowerCase();

  const { isLoading: isProcessingWithdrawal, isFetched: didProcessWithdrawal } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  const getDelegate = async () => {
    if (!isDelegateFetched.current) {
      const delegate = await fetchDelegate(deposit.delegatee as `0x${string}`);
      setDelegate(delegate);
      isDelegateFetched.current = true;
    }
  };

  useEffect(() => {
    //  Fetch delegate if not already fetched
    if (!delegate && !isDelegateFetched.current) {
      getDelegate();
    }
    // Refresh route and invalidate cache if withdrawal was processed
    if (didProcessWithdrawal) {
      setTimeout(() => {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: [TOKEN_BALANCE_QK, deposit.depositor],
          }),
          queryClient.invalidateQueries({
            queryKey: [DEPOSITOR_TOTAL_STAKED_QK, deposit.depositor],
          }),
          queryClient.invalidateQueries({
            queryKey: [TOKEN_ALLOWANCE_QK],
          }),
        ]).then(() => {
          refreshPath(`/staking/${deposit.depositor}`);
          router.refresh();
        });
      }, INDEXER_DELAY);
    }
  }, [
    delegate,
    deposit,
    didProcessWithdrawal,
    getDelegate,
    isDelegateFetched,
    queryClient,
    router,
  ]);

  return (
    <div className="px-5 py-4 w-full">
      <div className="flex flex-row gap-5 justify-between w-full">
        <div className="w-[130px] border-r border-gray-300">
          <div className="text-xs font-medium text-gray-700">Staked</div>
          <div className="font-medium">
            <TokenAmountDisplay
              maximumSignificantDigits={4}
              amount={deposit.amount}
            />
          </div>
        </div>

        <div className="text-left">
          <div className="text-xs font-medium text-gray-700">
            Vote delegated to
          </div>
          <div className="font-medium">
            <HumanAddress address={deposit.delegatee} />
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-gray-700">
            Voting activity
          </div>
          <div className="font-medium">
            {delegate
              ? `${delegate.lastTenProps} / 10 last props`
              : "0 / 10 last props"}
          </div>
        </div>

        {isProcessingWithdrawal || didProcessWithdrawal ? (
          <div className="py-3 px-5 font-medium rounded-lg border border-gray-300 text-gray-500">
            Withdrawing...
          </div>
        ) : (
          <div className="flex flex-row justify-between gap-5">
            {isDepositOwner ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <div className="py-3 px-5 font-medium rounded-lg border border-gray-300 shadow-newDefault cursor-pointer">
                    Manage Deposit
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent bg-neutral rounded-lg border border-gray-300 shadow-newDefault w-[250px]"
                    sideOffset={10}
                    alignOffset={0}
                    align="end"
                  >
                    {tokenBalance && tokenBalance > 0n && (
                      // Hide edit button when no token balance
                      <div className="py-3 px-5 font-medium border-b border-gray-300 cursor-pointer hover:bg-gray-100">
                        <Link href={`/staking/deposits/${deposit.id}`}>
                          Edit amount
                        </Link>
                      </div>
                    )}
                    <div className="py-3 px-5 font-medium border-b border-gray-300 cursor-pointer hover:bg-gray-100">
                      <Link href={`/staking/deposits/${deposit.id}/delegate`}>
                        Change delegate
                      </Link>
                    </div>
                    <div
                      className="py-3 px-5 font-medium cursor-pointer hover:bg-gray-100"
                      onClick={() => write?.()}
                    >
                      Withdraw stake
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="py-3 px-5 font-medium rounded-lg border border-gray-300 text-gray-500">
                Manage Deposit
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
