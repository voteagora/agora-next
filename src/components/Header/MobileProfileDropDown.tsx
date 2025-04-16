"use client";

import React, { useState } from "react";
import ENSAvatar from "../shared/ENSAvatar";
import { Drawer } from "../ui/Drawer";
import { ProfileDropDownContent } from "./ProfileDropDownContent";
import { useProfileData } from "@/hooks/useProfileData";

type Props = {
  ensName: string | undefined;
};

export const MobileProfileDropDown = ({ ensName }: Props) => {
  const { setShouldHydrate } = useProfileData();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDrawer = () => {
    setIsOpen(true);
    setShouldHydrate(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative cursor-auto">
      <button className="mt-1 outline-none" onClick={handleOpenDrawer}>
        <div className="w-[30px] h-[30px] rounded-full">
          <ENSAvatar ensName={ensName} />
        </div>
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
