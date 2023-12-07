"use client";

import { UserIcon } from "@heroicons/react/20/solid";
import { css } from "@emotion/css";
import { ReactNode } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
import * as theme from "@/styles/theme";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import HumanAddress from "@/components/shared/HumanAddress";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import Link from "next/link";
import { OptimismContracts } from "@/lib/contracts/contracts";
import styles from "./castVoteDialog.module.scss";

type Props = {
  proposalId: string;
  reason: string;
  supportType: SupportTextProps["supportType"];
  closeDialog: () => void;
  delegate: any;
  votingPower: string;
};

export type SupportTextProps = {
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
};

// TODO: Better rendering for users with no voting power
export function CastVoteDialog(props: Props) {
  return (
    <VStack alignItems="items-center">
      <div
        className={css`
          width: 100%;
          background: ${theme.colors.white};
          border-radius: ${theme.spacing["3"]};
          padding: ${theme.spacing["6"]};
          min-width: ${theme.maxWidth.sm};
        `}
      >
        <CastVoteDialogContents {...props} />
      </div>
    </VStack>
  );
}

function CastVoteDialogContents({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
}: Props) {
  const { address: accountAddress } = useAccount();
  const governorContract = OptimismContracts.governor;
  const { isLoading, isSuccess, write } = useContractWrite({
    address: governorContract.address as any,
    abi: governorContract.abi,
    functionName: "castVoteWithReason",
    args: [
      BigInt(proposalId),
      ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
      reason,
    ],
  });

  if (!delegate) {
    // todo: log
    return null;
  }

  return (
    <VStack
      gap={6}
      className={css`
        font-size: ${theme.fontSize["xs"]};
      `}
    >
      <VStack gap={2}>
        <HStack
          justifyContent="justify-between"
          className={css`
            font-weight: ${theme.fontWeight.semibold};
            line-height: ${theme.lineHeight.none};
          `}
        >
          <HStack
            className={css`
              color: ${theme.colors.black};
            `}
          >
            {delegate.address ? (
              <HumanAddress address={delegate.address} />
            ) : (
              "anonymous"
            )}
            <div className={`${styles["vote_" + supportType.toLowerCase()]}`}>
              &nbsp;voting {supportType.toLowerCase()}
            </div>
          </HStack>
          <HStack
            className={css`
              color: #66676b;
            `}
          >
            <div>
              <TokenAmountDisplay
                amount={votingPower}
                decimals={18}
                currency="OP"
              />
            </div>
            <div
              className={css`
                width: ${theme.spacing["4"]};
                height: ${theme.spacing["4"]};
              `}
            >
              <UserIcon />
            </div>
          </HStack>
        </HStack>
        <div
          className={css`
            color: ${theme.colors.gray["4f"]};
          `}
        >
          {reason ? reason : "No reason provided"}
        </div>
      </VStack>
      {isLoading && <LoadingVote />}
      {isSuccess && <SuccessMessage />}
      {!isLoading && !isSuccess && (
        <div>
          {delegate.statement ? (
            <HStack
              className={css`
                width: 100%;
                z-index: 1;
                position: relative;
                padding: ${theme.spacing["4"]};
                border-radius: ${theme.spacing["2"]};
                border: 1px solid ${theme.colors.gray.eb};
              `}
              justifyContent="justify-between"
              alignItems="items-center"
            >
              <VStack>
                <div
                  className={css`
                    font-weight: ${theme.fontWeight.semibold};
                  `}
                >
                  Using{" "}
                  <TokenAmountDisplay
                    amount={votingPower}
                    decimals={18}
                    currency="OP"
                  />
                </div>
                <div
                  className={css`
                    font-weight: ${theme.fontWeight.medium};
                    color: ${theme.colors.gray[700]};
                  `}
                >
                  Delegated to you
                </div>
              </VStack>
              <VoteButton onClick={write}>Vote</VoteButton>
            </HStack>
          ) : (
            <NoStatementView />
          )}
        </div>
      )}
    </VStack>
  );
}

const VoteButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={css`
        text-align: center;
        border-radius: ${theme.spacing["2"]};
        border: 1px solid ${theme.colors.gray.eb};
        font-weight: ${theme.fontWeight.semibold};
        font-size: ${theme.fontSize.xs};
        color: ${theme.colors.black};
        padding: ${theme.spacing["2"]} ${theme.spacing["6"]};
        cursor: pointer;

        ${!onClick &&
        css`
          background: ${theme.colors.gray.eb};
          color: ${theme.colors.gray["700"]};
          cursor: not-allowed;
        `}

        :hover {
          background: ${theme.colors.gray.eb};
        }
      `}
    >
      {children}
    </div>
  );
};

export function SuccessMessage() {
  return (
    <HStack
      justifyContent="justify-between"
      alignItems="items-center"
      className={css`
        width: 100%;
        z-index: 1;
        position: relative;
        padding: ${theme.spacing["4"]};
        border-radius: ${theme.spacing["2"]};
        border: 1px solid ${theme.colors.gray.eb};
      `}
    >
      <div
        className={css`
          font-weight: ${theme.fontWeight.medium};
        `}
      >
        Success! Your vote has been cast. It will appear once the transaction is
        confirmed.
      </div>
      <Image
        src={icons.ballot}
        alt={icons.ballot}
        className={css`
          height: 20px;
        `}
      />
    </HStack>
  );
}

export function LoadingVote() {
  return (
    <HStack
      justifyContent="justify-between"
      alignItems="items-center"
      className={css`
        width: 100%;
        z-index: 1;
        position: relative;
        padding: ${theme.spacing["4"]};
        border-radius: ${theme.spacing["2"]};
        border: 1px solid ${theme.colors.gray.eb};
      `}
    >
      <div
        className={css`
          font-weight: ${theme.fontWeight.medium};
        `}
      >
        Writing your vote to the chain
      </div>
      <Image src={icons.spinner} alt={"spinner"} />
    </HStack>
  );
}

export function NoStatementView() {
  return (
    <VStack
      className={css`
        width: 100%;
        z-index: 1;
        position: relative;
        padding: ${theme.spacing["4"]};
        border-radius: ${theme.spacing["2"]};
        border: 1px solid ${theme.colors.gray.eb};
      `}
    >
      You do not have a delegate statement.{" "}
      <Link
        href={"/statements/create"}
        className={css`
          text-decoration: underline;
        `}
      >
        Please set one up in order to vote.
      </Link>
    </VStack>
  );
}
