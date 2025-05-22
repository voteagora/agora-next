"use client";

import React from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount } from "wagmi";
import ENSAvatar from "../shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { ProfileDropDownContent } from "./ProfileDropDownContent";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { SafeIcon } from "@/icons/SafeIcon";
import { MetamaskIcon } from "@/icons/MetamaskIcon";
import { useGetSafesForAddress } from "@/hooks/useGetSafesForAddress";
import { useSafePendingTransactions } from "@/hooks/useSafePendingTransactions";

type Props = {
  ensName: string | undefined;
};

export const DesktopProfileDropDown = ({ ensName }: Props) => {
  const { address } = useAccount();
  const { isSelectedPrimaryAddress, selectedWalletAddress } =
    useSelectedWallet();
  const { connector } = useAccount();
  const connectorIcon = connector?.icon;
  const connectorName = connector?.name;
  const { data: safes } = useGetSafesForAddress(address);
  const { pendingTransactionsForOwner } = useSafePendingTransactions();

  const walletIcon = () => {
    if (!isSelectedPrimaryAddress) {
      return (
        <SafeIcon
          width={16}
          height={16}
          className="absolute bottom-[-2px] right-[-6px] rounded-full"
        />
      );
    } else if (connectorName === "MetaMask") {
      return (
        <div className="rounded-full absolute bottom-[0px] right-[0px] h-[18px] w-[18px] bg-neutral-100">
          <MetamaskIcon
            width={16}
            height={16}
            className="absolute bottom-[-2px] right-[-6px] rounded-full"
          />
        </div>
      );
    } else {
      return (
        <div className="rounded-full absolute bottom-[0px] right-[0px] h-[18px] w-[18px] bg-neutral-100">
          <img src={connectorIcon} className="h-[16px] w-[16px] m-[4px]" />
        </div>
      );
    }
  };
  return (
    <Popover className="relative cursor-auto">
      <>
        <Popover.Button className="flex outline-none">
          <div className="text-primary flex items-center gap-3">
            <div className="w-[30px] h-[30px] lg:w-6 lg:h-6 shadow-newDefault rounded-full flex relative">
              <ENSAvatar ensName={ensName} />
              {safes && safes?.length > 0 && walletIcon()}
            </div>
            <div className="hidden lg:inline">
              {selectedWalletAddress && (
                <ENSName address={selectedWalletAddress} />
              )}
            </div>
            {pendingTransactionsForOwner.length > 0 &&
              !isSelectedPrimaryAddress && (
                <div className="rounded-full h-[10px] w-[10px] bg-negative inline-block" />
              )}
          </div>
        </Popover.Button>

        <Transition
          className="absolute right-0 z-[100]"
          enter="transition duration-00 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Popover.Panel>
            {({ close }) => (
              <div className="bg-wash border border-line rounded-[16px] w-[350px] shadow-newPopover">
                <div className="flex flex-col min-h-[250px]">
                  <ProfileDropDownContent
                    ensName={ensName}
                    handleCloseDrawer={close}
                  />
                </div>
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </>
    </Popover>
  );
};
