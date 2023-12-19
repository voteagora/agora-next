"use client";

import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import React, { ReactNode, useEffect, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { ethers } from "ethers";
import Image from "next/image";
import { HStack, VStack } from "../Layout/Stack";
import { icons } from "@/assets/icons/icons";
import ENSAvatar from "../shared/ENSAvatar";
import { pluralizeAddresses, shortAddress } from "@/lib/utils";
import Link from "next/link";
import HumanAddress from "../shared/HumanAddress";
import TokenAmountDisplay from "../shared/TokenAmountDisplay";
import styles from "./header.module.scss";
import { PanelRow } from "../Delegates/DelegateCard/DelegateCard";
import { Delegate } from "@/app/api/delegates/delegate";
import { OptimismContracts } from "@/lib/contracts/contracts";

type Props = {
  ensName: string | undefined;
  delegate: Delegate | undefined;
};

// Add your variants
const variants = {
  hidden: { y: "100%" },
  show: { y: "0%" },
  exit: { y: "100%" },
};

const MobileValueWrapper = ({ children }: { children: ReactNode }) => (
  <div className={css(`font-size: ${theme.fontSize.base}`)}>{children}</div>
);

export const MobileProfileDropDown = ({ ensName, delegate }: Props) => {
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
              margin-top: ${theme.spacing[1]};
              outline: none;
            `}
          >
            <div className={styles.testing}>
              <ENSAvatar ensName={ensName} />
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

          <Transition className="absolute z-10">
            <Popover.Panel>
              {({ close }) => (
                <motion.div
                  className={css`
                    background-color: ${theme.colors.white};
                    padding: ${theme.spacing[8]} ${theme.spacing[6]};
                    border-top-left-radius: ${theme.spacing[4]};
                    border-top-right-radius: ${theme.spacing[4]};
                    width: 100vw;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                  `}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={variants}
                  transition={{ duration: 0.2 }}
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
                        <ENSAvatar ensName={ensName} />
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
                        onClick={() => disconnect()}
                        alt="Disconnect Wallet"
                        className={css`
                          width: 32px;
                          height: 32px;
                          margin-right: 5px;
                        `}
                      />
                    </HStack>

                    <PanelRow
                      title="My token balance"
                      detail={
                        <MobileValueWrapper>
                          <TokenAmountDisplay
                            amount={balance || BigInt(0)}
                            decimals={18}
                            currency={"OP"}
                          />
                        </MobileValueWrapper>
                      }
                    />

                    {/* <PanelRow
                      title="Delegated to"
                      detail={
                        <MobileValueWrapper>
                          {delegate.delegatingTo.address.resolvedName
                            .address === ethers.constants.AddressZero ? (
                            "N/A"
                          ) : (
                            <HumanAddress
                              resolvedName={
                                delegate.delegatingTo.address.resolvedName
                              }
                            />
                          )}
                        </MobileValueWrapper>
                      }
                    /> */}

                    <PanelRow
                      title="My voting power"
                      detail={
                        <MobileValueWrapper>
                          <TokenAmountDisplay
                            amount={delegate?.votingPower || BigInt(0)}
                            decimals={18}
                            currency={"OP"}
                          />
                        </MobileValueWrapper>
                      }
                    />

                    <PanelRow
                      title="Delegated from"
                      detail={
                        <MobileValueWrapper>
                          {pluralizeAddresses(
                            Number(delegate?.numOfDelegators || 0)
                          )}
                        </MobileValueWrapper>
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
                </motion.div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
