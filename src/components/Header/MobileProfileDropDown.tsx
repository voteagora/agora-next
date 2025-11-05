"use client";

import React, { useState } from "react";
import Tenant from "@/lib/tenant/tenant";

import ENSAvatar from "../shared/ENSAvatar";
import { Drawer } from "../ui/Drawer";
import { ProfileDropDownContent } from "./ProfileDropDownContent";
import EncourageDelegationDot from "./EncourageDelegationDot";

type Props = {
  ensName: string | undefined;
};

export const MobileProfileDropDown = ({ ensName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;

  const handleOpenDrawer = () => {
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    // Add a small delay to allow navigation to start before closing the drawer
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  return (
    <div className="relative cursor-auto flex inline-flex">
      <button className="mt-1 outline-none" onClick={handleOpenDrawer}>
        <div className="w-[30px] h-[30px] rounded-full relative">
          {isDelegationEncouragementEnabled && (
            <EncourageDelegationDot className="right-[-3px]" />
          )}
          <ENSAvatar ensName={ensName} size={30} className="rounded-full" />
        </div>
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        showCloseButton={true}
        className="bg-wash rounded-t-2xl"
      >
        <div className="flex flex-col min-h-[280px] justify-center">
          <ProfileDropDownContent
            ensName={ensName}
            handleCloseDrawer={handleCloseDrawer}
          />
        </div>
      </Drawer>
    </div>
  );
};
