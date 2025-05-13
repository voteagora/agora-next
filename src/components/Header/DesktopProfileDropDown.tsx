"use client";

import React, { ReactNode, useCallback, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount } from "wagmi";
import ENSAvatar from "../shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { ProfileDropDownContent } from "./ProfileDropDownContent";

type Props = {
  ensName: string | undefined;
};

export const DesktopProfileDropDown = ({ ensName }: Props) => {
  const { address } = useAccount();

  return (
    <Popover className="relative cursor-auto">
      <>
        <Popover.Button className="flex outline-none">
          <div className="text-primary flex items-center gap-3">
            <div className="w-[30px] h-[30px] lg:w-6 lg:h-6 shadow-newDefault rounded-full flex">
              <ENSAvatar ensName={ensName} />
            </div>
            <div className="hidden lg:inline">
              {address && <ENSName address={address} />}
            </div>
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
              <div className="bg-wash border border-line rounded-[16px] w-[376px] shadow-newPopover">
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
