"use client";

import React, { useState } from "react";
import ENSAvatar from "../shared/ENSAvatar";
import { Drawer } from "../ui/Drawer";
import { ProfileDropDownContent } from "./ProfileDropDownContent";

type Props = {
  ensName: string | undefined;
};

export const MobileProfileDropDown = ({ ensName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDrawer = () => {
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative cursor-auto flex inline-flex">
      <button className="outline-none" onClick={handleOpenDrawer}>
        <ENSAvatar ensName={ensName} size={30} className="rounded-full" />
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        showCloseButton={false}
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
