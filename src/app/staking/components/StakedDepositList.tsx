"use client";

import React from "react";
import HumanAddress from "@/components/shared/HumanAddress";
import {
  DialogProvider,
  useOpenDialog,
} from "@/components/Dialogs/DialogProvider/DialogProvider";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { StakedDeposit } from "@/lib/types";
import { Button } from "@/components/Button";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import Link from "next/link";

interface StakedDepositListProps {
  deposits: StakedDeposit[];
  address: string;
}

export const StakedDepositList = ({
  deposits,
  address,
}: StakedDepositListProps) => {
  const openDialog = useOpenDialog();

  const { data, isFetched } = useTokenBalance(address);
  const hasTokenBalance = data && isFetched;
  const canDepositMode = hasTokenBalance && data > 0n;

  return (
    <DialogProvider>
      <div className="flex flex-col rounded-lg border border-gray-300 w-auto h-100 bg-gray-50">
        <div className="border-b border-gray-300 rounded-lg bg-white">
          {deposits.map((deposit) => {
            return (
              <div
                key={`deposit-${deposit.id}`}
                className="flex justify-evenly rounded-lg w-auto h-100"
              >
                <div className="flex flex-col p-5 min-w-[110px]">
                  <div className="text-xs">Staked</div>
                  <div className="text-xs font-medium">
                    <TokenAmountDisplay
                      maximumSignificantDigits={4}
                      amount={deposit.amount}
                    />
                  </div>
                </div>

                <div className="border-r border-gray-300"></div>

                <div className="flex flex-col p-5 min-w-[200px]">
                  <div className="text-xs">Vote delegated to</div>
                  <div className="text-xs font-medium">
                    <HumanAddress address={deposit.delegatee} />
                  </div>
                </div>
                <div className="border-r border-gray-300"></div>

                <div className="flex flex-col p-5">
                  {/*<Link href={`/staking/deposits/${deposit.id}/withdraw`}>Add</Link>*/}
                  <Button
                    onClick={() => {
                      openDialog({
                        type: "STAKE_DEPOSIT_ADD",
                        params: {
                          deposit: deposit,
                        },
                      });
                    }}
                  >
                    Add
                  </Button>
                </div>

                <div className="border-r border-gray-300"></div>

                <div className="flex flex-col p-5">
                  {/*<Link href={`/staking/deposits/${deposit.id}/withdraw`}>Withdraw</Link>*/}

                  <Button
                    variant={"outline"}
                    onClick={() => {
                      openDialog({
                        type: "STAKE_DEPOSIT_WITHDRAW",
                        params: {
                          deposit: deposit,
                        },
                      });
                    }}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-5 flex justify-between">
          {hasTokenBalance ? (
            <>
              <div className="font-medium">
                {canDepositMode ? (
                  <Link href="staking/deposits/create">
                    Deposit another stake
                  </Link>
                ) : (
                  <>No more stakes available</>
                )}
              </div>

              <div className="font-light text-gray-600">
                <TokenAmountDisplay
                  maximumSignificantDigits={4}
                  amount={data}
                />{" "}
                available
              </div>
            </>
          ) : (
            "Loading token balance..."
          )}
        </div>
      </div>
    </DialogProvider>
  );
};
