"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import ENSAvatar from "../shared/ENSAvatar";
import { pluralizeAddresses, shortAddress } from "@/lib/utils";
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
                <ENSAvatar ensName={ensName || ""} />
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
                {({ close }) => (
                  <motion.div
                    className="bg-neutral py-8 px-6 rounded-t-lg w-full fixed bottom-0 left-0"
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={variants}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col gap-3 min-h-[325px] justify-center mb-10">
                      <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-2 mb-1">
                          <div
                            className={`relative aspect-square ${
                              isFetching && "animate-pulse"
                            }`}
                          >
                            <ENSAvatar ensName={ensName || ""} />
                          </div>
                          <div className="flex flex-col flex-1">
                            {ensName ? (
                              <>
                                <span className="text-primary">{ensName}</span>
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
                          <div
                            onClick={() => disconnect()}
                            className="bg-wash border border-line p-0.5 rounded-sm"
                          >
                            <PowerIcon
                              fill={rgbStringToHex(ui?.customization?.primary)}
                              className={"cursor-pointer"}
                            />
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

                      <PanelRow
                        title={
                          ui.tacticalStrings?.myBalance || "My token balance"
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
                        title="Delegated to"
                        detail={
                          <RowSkeletonWrapper isLoading={isFetching}>
                            <Link
                              href={`/delegates/${delegate?.address}`}
                              onClick={() => close()}
                              className="underline"
                            >
                              View more
                            </Link>
                          </RowSkeletonWrapper>
                        }
                      />

                      <PanelRow
                        title="My voting power"
                        detail={
                          <RowSkeletonWrapper isLoading={isFetching}>
                            <TokenAmountDecorated
                              amount={delegate?.votingPower.total || BigInt(0)}
                            />
                          </RowSkeletonWrapper>
                        }
                      />

                      <PanelRow
                        title="Delegated from"
                        detail={
                          <RowSkeletonWrapper isLoading={isFetching}>
                            {pluralizeAddresses(
                              Number(delegate?.numOfDelegators || 0)
                            )}
                          </RowSkeletonWrapper>
                        }
                      />

                      {isFetching ? (
                        <div className="animate-pulse bg-tertiary/10 h-[50px] mt-1 w-full rounded-2xl"></div>
                      ) : (
                        <>
                          {canCreateDelegateStatement && (
                            <>
                              {hasStatement ? (
                                <Link
                                  href={`/delegates/edit`}
                                  className="rounded-lg border border-line py-3 px-2 text-primary bg-wash flex justify-center mt-1 hover:bg-primary"
                                  onClick={() => close()}
                                >
                                  Edit delegate statement
                                </Link>
                              ) : (
                                <Link
                                  href={`/delegates/create`}
                                  className="rounded-lg border border-line py-3 px-2 text-primary bg-wash flex justify-center mt-1 hover:bg-primary"
                                  onClick={() => close()}
                                >
                                  Create delegate statement
                                </Link>
                              )}
                            </>
                          )}

                          {hasStatement && (
                            <Link
                              href={`/delegates/${ensName ?? address}`}
                              onClick={() => close()}
                              className="rounded-lg py-3 px-2 text-neutral bg-brandPrimary hover:bg-brandPrimary/90 mt-1 flex justify-center"
                            >
                              View my profile
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
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
