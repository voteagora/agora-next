import { css } from "@emotion/css";
import { ReactNode, useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Popover, Transition } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { ethers } from "ethers";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { HStack, VStack } from "../Layout/Stack";
import { icons } from "@/assets/icons/icons";
import ENSAvatar from "../shared/ENSAvatar";
import { pluralizeAddresses, shortAddress } from "@/lib/utils";
import Link from "next/link";
import TokenAmountDisplay from "../shared/TokenAmountDisplay";
import * as theme from "@/styles/theme";
import { Delegate } from "@/app/api/delegates/delegate";
import HumanAddress from "../shared/HumanAddress";
import styles from "./header.module.scss";
import Image from "next/image";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";

type Props = {
  ensName: string | undefined;
  delegate: Delegate | undefined;
};

const ValueWrapper = ({ children }: { children: ReactNode }) => (
  <div className={css(`font-size: ${theme.fontSize.base}`)}>{children}</div>
);

export const DesktopProfileDropDown = ({ ensName, delegate }: Props) => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const [balance, setBalance] = useState<bigint>();
  const hasStatement = !!delegate?.statement;

  useEffect(() => {
    if (!address) return;

    const getBalance = async () => {
      const balance = await OptimismContracts.token.contract.balanceOf(address);
      setBalance(balance);
    };

    getBalance();
  }, [address]);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={css`
              padding: ${theme.spacing[2]} ${theme.spacing[5]};
              outline: none;
            `}
          >
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
                className={css`
                  z-index: 10;
                  background: black;
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                `}
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
                <div
                  className={css`
                    background-color: ${theme.colors.white};
                    padding: ${theme.spacing[8]} ${theme.spacing[6]};
                    margin-top: ${theme.spacing[2]};
                    border-radius: ${theme.spacing[4]};
                    width: 350px;
                  `}
                >
                  <VStack
                    className={css`
                      gap: ${theme.spacing[3]};
                    `}
                  >
                    <HStack
                      className={css`
                        align-items: center;
                        gap: ${theme.spacing[2]};
                        margin-bottom: ${theme.spacing[1]};
                      `}
                    >
                      <div
                        className={css`
                          position: relative;
                          aspect-ratio: 1/1;
                        `}
                      >
                        <ENSAvatar
                          // className={css`
                          //   width: 44px;
                          //   height: 44px;
                          //   border-radius: 100%;
                          // `}
                          ensName={ensName}
                        />
                      </div>
                      <VStack
                        className={css`
                          flex: 1;
                        `}
                      >
                        {ensName ? (
                          <>
                            <span
                              className={css`
                                font-size: ${theme.fontSize.base};
                              `}
                            >
                              {ensName}
                            </span>
                            <span
                              className={css`
                                font-size: ${theme.fontSize.xs};
                                color: #4f4f4f;
                              `}
                            >
                              {shortAddress(address!)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={css`
                                font-size: ${theme.fontSize.base};
                              `}
                            >
                              {shortAddress(address!)}
                            </span>
                          </>
                        )}
                      </VStack>

                      <Image
                        src={icons.power}
                        onClick={() => {
                          disconnect();
                        }}
                        alt="Disconnect Wallet"
                        className={css`
                          width: 32px;
                          height: 32px;
                        `}
                      />
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
                            href={`/delegate/${delegate?.address}`}
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

                    <Link
                      href={`/statements/create`}
                      className={css`
                        border-radius: ${theme.borderRadius.lg};
                        border-width: ${theme.spacing.px};
                        padding: ${theme.spacing["3"]} ${theme.spacing["2"]};
                        color: ${theme.colors.gray["200"]};
                        background: ${theme.colors.black};
                        display: flex;
                        justify-content: center;
                        margin-top: ${theme.spacing[1]};
                        :hover {
                          background: ${theme.colors.gray["800"]};
                        }
                      `}
                    >
                      <div>
                        {hasStatement
                          ? "Edit delegate statement"
                          : "Create delegate statement"}
                      </div>
                    </Link>

                    {hasStatement && (
                      <Link
                        href={`/delegate/${ensName ?? address}`}
                        className={css`
                          border-radius: ${theme.borderRadius.lg};
                          border-width: ${theme.spacing.px};
                          padding: ${theme.spacing["3"]} ${theme.spacing["2"]};
                          color: ${theme.colors.black};
                          background: ${theme.colors.white};
                          margin-top: ${theme.spacing[1]};
                          display: flex;
                          justify-content: center;
                          :hover {
                            background: ${theme.colors.gray["800"]};
                            color: ${theme.colors.white};
                          }
                        `}
                      >
                        <div>View my profile</div>
                      </Link>
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
