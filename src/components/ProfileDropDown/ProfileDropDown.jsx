"use client";

import { HStack, VStack } from "../Layout/Stack";
import { useEffect, useState } from "react";
import { TokenAmountDisplay } from "@/lib/utils";
import { icons } from "@/icons/icons";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { pluralizeAddresses, shortAddress } from "@/lib/utils";
import { Popover } from "@headlessui/react";
import ENSAvatar from "../shared/ENSAvatar";
import { PanelRow } from "../shared/PanelRow/PanelRow";
import { useDisconnect } from "wagmi";
import HumanAddress from "../shared/HumanAddress";
import { AnimatePresence, motion } from "framer-motion";
import { isAddressEqual } from "viem";
import { useSIWE } from "connectkit";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProfileDropDownTransition } from "./ProfileDropDownTransition";

const ValueWrapper = ({ children }) => (
  <div className="text-base">{children}</div>
);

export const ProfileDropDown = ({
  address,
  ensName,
  delegate,
  handleSignOut,
}) => {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { isSignedIn, signIn } = useSIWE();
  const [canSignin, setCanSignin] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      fetch(`${process.env.PUBLIC_URL}/api/auth/can-signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      }).then(async (res) => {
        const result = await res.json();
        setCanSignin(result.canSignin ?? false);
      });
    }
  });

  const navigateAndClosePopover = (href, close) => {
    close();
    router.push(href);
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="outline-none mt-1 md:mt-auto md:py-2 md:px-5">
            <HStack className="items-center flex md:hidden" gap="1">
              <Image
                height="24"
                width="24"
                className="opacity-[1]"
                src={icons.walletConnected}
                alt="connect wallet button"
              />
            </HStack>
            <HStack gap="1" className="items-center hidden md:flex">
              {isSignedIn ? (
                <Image
                  height="24"
                  width="24"
                  className="-ml-2"
                  src={icons.badge}
                  alt="badge symbol"
                />
              ) : (
                <div className="w-1 h-1 radius-full bg-[#23b100]" />
              )}
              <div>{ensName ? ensName : shortAddress(address ?? "")}</div>

              <ChevronDownIcon
                aria-hidden="true"
                className="opacity-30 w-4 h-4"
              />
            </HStack>
          </Popover.Button>

          {open && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                className="z-10 bg-black fixed inset-0"
              />
            </AnimatePresence>
          )}

          <ProfileDropDownTransition>
            <Popover.Panel>
              {({ close }) => (
                <div className="fixed md:relative bottom-0 left-0 rounded-tl-[1rem] rounded-tr-[1rem] md:rounded-[1rem] bg-white py-7 px-6 mt-2 w-[100vw] md:w-[350px]">
                  <VStack className="gap-3">
                    <HStack className="items-center gap-2 mb-1">
                      <div className="relative aspect-w-1 aspect-h-1">
                        {isSignedIn && (
                          <Image
                            className="absolute z-[1] -bottom-[2px] -right-[2px] md:-bottom-[5px] md:-right-[7px]"
                            width="24"
                            heoght="24"
                            src={icons.badge}
                            alt="badge symbol"
                          />
                        )}
                        <ENSAvatar
                          className="rounded-full w-[51px] h-[51px] md:w-[44px] md:h-[44px]"
                          fragment={delegate.address.resolvedName}
                        />
                      </div>
                      <VStack className="flex-1">
                        {delegate.address.resolvedName.name ? (
                          <>
                            <span className="text-base">{ensName}</span>
                            <span className="text-base md:text-xs text-black md:text-[#4f4f4f]">
                              {shortAddress(
                                delegate.address.resolvedName.address
                              )}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-base">
                              {shortAddress(
                                delegate.address.resolvedName.address
                              )}
                            </span>
                          </>
                        )}
                      </VStack>

                      <Image
                        src={icons.power}
                        onClick={(e) => {
                          handleSignOut && handleSignOut();
                          disconnect();
                        }}
                        alt="Disconnect Wallet"
                        width="32"
                        height="32"
                        className="mr-[5px] md:mr-auto"
                      />
                    </HStack>

                    <PanelRow
                      title="My token balance"
                      detail={
                        <ValueWrapper>
                          {TokenAmountDisplay(
                            delegate.amountOwned.amount,
                            18,
                            "OP"
                          )}
                        </ValueWrapper>
                      }
                    />

                    <PanelRow
                      title="Delegated to"
                      detail={
                        <ValueWrapper>
                          {isAddressEqual(
                            delegate.delegatingTo.address.resolvedName.address,
                            "0x0000000000000000000000000000000000000000"
                          ) ? (
                            "N/A"
                          ) : (
                            <HumanAddress
                              address={
                                delegate.delegatingTo.address.resolvedName
                                  .address
                              }
                            />
                          )}
                        </ValueWrapper>
                      }
                    />

                    <PanelRow
                      title="My voting power"
                      detail={
                        <ValueWrapper>
                          {TokenAmountDisplay(
                            delegate.tokensRepresented.amount,
                            18,
                            "OP"
                          )}
                        </ValueWrapper>
                      }
                    />

                    <PanelRow
                      title="Delegated from"
                      detail={
                        <ValueWrapper>
                          {pluralizeAddresses(
                            delegate.delegateMetrics
                              .tokenHoldersRepresentedCount ?? 0
                          )}
                        </ValueWrapper>
                      }
                    />

                    {!isSignedIn && canSignin && (
                      <div>
                        <button
                          className="w-full rounded-lg border py-3 px-2 text-gray-200 bg-black flex justify-center mt-1 hover:bg-gray-800"
                          onClick={() => signIn()}
                        >
                          <div>Sign in as badgeholder</div>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        navigateAndClosePopover("/statements/create", close)
                      }
                      className="rounded-lg border py-3 px-2 text-gray-200 bg-black flex justify-center mt-1 hover:bg-gray-800"
                    >
                      {delegate.statement
                        ? "Edit delegate statement"
                        : "Create delegate statement"}
                    </button>

                    {isSignedIn && (
                      <button
                        // TODO: check this route exists
                        onClick={() =>
                          navigateAndClosePopover("/retroPGF/3/ballot", close)
                        }
                        className="rounded-lg border py-3 px-2 text-black bg-white mt-1 hidden md:flex justify-center hover:bg-gray-800 hover:text-white"
                      >
                        View my ballot
                      </button>
                    )}

                    {delegate.statement && (
                      <button
                        onClick={() =>
                          navigateAndClosePopover(
                            `/delegates/${
                              delegate.address.resolvedName.name ??
                              delegate.address.resolvedName.address
                            }`,
                            close
                          )
                        }
                        className="rounded-lg border py-3 px-2 text-black bg-white mt-1 flex justify-center hover:bg-gray-800 hover:text-white"
                      >
                        View my profile
                      </button>
                    )}
                  </VStack>
                </div>
              )}
            </Popover.Panel>
          </ProfileDropDownTransition>
        </>
      )}
    </Popover>
  );
};
