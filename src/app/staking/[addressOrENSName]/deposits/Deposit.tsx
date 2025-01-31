"use client";

import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import React, { useEffect } from "react";
import { StakedDeposit } from "@/lib/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { TOKEN_BALANCE_QK, useTokenBalance } from "@/hooks/useTokenBalance";
import { DEPOSITOR_TOTAL_STAKED_QK } from "@/hooks/useDepositorTotalStaked";
import { INDEXER_DELAY } from "@/lib/constants";
import { TOKEN_ALLOWANCE_QK } from "@/hooks/useTokenAllowance";
import ENSName from "@/components/shared/ENSName";
import { useVoterStats } from "@/hooks/useVoterStats";
import { TOTAL_STAKED_QK } from "@/hooks/useTotalStaked";

interface DepositProps {
  deposit: StakedDeposit;
  refreshPath: (path: string) => void;
}

export const Deposit = ({ deposit, refreshPath }: DepositProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { isConnected, address } = useAccount();
  const { data: tokenBalance } = useTokenBalance(address);
  const { data: voterStats } = useVoterStats({ address: deposit.delegatee });

  const { contracts } = Tenant.current();
  const { data, writeContract } = useWriteContract();

  const isDepositOwner =
    isConnected && address?.toLowerCase() === deposit.depositor.toLowerCase();

  const { isLoading: isProcessingWithdrawal, isFetched: didProcessWithdrawal } =
    useWaitForTransactionReceipt({ hash: data });

  useEffect(() => {
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
          queryClient.invalidateQueries({
            queryKey: [TOTAL_STAKED_QK],
          }),
        ]).then(() => {
          refreshPath(`/staking/${deposit.depositor}`);
          router.refresh();
        });
      }, INDEXER_DELAY);
    }
  }, [didProcessWithdrawal]);

  return (
    <div className="px-5 py-4 w-full">
      <div className="flex flex-row gap-5 justify-between w-full">
        <div className="w-[130px] border-r border-line">
          <div className="text-xs font-medium text-secondary">Staked</div>
          <div className="font-medium text-primary">
            <TokenAmountDecorated
              maximumSignificantDigits={4}
              amount={deposit.amount}
            />
          </div>
        </div>

        <div className="text-left">
          <div className="text-xs font-medium text-secondary">
            Vote delegated to
          </div>
          <div className="font-medium text-primary">
            <ENSName address={deposit.delegatee} />
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-secondary">
            Voting activity
          </div>
          <div className="font-medium text-primary">
            {voterStats
              ? `${voterStats.last_10_props} / 10 last props`
              : "0 / 10 last props"}
          </div>
        </div>

        {isProcessingWithdrawal || didProcessWithdrawal ? (
          <div className="py-3 px-5 font-medium rounded-lg border border-line text-secondary">
            Withdrawing...
          </div>
        ) : (
          <div className="flex flex-row justify-between gap-5">
            {isDepositOwner ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <div className="py-3 px-5 font-medium rounded-lg border border-line shadow-newDefault cursor-pointer text-primary">
                    Manage Deposit
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent bg-neutral rounded-lg border border-line text-primary shadow-newDefault w-[250px]"
                    sideOffset={10}
                    alignOffset={0}
                    align="end"
                  >
                    {tokenBalance && tokenBalance > 0n && (
                      // Hide edit button when no token balance
                      <div className="py-3 px-5 font-medium border-b border-line text-secondary hover:text-primary cursor-pointer">
                        <Link href={`/staking/deposits/${deposit.id}`}>
                          Edit amount
                        </Link>
                      </div>
                    )}
                    <div className="py-3 px-5 font-medium border-b border-line text-secondary hover:text-primary cursor-pointer">
                      <Link href={`/staking/deposits/${deposit.id}/delegate`}>
                        Change delegate
                      </Link>
                    </div>
                    <div
                      className="py-3 px-5 font-medium border-b border-line text-secondary hover:text-primary cursor-pointer"
                      onClick={() => {
                        writeContract({
                          address: contracts.staker!.address as `0x${string}`,
                          abi: contracts.staker!.abi,
                          chainId: contracts.staker!.chain.id,
                          functionName: "withdraw",
                          args: [BigInt(deposit.id), BigInt(deposit.amount)],
                        });
                      }}
                    >
                      Withdraw stake
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="py-3 px-5 font-medium rounded-lg border border-line text-secondary hover:bg-wash">
                Manage Deposit
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
