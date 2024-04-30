"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HStack, VStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import {
  DialogProvider,
  useOpenDialog,
} from "@/components/Dialogs/DialogProvider/DialogProvider";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { icons } from "@/icons/icons";

import { StakedDeposit } from "@/lib/types";
import { Button } from "@/components/Button";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
      <div className="mt-4 rounded-lg border border-gray-300 shadow-newDefault">
        {deposits.map((deposit, index) => (
          <HStack
            key={index}
            className="h-auto w-full sm:w-auto text-start flex flex-col sm:flex-row items-center rounded-lg border-b border-gray-300 shadow-newDefault"
          >
            <VStack className="w-full p-4">
              <p className="text-xs font-semibold text-gray-4f">Staked</p>
              <h6 className="text-base font-semibold text-black">
                <TokenAmountDisplay
                  maximumSignificantDigits={4}
                  amount={deposit.amount}
                />
              </h6>
            </VStack>
            <div className="w-2 h-8 bg-gray-300 mr-4"></div>
            <VStack className="w-full p-4">
              <p className="text-xs font-semibold text-gray-4f">
                Voted delegated to
              </p>
              <h6 className="text-base font-medium text-black">
                <HumanAddress address={deposit.delegatee} />
              </h6>
            </VStack>
            <VStack className="w-full p-4">
              <p className="text-xs font-semibold text-gray-4f">
                Voting activity
              </p>
              <h6 className="text-base font-medium text-black ">
                9/10 last props
              </h6>
            </VStack>
            <VStack className="w-full  bg-white">
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none ">
                  <Button
                    variant="outline"
                    className="text-base font-semibold text-black"
                  >
                    Manage deposit
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      openDialog({
                        type: "STAKE_DEPOSIT_ADD",
                        params: {
                          deposit: deposit,
                        },
                      });
                    }}
                    className="text-base font-semibold text-black"
                  >
                    Edit amount or delegate
                  </DropdownMenuItem>
                  <hr />
                  <DropdownMenuItem
                    onClick={() => {
                      openDialog({
                        type: "STAKE_DEPOSIT_WITHDRAW",
                        params: {
                          deposit: deposit,
                        },
                      });
                    }}
                    className="text-base font-semibold text-black"
                  >
                    Withdraw stake
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </VStack>
          </HStack>
        ))}

        <HStack className="w-full py-4 px-6 flex justify-between items-center bg-gray-fa rounded-lg">
          {canDepositMode ? (
            <HStack className="w-full py-4 px-6 justify-between items-center ">
              <div className="flex flex-row gap-2 justify-center text-center items-center">
                <Link
                  className="w-10 h-10  flex justify-center items-center  rounded-full border border-gray-300 shadow-newDefault"
                  href="/staking/deposits/create"
                >
                  <Image height={14} width={14} src={icons.plus} alt="plus" />
                </Link>

                <h3 className="text-base font-semibold text-black leading-6">
                  Deposit another stake{" "}
                </h3>
              </div>
              <p className="text-base font-medium text-gray-4f">
                <TokenAmountDisplay
                  maximumSignificantDigits={4}
                  amount={data}
                />{" "}
                available
              </p>
            </HStack>
          ) : (
            <>No more stakes available</>
          )}
        </HStack>
      </div>
    </DialogProvider>
  );
};
