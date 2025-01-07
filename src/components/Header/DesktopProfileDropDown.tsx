import React, { ReactNode } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { icons } from "@/assets/icons/icons";
import ENSAvatar from "../shared/ENSAvatar";
import { pluralizeAddresses, shortAddress } from "@/lib/utils";
import Link from "next/link";
import TokenAmountDisplay from "../shared/TokenAmountDisplay";
import HumanAddress from "../shared/HumanAddress";
import Image from "next/image";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import Tenant from "@/lib/tenant/tenant";
import CreateProposalDraftButton from "../Proposals/ProposalsList/CreateProposalDraftButton";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { CubeIcon } from "@/icons/CubeIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { PowerIcon } from "@/icons/PowerIcon";

type Props = {
  ensName: string | undefined;
};

const ValueWrapper = ({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading: boolean;
}) =>
  isLoading ? (
    <div className="animate-pulse bg-primary/30 h-5 w-[90px] rounded-2xl"></div>
  ) : (
    <div className="text-primary">{children}</div>
  );

export const DesktopProfileDropDown = ({ ensName }: Props) => {
  const { namespace, ui } = Tenant.current();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { isLoading, delegate, balance } = useConnectedDelegate();

  const hasStatement = !!delegate?.statement;

  const canCreateDelegateStatement = ui.toggle("delegates/edit")?.enabled;
  const { data: scwAddress } = useSmartAccountAddress({ owner: address });

  return (
    <Popover className="relative cursor-auto">
      {({ open }) => (
        <>
          <Popover.Button className="flex outline-none">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 shadow-newDefault rounded-full">
                <ENSAvatar ensName={ensName} />
              </div>

              <HumanAddress address={address} />
            </div>
          </Popover.Button>

          {open && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                className="z-[60] bg-black fixed top-0 bottom-0 right-0 left-0"
              />
            </AnimatePresence>
          )}

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
                <div className="bg-neutral border border-line py-8 px-6 mt-4 mr-[-16px] rounded-xl w-[350px]">
                  <div className="flex flex-col gap-3 min-h-[250px] justify-center">
                    <div className="flex flex-col">
                      <div className="flex flex-row items-center">
                        <div
                          className={`relative aspect-square mr-4 ${
                            isLoading && "animate-pulse"
                          }`}
                        >
                          <ENSAvatar
                            className="w-[44px] h-[44px] rounded-full"
                            ensName={ensName}
                          />
                        </div>
                        <div className="flex flex-col justify-center">
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
                        <div className="ml-auto">
                          <div
                            onClick={() => disconnect()}
                            className="bg-wash border border-line p-0.5 rounded-sm"
                          >
                            <PowerIcon
                              fill={rgbStringToHex(ui.customization?.primary)}
                              className={"cursor-pointer"}
                            />
                          </div>
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
                                    ui.customization?.primary
                                  )}
                                />
                              </div>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="flex flex-row space-x-1 items-center">
                                  <div className="text-primary">
                                    {shortAddress(scwAddress)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs max-w-[250px] p-3">
                                  <div className="text-primary">
                                    Smart Contract Wallet
                                  </div>
                                  <div className="text-xs text-secondary font-light">
                                    Your SCW is where your governance power
                                    comes from. Your stkDRV tokens establish
                                    your voting power or how much you can
                                    delegate to another member.
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      )}
                    </div>

                    <PanelRow
                      title="My token balance"
                      detail={
                        <ValueWrapper isLoading={isLoading}>
                          <TokenAmountDisplay amount={balance || BigInt(0)} />
                        </ValueWrapper>
                      }
                    />

                    <PanelRow
                      title="Delegated to"
                      detail={
                        <ValueWrapper isLoading={isLoading}>
                          <Link
                            href={`/delegates/${delegate?.address}`}
                            onClick={() => close()}
                            className="underline"
                          >
                            View more
                          </Link>
                        </ValueWrapper>
                      }
                    />

                    <PanelRow
                      title="My voting power"
                      detail={
                        <ValueWrapper isLoading={isLoading}>
                          <TokenAmountDisplay
                            amount={delegate?.votingPower.total || BigInt(0)}
                          />
                        </ValueWrapper>
                      }
                    />

                    <PanelRow
                      title="Delegated from"
                      detail={
                        <ValueWrapper isLoading={isLoading}>
                          {pluralizeAddresses(
                            Number(delegate?.numOfDelegators || 0)
                          )}
                        </ValueWrapper>
                      }
                    />
                    {isLoading ? (
                      <div className="animate-pulse bg-primary/30 h-[50px] mt-1 w-full rounded-2xl"></div>
                    ) : (
                      <>
                        {canCreateDelegateStatement && (
                          <>
                            {hasStatement ? (
                              <Link
                                href={`/delegates/edit`}
                                className="rounded-lg py-3 px-2 border border-line bg-wash hover:bg-none text-primary flex justify-center mt-1"
                                onClick={() => close()}
                              >
                                Edit delegate statement
                              </Link>
                            ) : (
                              <Link
                                href={`/delegates/create`}
                                className="rounded-lg py-3 px-2 border border-line bg-wash hover:bg-none text-primary flex justify-center mt-1"
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
                            className="rounded-lg py-3 px-2 text-primary bg-brandPrimary hover:bg-brandPrimary/90 mt-1 flex justify-center"
                            onClick={() => close()}
                          >
                            View my profile
                          </Link>
                        )}
                        {/* little temporary hack for the manager to test secret links for users to create a draft */}
                        {namespace === TENANT_NAMESPACES.OPTIMISM &&
                          address && (
                            <CreateProposalDraftButton
                              address={address}
                              className="opacity-0 cursor-default hidden sm:block"
                            />
                          )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
