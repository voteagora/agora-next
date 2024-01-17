"use client";

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
    <>
      {!isLoading && !isSuccess && (
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
              <div className={styles.has_reason}>{reason}</div>
            ) : (
              <div className={styles.no_reason}>No voting reason provided</div>
            )}
          </div>
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
              <NoStatementView closeDialog={closeDialog} />
            )}
          </div>
        </VStack>
      )}
      {isLoading && <LoadingVote />}
      {isSuccess && <SuccessMessage closeDialog={closeDialog} />}
    </>
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

export function SuccessMessage({ closeDialog }: { closeDialog: () => void }) {
  return (
    <VStack className={styles.full_width}>
      <img src={`/images/congrats.svg`} className="w-full mb-3" />
      <div className="font-black text-2xl mb-2">
        Your vote has been submitted!
      </div>
      <div className="text-gray-700 text-sm mb-5">
        It might take up to a minute for the changes to be reflected. Thank you
        for participating in Optimism’s token house.
      </div>
      <div>
        <div onClick={closeDialog} className={`${styles.vote_container}`}>
          Got it
        </div>
      </div>
    </VStack>
  );
}

export function LoadingVote() {
  return (
    <VStack className={styles.full_width}>
      <img src={`/images/vote-pending.svg`} className="w-full mb-3" />
      <div className="font-black text-2xl mb-2">Casting your vote</div>
      <div className="text-gray-700 text-sm mb-5">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 bg-gray-eo rounded-lg`}
        >
          <div className="text-gray-700 font-medium">
            Writing your vote to the chain...
          </div>
        </div>
      </div>
    </VStack>
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
