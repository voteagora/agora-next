"use client";

import { UserIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
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
      <div className={styles.container}>
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
    <VStack gap={6} className={styles.font_size}>
      <VStack gap={2}>
        <HStack justifyContent="justify-between" className={styles.sub}>
          <HStack className={styles.text_container}>
            {delegate.address ? (
              <HumanAddress address={delegate.address} />
            ) : (
              "anonymous"
            )}
            <div className={`${styles["vote_" + supportType.toLowerCase()]}`}>
              &nbsp;voting {supportType.toLowerCase()}
            </div>
          </HStack>
          <HStack className={styles.token_amount}>
            <div>
              <TokenAmountDisplay
                amount={votingPower}
                decimals={18}
                currency="OP"
              />
            </div>
            <div className={styles.user_icon}>
              <UserIcon />
            </div>
          </HStack>
        </HStack>
        <div className={styles.reason}>
          {reason ? reason : "No reason provided"}
        </div>
      </VStack>
      {isLoading && <LoadingVote />}
      {isSuccess && <SuccessMessage />}
      {!isLoading && !isSuccess && (
        <div>
          {delegate.statement ? (
            <HStack
              className={styles.statement}
              justifyContent="justify-between"
              alignItems="items-center"
            >
              <VStack>
                <div className={styles.statement_text}>
                  Using{" "}
                  <TokenAmountDisplay
                    amount={votingPower}
                    decimals={18}
                    currency="OP"
                  />
                </div>
                <div className={styles.delegate_text}>Delegated to you</div>
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
      className={`${styles.vote_container}${" "}
        ${!onClick && styles.disabled}
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
      className={styles.success}
    >
      <div className={styles.font_weight}>
        Success! Your vote has been cast. It will appear once the transaction is
        confirmed.
      </div>
      <Image src={icons.ballot} alt={icons.ballot} className="h-5" />
    </HStack>
  );
}

export function LoadingVote() {
  return (
    <HStack
      justifyContent="justify-between"
      alignItems="items-center"
      className={styles.loading_vote}
    >
      <div className={styles.font_weight}>Writing your vote to the chain</div>
      <Image src={icons.spinner} alt={"spinner"} />
    </HStack>
  );
}

export function NoStatementView() {
  return (
    <VStack className={styles.no_statement}>
      You do not have a delegate statement.{" "}
      <Link href={"/statements/create"} className="underline">
        Please set one up in order to vote.
      </Link>
    </VStack>
  );
}
