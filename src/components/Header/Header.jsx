"use client";

// Header component
import { useState } from "react";

import Navbar from "./Navbar";
import { HStack, VStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import { ConnectButton } from "./ConnectButton";
import MobileNavMenu from "./MobileNavMenu";
import { HamburgerIcon } from "@/icons/HamburgerIcon";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="mx-auto max-w-[1280px] my-3 sm:my-4 px-3 sm:px-8">
      <VStack className="content-center rounded-full bg-wash border border-line p-2 shadow-newDefault">
        <HStack className="flex flex-row w-full items-center gap-1  justify-between">
          <HamburgerIcon
            className="w-[24px] h-[24px] sm:hidden cursor-pointer stroke-primary"
            onClick={toggleMobileMenu}
          />
          <div className="sm:w-full flex justify-start">
            <LogoLink />
          </div>
          <div className="w-full justify-center hidden sm:flex">
            <Navbar />
          </div>
          <div className="min-w-[24px] sm:w-full flex justify-end content-end">
            <ConnectButton />
          </div>
        </HStack>
      </VStack>

      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
