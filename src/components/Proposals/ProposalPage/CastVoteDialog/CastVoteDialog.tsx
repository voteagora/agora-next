"use client";

import { ReactNode } from "react";
import { useAccount } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import HumanAddress from "@/components/shared/HumanAddress";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import Link from "next/link";
import styles from "./castVoteDialog.module.scss";
import useAdvancedVoting from "../../../../hooks/useAdvancedVoting";
import { CastVoteDialogProps } from "@/components/Dialogs/DialogProvider/dialogs";
import { Button } from "@/components/ui/button";
import { getVpToDisplay } from "@/lib/voteUtils";

export type SupportTextProps = {
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
};

// TODO: Better rendering for users with no voting power
export function CastVoteDialog(props: CastVoteDialogProps) {
  return <CastVoteDialogContents {...props} />;
}

function CastVoteDialogContents({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
  authorityChains,
  missingVote,
}: CastVoteDialogProps) {
  const { write, isLoading, isSuccess } = useAdvancedVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
    standardVP: BigInt(votingPower.directVP),
    advancedVP: BigInt(votingPower.advancedVP),
    authorityChains,
    reason,
    missingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  if (!delegate) {
    // todo: log
    return null;
  }

  return (
    <VStack gap={4} className={styles.dialog_container}>
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
            amount={vpToDisplay}
            decimals={18}
            currency="OP"
          />
        </VStack>
      </HStack>
      <div className={styles.reason_box}>
        {reason ? (
          <div className={styles.has_reason}>{reason}</div>
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
              Vote {supportType.toLowerCase()} with{"\u00A0"}
              <TokenAmountDisplay
                amount={vpToDisplay}
                decimals={18}
                currency="OP"
              />
            </VoteButton>
          ) : (
            <NoStatementView closeDialog={closeDialog} />
          )}
        </div>
      )}
      {missingVote === "BOTH" && <AdvancedVoteAlert />}
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
    <Button onClick={onClick} className="w-full">
      {children}
    </Button>
  );
};

export function AdvancedVoteAlert() {
  return (
    <div className={styles.alert}>
      To cast your vote, you will be requested to sign two transactions, both of
      which are needed to vote with your full balance.
    </div>
  );
}

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

export function NoStatementView({ closeDialog }: { closeDialog: () => void }) {
  return (
    <div className={styles.note_to_user}>
      You do not have a delegate statement.{" "}
      <Link
        href={"/statements/create"}
        className="underline"
        onClick={closeDialog}
      >
        Please set one up to vote.
      </Link>
    </div>
  );
}
