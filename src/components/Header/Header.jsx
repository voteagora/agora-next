"use client";

// Header component
import { useState } from "react";

import Navbar from "./Navbar";
import { HStack, VStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import { ConnectButton } from "./ConnectButton";
import MobileNavMenu from "./MobileNavMenu";
import { HamburgerIcon } from "@/icons/HamburgerIcon";
import Tenant from "@/lib/tenant/tenant";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { ui } = Tenant.current();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="mx-auto max-w-[1280px] my-3 sm:my-4 px-3 sm:px-8">
      <VStack className="content-center rounded-full border border-line p-2 shadow-newDefault bg-headerBackground">
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
