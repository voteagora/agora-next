import { ReactNode } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { HStack, VStack } from "../Layout/Stack";
import { icons } from "@/assets/icons/icons";
import ENSAvatar from "../shared/ENSAvatar";
import { pluralizeAddresses, shortAddress } from "@/lib/utils";
import Link from "next/link";
import TokenAmountDisplay from "../shared/TokenAmountDisplay";
import HumanAddress from "../shared/HumanAddress";
import styles from "./header.module.scss";
import Image from "next/image";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";

type Props = {
  ensName: string | undefined;
};

const ValueWrapper = ({ children }: { children: ReactNode }) => (
  <div className={styles.desktop__wrapper}>{children}</div>
);

export const DesktopProfileDropDown = ({ ensName }: Props) => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { isLoading, delegate, balance } = useConnectedDelegate();
  const hasStatement = !!delegate?.statement;

  return (
    <Popover className="relative cursor-auto">
      {({ open }) => (
        <>
          <Popover.Button className="flex">
            <div className={styles.desktop_connect_button_inner}>
              <div className={styles.testing}>
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
                className={styles.desktop__animate}
              />
            </AnimatePresence>
          )}

          <Transition
            className="absolute right-0 z-10"
            enter="transition duration-00 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel>
              {({ close }) => (
                <div className={styles.desktop__popover_container}>
                  <VStack gap={3} className="min-h-[250px] justify-center">
                    {isLoading ? (
                      <AgoraLoaderSmall />
                    ) : (
                      <>
                        <HStack className={styles.desktop__popover_inside}>
                          <div className="relative aspect-square mr-4">
                            <ENSAvatar
                              className={styles.desktop__avatar}
                              ensName={ensName}
                            />
                          </div>
                          <VStack className="justify-center">
                            {ensName ? (
                              <>
                                <span className={styles.desktop__ens}>
                                  {ensName}
                                </span>
                                <span className={styles.desktop__address}>
                                  {shortAddress(address!)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className={styles.desktop__ens}>
                                  {shortAddress(address!)}
                                </span>
                              </>
                            )}
                          </VStack>
                          <div className="ml-auto">
                            <Image
                              src={icons.power}
                              onClick={() => {
                                disconnect();
                              }}
                              alt="Disconnect Wallet"
                              className="cursor-pointer"
                            />
                          </div>
                        </HStack>

                        <PanelRow
                          title="My token balance"
                          detail={
                            <ValueWrapper>
                              <TokenAmountDisplay
                                amount={balance || BigInt(0)}
                                decimals={18}
                                currency={"OP"}
                              />
                            </ValueWrapper>
                          }
                        />

                        <PanelRow
                          title="Delegated to"
                          detail={
                            <ValueWrapper>
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
                            <ValueWrapper>
                              <TokenAmountDisplay
                                amount={delegate?.votingPower || BigInt(0)}
                                decimals={18}
                                currency={"OP"}
                              />
                            </ValueWrapper>
                          }
                        />

                        <PanelRow
                          title="Delegated from"
                          detail={
                            <ValueWrapper>
                              {pluralizeAddresses(
                                Number(delegate?.numOfDelegators || 0)
                              )}
                            </ValueWrapper>
                          }
                        />
                        {hasStatement ? (
                          <Link
                            href={`/delegates/edit`}
                            className="rounded-lg border py-3 px-2 text-gray-200 bg-black flex justify-center mt-1 hover:bg-gray-800"
                            onClick={() => close()}
                          >
                            Edit delegate statement
                          </Link>
                        ) : (
                          <Link
                            href={`/delegates/create`}
                            className="rounded-lg border py-3 px-2 text-gray-200 bg-black flex justify-center mt-1 hover:bg-gray-800"
                            onClick={() => close()}
                          >
                            Create delegate statement
                          </Link>
                        )}
                        {hasStatement && (
                          <Link
                            href={`/delegates/${ensName ?? address}`}
                            className="rounded-lg border py-3 px-2 text-black bg-white mt-1 flex justify-center hover:bg-gray-800 hover:text-white"
                            onClick={() => close()}
                          >
                            View my profile
                          </Link>
                        )}
                      </>
                    )}
                  </VStack>
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
