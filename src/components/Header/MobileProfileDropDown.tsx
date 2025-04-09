"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import ENSAvatar from "../shared/ENSAvatar";
import { shortAddress } from "@/lib/utils";
import Link from "next/link";
import TokenAmountDecorated from "../shared/TokenAmountDecorated";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";
import Tenant from "@/lib/tenant/tenant";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { CubeIcon } from "@/icons/CubeIcon";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { PowerIcon } from "@/icons/PowerIcon";
import { useDelegate } from "@/hooks/useDelegate";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Logout } from "@/icons/logout";
import { createPortal } from "react-dom";

type Props = {
  ensName: string | undefined;
};

// Add your variants
const variants = {
  hidden: { y: "100%" },
  show: { y: "0%" },
  exit: { y: "100%" },
};

export const MobileProfileDropDown = ({ ensName }: Props) => {
  const { ui } = Tenant.current();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  // Don't hydrate the component until the user clicks on the profile dropdown
  const [shouldHydrate, setShouldHydrate] = useState(false);
  const isSmartAccountEnabled = ui?.smartAccountConfig?.factoryAddress;

  // The hook is called only when the component should be hydrated
  // Once the delegate is loaded

  // - if smart account is enabled
  // --- load smart account address
  // --- load balance of the smart account wallet

  // - if smart account is not enabled
  // --- load balance of the EOA
  const { data: delegate, isFetching } = useDelegate({
    address: shouldHydrate ? address : undefined,
  });

  // Load SCW address if delegate is loaded and smart accounts enabled
  const { data: scwAddress } = useSmartAccountAddress({
    owner: delegate ? (isSmartAccountEnabled ? address : undefined) : undefined,
  });

  // Load EOA token balance if delegate is loaded and scw not enabled
  const { data: tokenBalance } = useTokenBalance(
    delegate ? (isSmartAccountEnabled ? scwAddress : address) : undefined
  );

  const hasStatement = !!delegate?.statement;
  const canCreateDelegateStatement =
    ui?.toggle("delegates/edit")?.enabled === true;

  return (
    <Popover className="relative cursor-auto">
      {({ open }) => {
        return (
          <>
            <Popover.Button
              className="mt-1 outline-none"
              onClick={() => setShouldHydrate(true)}
            >
              <div className="w-6 h-6 shadow-newDefault rounded-full">
                <ENSAvatar ensName={ensName} />
              </div>
            </Popover.Button>

            {open && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  className={
                    "z-[60] bg-black fixed top-0 left-0 right-0 bottom-0"
                  }
                />
              </AnimatePresence>
            )}

            <Transition className="absolute z-[70]">
              <Popover.Panel>
                {({ close }) =>
                  createPortal(
                    <motion.div
                      className="bg-neutral py-8 px-6 rounded-t-lg w-full fixed z-[70] bottom-0 left-0"
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      variants={variants}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col gap-3 min-h-[280px] justify-center">
                        <div className="flex flex-col">
                          <div className="flex flex-row items-center gap-4 mb-1">
                            <div
                              className={`relative aspect-square ${
                                isFetching && "animate-pulse"
                              }`}
                            >
                              <ENSAvatar ensName={ensName} />
                            </div>
                            <div className="flex flex-col flex-1">
                              {ensName ? (
                                <>
                                  <span className="text-primary">
                                    {ensName}
                                  </span>
                                  <span className="text-xs text-secondary">
                                    {shortAddress(address!)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-primary">
                                    {shortAddress(address!)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {scwAddress && (
                            <div>
                              <div className="w-[44px] flex justify-center items-center">
                                <div className="border-l border-dashed border-line h-2"></div>
                              </div>
                              <div className="flex flex-row items-center gap-3">
                                <div className="w-[44px] flex justify-center items-center">
                                  <div className="flex items-center justify-center rounded-full border border-line w-[30px] h-[30px]">
                                    <CubeIcon
                                      className="w-5 h-5"
                                      fill={rgbStringToHex(
                                        ui?.customization?.primary
                                      )}
                                    />
                                  </div>
                                </div>
                                <div className="text-primary">
                                  {shortAddress(scwAddress)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="self-stretch py-8 flex flex-col gap-6">
                          <PanelRow
                            title={
                              ui.tacticalStrings?.myBalance ||
                              "My token balance"
                            }
                            detail={
                              <RowSkeletonWrapper isLoading={isFetching}>
                                <TokenAmountDecorated
                                  amount={tokenBalance || BigInt(0)}
                                />
                              </RowSkeletonWrapper>
                            }
                          />
                          <PanelRow
                            title="My voting power"
                            detail={
                              <RowSkeletonWrapper isLoading={isFetching}>
                                <TokenAmountDecorated
                                  amount={
                                    delegate?.votingPower.total || BigInt(0)
                                  }
                                />
                              </RowSkeletonWrapper>
                            }
                          />

                          {isFetching ? (
                            <div className="animate-pulse bg-tertiary/10 h-[50px] mt-1 w-full rounded-2xl"></div>
                          ) : (
                            <>
                              {canCreateDelegateStatement && !hasStatement && (
                                <Link
                                  href={`/delegates/create`}
                                  className="rounded-lg py-3 px-2 bg-brandPrimary hover:bg-none text-neutral flex justify-center mt-1"
                                  onClick={() => close()}
                                >
                                  Create delegate statement
                                </Link>
                              )}

                              {hasStatement && (
                                <Link
                                  href={`/delegates/${ensName ?? address}`}
                                  onClick={() => close()}
                                  className="px-5 py-3 rounded-lg shadow-[0px_2px_2px_0px_rgba(0,0,0,0.03)] border border-neutral-200 flex justify-center"
                                >
                                  <span className="text-primary text-base font-semibold">
                                    View my profile
                                  </span>
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                        <div className="py-4 border-t border-line bg-neutral rounded-[0px_0px_12px_12px]">
                          <div
                            onClick={() => disconnect()}
                            className="cursor-pointer flex"
                          >
                            <Logout
                              fill={rgbStringToHex(ui?.customization?.primary)}
                              className={"mr-[10px] self-center"}
                            />
                            <span className="text-primary">Logout</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>,
                    document.body
                  )
                }
              </Popover.Panel>
            </Transition>
          </>
        );
      }}
    </Popover>
  );
};

const RowSkeletonWrapper = ({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading: boolean;
}) =>
  isLoading ? (
    <div className="animate-pulse bg-tertiary/10 h-5 w-[90px] rounded-2xl"></div>
  ) : (
    <div className="text-primary">{children}</div>
  );
