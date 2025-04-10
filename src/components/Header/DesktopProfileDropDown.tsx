"use client";

import React, { ReactNode } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount } from "wagmi";
import ENSAvatar from "../shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { ProfileDropDownContent } from "./ProfileDropDownContent";
import { useProfileData } from "@/hooks/useProfileData";

type Props = {
  ensName: string | undefined;
};

export const DesktopProfileDropDown = ({ ensName }: Props) => {
  const { address } = useAccount();
  const { setShouldHydrate } = useProfileData();

  return (
    <Popover className="relative cursor-auto">
      {({}) => {
        return (
          <>
            <Popover.Button
              className="flex outline-none"
              onClick={() => setShouldHydrate(true)}
            >
              <div className="text-primary flex items-center gap-3">
                <div className="w-6 h-6 shadow-newDefault rounded-full flex">
                  <ENSAvatar ensName={ensName} />
                </div>
                {address && <ENSName address={address} />}
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
                  <div className="bg-wash border border-line rounded-[16px] w-[350px] shadow-popover">
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
        );
      }}
    </Popover>
  );
};
