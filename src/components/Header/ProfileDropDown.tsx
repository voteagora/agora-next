import { css } from "@emotion/css";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useFragment, graphql } from "react-relay";
import React, { ReactNode } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useDisconnect } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { BigNumber } from "ethers";

import * as theme from "../theme";
import { inset0 } from "../theme";
import { shortAddress } from "../utils/address";
import { icons } from "../icons/icons";

import { HStack, VStack } from "./VStack";
import { Link } from "./HammockRouter/Link";
import { PanelRow } from "./VoterPanel/Rows/PanelRow";
import { NounResolvedName } from "./NounResolvedName";
import { NounGridChildren } from "./NounGrid";
import { ProfileDropDownContentsFragment$key } from "./__generated__/ProfileDropDownContentsFragment.graphql";
import { ProfileDropDownFragment$key } from "./__generated__/ProfileDropDownFragment.graphql";
import { ProfileDropDownButtonFragment$key } from "./__generated__/ProfileDropDownButtonFragment.graphql";

function ProfileDropDownContents({
  close,
  fragmentRef,
}: {
  close: () => void;
  fragmentRef: ProfileDropDownContentsFragment$key;
}) {
  const { disconnect } = useDisconnect();

  const delegate = useFragment(
    graphql`
      fragment ProfileDropDownContentsFragment on Delegate {
        address {
          resolvedName {
            name
            address
          }
        }

        statement {
          __typename
        }

        nounsOwned {
          # eslint-disable-next-line relay/unused-fields
          id
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...NounImageFragment
        }

        tokensRepresented {
          amount {
            amount
          }
        }

        nounsRepresented {
          # eslint-disable-next-line relay/unused-fields
          id
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...NounImageFragment
        }

        liquidRepresentation(filter: { currentlyActive: true }) {
          # eslint-disable-next-line relay/unused-fields
          proxy {
            nounsRepresented {
              id
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...NounImageFragment
            }
          }
        }

        tokensOwned {
          amount {
            amount
          }
        }
      }
    `,
    fragmentRef
  );

  const hasDelegateStatement = !!delegate.statement;
  const totalNounsDelegated =
    delegate.liquidRepresentation.length + delegate.nounsRepresented.length;

  return (
    <div
      className={css`
        background-color: ${theme.colors.white};
        padding: ${theme.spacing["8"]} ${theme.spacing["6"]};
        margin-top: ${theme.spacing[2]};
        border-radius: ${theme.spacing[4]};
        width: 350px;
      `}
    >
      <VStack gap="3">
        <HStack
          gap="2"
          className={css`
            align-items: center;
            margin-bottom: ${theme.spacing[1]};
          `}
        >
          <VStack
            className={css`
              flex: 1;
            `}
          >
            {delegate.address.resolvedName.name ? (
              <>
                <span
                  className={css`
                    font-size: ${theme.fontSize.base};
                    font-weight: ${theme.fontWeight.medium};
                  `}
                >
                  {delegate.address.resolvedName.name}
                </span>
                <span
                  className={css`
                    font-size: ${theme.fontSize.xs};
                    font-weight: ${theme.fontWeight.medium};
                    color: ${theme.colors.gray[700]};
                  `}
                >
                  {shortAddress(delegate.address.resolvedName.address)}
                </span>
              </>
            ) : (
              <>
                <span
                  className={css`
                    font-size: ${theme.fontSize.base};
                  `}
                >
                  {shortAddress(delegate.address.resolvedName.address)}
                </span>
              </>
            )}
          </VStack>

          <img
            src={icons.power}
            onClick={() => disconnect()}
            alt="Disconnect Wallet"
            className={css`
              cursor: pointer;
              width: 32px;
              height: 32px;
            `}
          />
        </HStack>

        <VStack gap="2">
          <PanelRow
            title="My nouns"
            detail={
              BigNumber.from(delegate.tokensOwned.amount.amount).toNumber() ? (
                <ValueWrapper>
                  <HStack gap="1">
                    <NounGridChildren
                      liquidRepresentation={[]}
                      totalNouns={BigNumber.from(
                        delegate.tokensOwned.amount.amount
                      ).toNumber()}
                      count={5}
                      nouns={delegate.nounsOwned}
                      overflowFontSize="xs"
                      imageSize="6"
                    />
                  </HStack>
                </ValueWrapper>
              ) : (
                <div
                  className={css`
                    color: ${theme.colors.gray[700]};
                    font-size: ${theme.fontSize.base};
                  `}
                >
                  None
                </div>
              )
            }
          />

          <PanelRow
            title="My voting power"
            detail={
              totalNounsDelegated ? (
                <ValueWrapper>
                  <HStack gap="1">
                    <NounGridChildren
                      liquidRepresentation={delegate.liquidRepresentation}
                      totalNouns={BigNumber.from(
                        delegate.tokensRepresented.amount.amount
                      ).toNumber()}
                      count={5}
                      nouns={delegate.nounsRepresented}
                      overflowFontSize="xs"
                      imageSize="6"
                    />
                  </HStack>
                </ValueWrapper>
              ) : (
                <div
                  className={css`
                    color: ${theme.colors.gray[700]};
                    font-size: ${theme.fontSize.base};
                  `}
                >
                  None
                </div>
              )
            }
          />
        </VStack>

        <VStack gap="1">
          <Link to="/create" className={linkStyles(true)} afterUpdate={close}>
            <div>
              {hasDelegateStatement
                ? "Edit delegate statement"
                : "Create delegate statement"}
            </div>
          </Link>

          <Link
            to={`/delegate/${
              delegate.address.resolvedName.name ??
              delegate.address.resolvedName.address
            }`}
            className={linkStyles(false)}
            afterUpdate={close}
          >
            <div>View my profile</div>
          </Link>
        </VStack>
      </VStack>
    </div>
  );
}

function ProfileDropDownButton({
  fragmentRef,
}: {
  fragmentRef: ProfileDropDownButtonFragment$key;
}) {
  const delegate = useFragment(
    graphql`
      fragment ProfileDropDownButtonFragment on Delegate {
        address {
          resolvedName {
            ...NounResolvedNameFragment
          }
        }
      }
    `,
    fragmentRef
  );

  return (
    <Popover.Button
      className={css`
        padding: ${theme.spacing[2]} ${theme.spacing[5]};
        outline: none;
        cursor: pointer;
      `}
    >
      <HStack alignItems="center" gap="1">
        <div
          className={css`
            width: 6px;
            height: 6px;
            border-radius: ${theme.borderRadius.full};
            background-color: #23b100;
            position: relative;
            top: 1px;
            margin-right: ${theme.spacing[1]};
          `}
        />

        <NounResolvedName resolvedName={delegate.address.resolvedName} />

        <ChevronDownIcon
          aria-hidden="true"
          className={css`
            opacity: 30%;
            width: ${theme.spacing["4"]};
            height: ${theme.spacing["4"]};
          `}
        />
      </HStack>
    </Popover.Button>
  );
}

function linkStyles(isPrimary: boolean) {
  return css`
    border-radius: ${theme.borderRadius.lg};
    border-width: ${theme.spacing.px};
    padding: ${theme.spacing["3"]} ${theme.spacing["2"]};
    color: ${theme.colors.gray["200"]};
    background: ${theme.colors.black};
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing[1]};

    ${isPrimary
      ? css`
          background: ${theme.colors.black};
          color: ${theme.colors.white};
        `
      : css`
          background: ${theme.colors.white};
          color: ${theme.colors.black};
        `}

    :hover {
      background: ${theme.colors.gray["800"]};
      color: ${theme.colors.white};
    }
  `;
}

const ValueWrapper = ({ children }: { children: ReactNode }) => (
  <div className={css(`font-size: ${theme.fontSize.base}`)}>{children}</div>
);

export const ProfileDropDown = ({
  fragment,
}: {
  fragment: ProfileDropDownFragment$key;
}) => {
  const delegate = useFragment(
    graphql`
      fragment ProfileDropDownFragment on Delegate {
        ...ProfileDropDownButtonFragment
        ...ProfileDropDownButtonFragment
        ...ProfileDropDownContentsFragment
      }
    `,
    fragment
  );

  return (
    <Popover
      className={css`
        position: relative;
      `}
    >
      {({ open }) => (
        <>
          <ProfileDropDownButton fragmentRef={delegate} />

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
                  ${inset0};
                `}
              />
            </AnimatePresence>
          )}

          <Transition
            className="absolute z-10 right-0"
            enter="transition duration-00 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel>
              {({ close }) => (
                <ProfileDropDownContents close={close} fragmentRef={delegate} />
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
