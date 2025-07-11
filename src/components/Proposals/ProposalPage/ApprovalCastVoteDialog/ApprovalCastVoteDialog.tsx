"use client";

import { AbiCoder } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingVote, NoStatementView } from "../CastVoteDialog/CastVoteDialog";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { CheckIcon } from "lucide-react";
import { ParsedProposalData } from "@/lib/proposalUtils";
import useAdvancedVoting from "@/hooks/useAdvancedVoting";
import { Button } from "@/components/ui/button";
import { ApprovalCastVoteDialogProps } from "@/components/Dialogs/DialogProvider/dialogs";
import { calculateVoteMetadata, getVpToDisplay } from "@/lib/voteUtils";
import { useEnsName, useAccount } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Vote } from "@/app/api/common/votes/vote";
import { cn } from "@/lib/utils";
import Markdown from "@/components/shared/Markdown/Markdown";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const abiCoder = new AbiCoder();

export function ReviewApprovalVoteDialog({
  selectedOptions,
  options,
  reason,
  write,
  votingPower,
  onClose,
}: {
  selectedOptions: number[];
  options: ParsedProposalData["APPROVAL"]["kind"]["options"];
  reason: string;
  write: () => void;
  votingPower: string | null;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <span className="text-xs">
              {data || truncateAddress(address as string)}
            </span>
            <p className="text-xl font-extrabold">
              Casting vote for {selectedOptions.length} option
              {selectedOptions.length > 1 && "s"}
            </p>
          </div>
          {votingPower ? (
            <div className="flex flex-col">
              <span className="text-xs self-end">with</span>
              <span className="mt-[2px]">
                <TokenAmountDecorated amount={votingPower} />
              </span>
            </div>
          ) : null}
        </div>
        <div className="border border-line rounded-lg p-4 space-y-4 mt-6">
          {selectedOptions.map((optionId, index) => {
            const option = options[optionId];
            return (
              <div
                className="flex flex-row items-center justify-between relative"
                key={`option-${index}`}
              >
                <p className="font-medium max-w-[calc(100%-24px)]">
                  <Markdown content={option.description} />
                </p>
                <div
                  className={
                    "border border-line bg-primary absolute right-0 top-1/2 -translate-y-1/2 rounded-sm w-4 h-4 flex items-center justify-center transition-all"
                  }
                >
                  <CheckIcon className="w-4 h-4 text-neutral" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="line-clamp-5 overflow-hidden">
          {!!reason ? (
            <p className="mt-6 text-secondary">{reason}</p>
          ) : (
            <span className="border border-line p-4 mt-6 rounded-lg text-tertiary text-sm flex items-center justify-center">
              <p>No reason given</p>
            </span>
          )}
        </div>
        <Button
          onClick={() => {
            write();
            onClose();
          }}
          className="mt-6"
        >
          Vote for {selectedOptions.length} option
          {selectedOptions.length > 1 && "s"}
          {votingPower ? (
            <>
              {" "}
              with{"\u00A0"} <TokenAmountDecorated amount={votingPower} />
            </>
          ) : null}
        </Button>
      </div>
    </div>
  );
}

export function ApprovalCastVoteDialog({
  proposal,
  hasStatement,
  closeDialog,
  votingPower,
  authorityChains,
  missingVote,
}: ApprovalCastVoteDialogProps) {
  const [inReviewStep, setInReviewStep] = useState<boolean>(false);
  const proposalData =
    proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"];
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [reason, setReason] = useState<string>("");
  const [abstain, setAbstain] = useState<boolean>(false);
  const [encodedParams, setEncodedParams] = useState<`0x${string}`>("0x");
  const maxChecked = proposalData.proposalSettings.maxApprovals;
  const abstainOptionId = proposalData.options.length; // Abstain option is always last
  const openDialog = useOpenDialog();
  const { address } = useAccount();

  const handleOnChange = (optionId: number) => {
    if (optionId === abstainOptionId) {
      if (abstain) {
        setSelectedOptions((prev) =>
          prev.filter((value) => value !== optionId)
        );
      } else {
        setSelectedOptions([]);
      }
      setAbstain((prev) => !prev);
    } else {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions((prev) =>
          prev.filter((value) => value !== optionId)
        );

        // if (selectedOptions.length === 1) {
        //   setAbstain(true);
        // }
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
    advancedVP: votingPower ? BigInt(votingPower.advancedVP) : null,
    authorityChains,
    reason,
    params: encodedParams,
    missingVote,
  });

  const vpToDisplay = votingPower
    ? getVpToDisplay(votingPower, missingVote)
    : null;

  useMemo(() => {
    const encoded = abstain
      ? "0x"
      : (abiCoder.encode(
          ["uint256[]"],
          [selectedOptions.sort((a, b) => a - b)]
        ) as `0x${string}`);
    setEncodedParams(encoded);
  }, [selectedOptions, abstain]);

  const newVote = useMemo(() => {
    return {
      support: abstain ? "ABSTAIN" : "FOR",
      reason: reason,
      params: selectedOptions.map(
        (option) => proposalData.options[option].description
      ),
      weight: votingPower?.directVP || votingPower?.advancedVP || "0",
    };
  }, [abstain, reason, selectedOptions, proposalData, votingPower]);

  const { againstPercentage, forPercentage, endsIn, options, totalOptions } =
    calculateVoteMetadata({
      proposal,
      votes: [],
      newVote,
    });

  const openShareVoteDialog = useCallback(() => {
    openDialog({
      className: "sm:w-[32rem]",
      type: "SHARE_VOTE",
      params: {
        againstPercentage: againstPercentage,
        forPercentage: forPercentage,
        endsIn: endsIn,
        blockNumber: null,
        voteDate: null,
        supportType: abstain ? "ABSTAIN" : "FOR",
        voteReason: reason || "",
        proposalId: proposal.id,
        proposalTitle: proposal.markdowntitle,
        proposalType: proposal.proposalType ?? "STANDARD",
        proposal: proposal,
        newVote: newVote,
        options: options,
        totalOptions: totalOptions,
        votes: [
          {
            params: selectedOptions.map(
              (option) => proposalData.options[option].description
            ),
          } as Vote,
        ],
      },
    });
  }, [
    openDialog,
    proposal,
    proposalData,
    selectedOptions,
    againstPercentage,
    forPercentage,
    endsIn,
    abstain,
    reason,
    newVote,
    options,
    totalOptions,
  ]);

  useEffect(() => {
    if (isSuccess) {
      openShareVoteDialog();
    }
  }, [isSuccess, openShareVoteDialog]);

  if (inReviewStep) {
    return (
      <ReviewApprovalVoteDialog
        selectedOptions={selectedOptions}
        options={proposalData.options}
        reason={reason}
        write={write}
        votingPower={vpToDisplay}
        onClose={() => {
          setInReviewStep(false);
        }}
      />
    );
  }

  return (
    <div style={{ transformStyle: "preserve-3d" }}>
      {hasStatement && isLoading && <LoadingVote />}
      {hasStatement && isError && <p>Something went wrong</p>}
      {!hasStatement && <NoStatementView closeDialog={closeDialog} />}
      {hasStatement && !isLoading && !isSuccess && (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <p className="text-xl font-extrabold">
                Select up to {maxChecked} option{maxChecked > 1 && "s"}
              </p>
              <p className="text-secondary mt-1">
                Your vote is final and cannot be edited once submitted.
              </p>
            </div>
            <div className="flex flex-col max-h-[46vh] overflow-y-scroll">
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
                          <TokenAmountDecorated
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
              {Tenant.current().namespace !== TENANT_NAMESPACES.OPTIMISM && (
                <CheckCard
                  key={proposalData.options.length}
                  title={"Abstain: vote for no options"}
                  description={""}
                  checked={!!abstain}
                  checkedOptions={selectedOptions.length}
                  onClick={() => handleOnChange(abstainOptionId)}
                  abstain={abstain}
                />
              )}
            </div>
            <CastVoteWithReason
              //   onVoteClick={write}
              onVoteClick={() => {
                setInReviewStep(true);
              }}
              reason={reason}
              setReason={setReason}
              numberOfOptions={selectedOptions.length}
              abstain={abstain}
              votingPower={vpToDisplay}
            />
          </div>
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
  votingPower: string | null;
  copy?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="p-4 resize-none rounded-lg bg-line border-line transition-all"
        placeholder="I believe..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex flex-col justify-between items-stretch">
        {!abstain && numberOfOptions > 0 && (
          <Button onClick={() => onVoteClick()}>
            Vote for {numberOfOptions} option
            {numberOfOptions > 1 && "s"}
            {votingPower ? (
              <>
                {" "}
                with{"\u00A0"} <TokenAmountDecorated amount={votingPower} />
              </>
            ) : null}
          </Button>
        )}
        {!abstain && numberOfOptions === 0 && (
          <Button disabled>Select at least one option</Button>
        )}
        {abstain && (
          <Button onClick={() => onVoteClick()}>
            {!copy ? (
              <>
                Abstain from voting
                {votingPower ? (
                  <>
                    {" "}
                    with{"\u00A0"} <TokenAmountDecorated amount={votingPower} />
                  </>
                ) : null}
              </>
            ) : (
              copy
            )}
          </Button>
        )}
      </div>
    </div>
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
    <div className="py-2 cursor-pointer relative" onClick={onClick}>
      <p
        className={cn(
          "transition-all max-w-[calc(100%-24px)]",
          checked ? "text-primary font-medium" : "text-secondary font-normal"
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Markdown content={title} />
      </p>
      <div className="text-xs font-medium text-secondary">{description}</div>

      <div
        className={
          checked
            ? "border border-primary-900 bg-primary absolute right-0 top-1/2 -translate-y-1/2 rounded-sm w-4 h-4 flex items-center justify-center transition-all"
            : "absolute right-0 top-1/2 -translate-y-1/2 rounded-sm w-4 h-4 flex items-center justify-center transition-all bg-line border-line"
        }
      >
        {checked && <CheckIcon className="w-4 h-4 text-neutral" />}
      </div>
    </div>
  );
}
