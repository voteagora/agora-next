"use client";

import { VStack } from "@/components/Layout/Stack";
import { AbiCoder } from "ethers";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  LoadingVote,
  NoStatementView,
  SuccessMessage,
} from "../CastVoteDialog/CastVoteDialog";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { CheckIcon } from "lucide-react";
import { ParsedProposalData } from "@/lib/proposalUtils";
import styles from "./approvalCastVoteDialog.module.scss";
import useAdvancedVoting from "@/hooks/useAdvancedVoting";
import { Button } from "@/components/ui/button";
import { ApprovalCastVoteDialogProps } from "@/components/Dialogs/DialogProvider/dialogs";
import { MissingVote, getVpToDisplay } from "@/lib/voteUtils";

const abiCoder = new AbiCoder();

export function ApprovalCastVoteDialog({
  proposal,
  hasStatement,
  closeDialog,
  votingPower,
  authorityChains,
  missingVote,
}: ApprovalCastVoteDialogProps) {
  const proposalData =
    proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"];
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [reason, setReason] = useState<string>("");
  const [abstain, setAbstain] = useState<boolean>(true);
  const [encodedParams, setEncodedParams] = useState<`0x${string}`>("0x");
  const maxChecked = proposalData.proposalSettings.maxApprovals;
  const abstainOptionId = proposalData.options.length; // Abstain option is always last

  const handleOnChange = (optionId: number) => {
    if (optionId === abstainOptionId) {
      if (abstain) {
        setSelectedOptions([proposalData.options.length - 1]);
      } else {
        setSelectedOptions([]);
      }
      setAbstain((prev) => !prev);
    } else {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions((prev) =>
          prev.filter((value) => value !== optionId)
        );

        if (selectedOptions.length === 1) {
          setAbstain(true);
        }
      } else if (selectedOptions.length < maxChecked) {
        setAbstain(false);
        setSelectedOptions((prev) => [...prev, optionId]);
      }
    }
  };

  // TODO: ADD against option if is supported
  // 0 = against, 1 = for, 2 = abstain
  const { isLoading, isSuccess, write, isError, data } = useAdvancedVoting({
    proposalId: proposal.id,
    support: abstain ? 2 : 1,
    advancedVP: BigInt(votingPower.advancedVP),
    authorityChains,
    reason,
    params: encodedParams,
    missingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  useMemo(() => {
    const encoded = abstain
      ? "0x"
      : (abiCoder.encode(
          ["uint256[]"],
          [selectedOptions.sort((a, b) => a - b)]
        ) as `0x${string}`);
    setEncodedParams(encoded);
  }, [selectedOptions, abstain]);

  return (
    <div className={styles.container}>
      {hasStatement && isLoading && <LoadingVote />}
      {hasStatement && isSuccess && (
        <SuccessMessage closeDialog={closeDialog} data={data} />
      )}
      {hasStatement && isError && <p>Something went wrong</p>}
      {!hasStatement && <NoStatementView closeDialog={closeDialog} />}
      {hasStatement && !isLoading && !isSuccess && (
        <>
          <VStack gap={3}>
            <VStack className={styles.title_box}>
              <p className={styles.title}>
                Select up to {maxChecked} option{maxChecked > 1 && "s"}
              </p>
              <p className={styles.notes}>
                Your vote is final and cannot be edited once submitted.
              </p>
            </VStack>
            <VStack className={styles.options_list}>
              {proposalData.options.map((option, index) => (
                <CheckCard
                  key={index}
                  title={option.description}
                  description={
                    <p>
                      {/* TODO: add token transfer request | commented because data not indexed correctly */}
                      {/* {BigInt(
                        option.budgetTokensSpent.amount
                      ) === 0n ? (
                        "No token transfer request"
                      ) : (
                        <>
                          Requesting{"\u00A0"}
                          <TokenAmountDisplay
                            fragment={option.budgetTokensSpent}
                          />
                        </>
                      )} */}
                    </p>
                  }
                  checked={selectedOptions.includes(index)}
                  checkedOptions={selectedOptions.length}
                  onClick={() => handleOnChange(index)}
                  abstain={abstain}
                />
              ))}
              <CheckCard
                key={proposalData.options.length}
                title={"Abstain: vote for no options"}
                description={""}
                checked={!!abstain}
                checkedOptions={selectedOptions.length}
                onClick={() => handleOnChange(abstainOptionId)}
                abstain={abstain}
              />
            </VStack>
            <CastVoteWithReason
              onVoteClick={write}
              reason={reason}
              setReason={setReason}
              numberOfOptions={selectedOptions.length}
              abstain={abstain}
              votingPower={vpToDisplay}
            />
          </VStack>
        </>
      )}
    </div>
  );
}

function CastVoteWithReason({
  reason,
  setReason,
  onVoteClick,
  numberOfOptions,
  abstain,
  votingPower,
  copy,
}: {
  onVoteClick: () => void;
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  numberOfOptions: number;
  abstain: boolean;
  votingPower: string;
  copy?: string;
}) {
  return (
    <VStack className={styles.cast_vote_box} gap={4}>
      <textarea
        className={styles.reason_input}
        placeholder="I believe..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <VStack justifyContent="justify-between" alignItems="items-stretch">
        {!abstain && numberOfOptions > 0 && (
          <Button onClick={() => onVoteClick()}>
            Vote for {numberOfOptions} option
            {numberOfOptions > 1 && "s"} with{"\u00A0"}
            {<TokenAmountDisplay amount={votingPower} />}
          </Button>
        )}
        {!abstain && numberOfOptions === 0 && (
          <Button disabled>Select at least one option</Button>
        )}
        {abstain && (
          <Button onClick={() => onVoteClick()}>
            {!copy ? (
              <>
                Vote for no options with{"\u00A0"}
                <TokenAmountDisplay amount={votingPower} />
              </>
            ) : (
              copy
            )}
          </Button>
        )}
      </VStack>
    </VStack>
  );
}

function CheckCard({
  title,
  checked,
  onClick,
  description,
  checkedOptions,
  abstain,
}: {
  title: string;
  checked: boolean;
  onClick: () => void;
  description: string | JSX.Element;
  checkedOptions: number;
  abstain: boolean;
}) {
  return (
    <div className={styles.option_card} onClick={onClick}>
      <p
        className={
          checked
            ? cn(styles.card_title_checked, styles.card_title)
            : styles.card_title
        }
      >
        {title}
      </p>
      <div className={styles.card_description}>{description}</div>

      <div
        className={
          checked
            ? cn(
                styles.card_check_container_checked,
                styles.card_check_container
              )
            : styles.card_check_container
        }
      >
        {checked && <CheckIcon className={styles.card_check} />}
      </div>
    </div>
  );
}
