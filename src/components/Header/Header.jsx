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
    console.log("toggle");
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="w-full h-[56px] sm:h-[92px] content-center rounded-full bg-wash border-line">
      <VStack className="px-4 sm:px-8">
        <HStack className="flex flex-row w-full items-center gap-1  justify-between">
          <HamburgerIcon
            className="w-[24px] h-[24px] sm:hidden cursor-pointer"
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

      {/* Mobile Navigation Menu */}
      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
