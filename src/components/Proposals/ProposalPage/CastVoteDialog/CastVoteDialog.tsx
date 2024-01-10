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
  return <CastVoteDialogContents {...props} />;
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
    <VStack gap={4} className={styles.full_width}>
      <HStack justifyContent="justify-between">
        <VStack>
          {delegate.address ? (
            <div className={styles.subtitle}>
              <HumanAddress address={delegate.address} />
            </div>
          ) : (
            <div className={styles.subtitle}>Anonymous</div>
          )}
          <div className={styles.title}>
            Casting vote&nbsp;{supportType.toLowerCase()}
          </div>
        </VStack>
        <VStack alignItems="items-end">
          <div className={styles.subtitle}>with</div>
          <TokenAmountDisplay
            amount={votingPower}
            decimals={18}
            currency="OP"
          />
        </VStack>
      </HStack>
      <div className={styles.reason_box}>
        {reason ? (
          <div className={styles.has_reason}>reason</div>
        ) : (
          <div className={styles.no_reason}>No voting reason provided</div>
        )}
      </div>
      {isLoading && <LoadingVote />}
      {isSuccess && <SuccessMessage />}
      {!isLoading && !isSuccess && (
        <div>
          {delegate.statement ? (
            <VoteButton onClick={write}>
              Vote {supportType.toLowerCase()} with{" "}
              <TokenAmountDisplay
                amount={votingPower}
                decimals={18}
                currency="OP"
              />
            </VoteButton>
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
    <HStack justifyContent="justify-between" alignItems="items-center">
      <div>
        Success! Your vote has been cast. It will appear once the transaction is
        confirmed.
      </div>
      <Image src={icons.ballot} alt={icons.ballot} className="h-5" />
    </HStack>
  );
}

export function LoadingVote() {
  return (
    <HStack justifyContent="justify-between" alignItems="items-center">
      <div>Writing your vote to the chain</div>
      <Image src={icons.spinner} alt={"spinner"} />
    </HStack>
  );
}

export function NoStatementView() {
  return (
    <div className={styles.note_to_user}>
      You do not have a delegate statement.{" "}
      <Link href={"/statements/create"} className="underline">
        Please set one up to vote.
      </Link>
    </div>
  );
}
