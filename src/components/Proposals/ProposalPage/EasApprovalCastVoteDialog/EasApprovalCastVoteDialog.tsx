"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIcon } from "lucide-react";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { Button } from "@/components/ui/button";
import { EasApprovalCastVoteDialogProps } from "@/components/Dialogs/DialogProvider/dialogs";
import { useEnsName, useAccount } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";
import { cn } from "@/lib/utils";
import Markdown from "@/components/shared/Markdown/Markdown";
import { useEASV2 } from "@/hooks/useEASV2";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";

export function ReviewEasApprovalVoteDialog({
  selectedOptions,
  options,
  reason,
  onSubmit,
  votingPower,
  onClose,
  isSubmitting,
  abstain,
}: {
  selectedOptions: number[];
  options: ParsedProposalData["APPROVAL"]["kind"]["options"];
  reason: string;
  onSubmit: () => void;
  votingPower: string | null;
  onClose: () => void;
  isSubmitting: boolean;
  abstain: boolean;
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
            {!abstain ? (
              <p className="text-xl font-extrabold">
                Casting vote for {selectedOptions.length} option
                {selectedOptions.length > 1 && "s"}
              </p>
            ) : (
              <p className="text-xl font-extrabold">Casting vote as Abstain</p>
            )}
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
        {selectedOptions.length > 0 && (
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
        )}
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
            onSubmit();
          }}
          disabled={isSubmitting}
          className="mt-6"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              {abstain
                ? "Vote as Abstain"
                : `Vote for ${selectedOptions.length} option`}
              {selectedOptions.length > 1 && "s"}
              {votingPower ? (
                <>
                  {" "}
                  with{"\u00A0"} <TokenAmountDecorated amount={votingPower} />
                </>
              ) : null}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function EasApprovalCastVoteDialog({
  proposal,
  closeDialog,
  votingPower,
}: EasApprovalCastVoteDialogProps) {
  const [inReviewStep, setInReviewStep] = useState<boolean>(false);
  const proposalData =
    proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"];
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [reason, setReason] = useState<string>("");
  const [abstain, setAbstain] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxChecked = proposalData.proposalSettings.maxApprovals;
  const abstainOptionId = proposalData.options.length;

  const { createApprovalVote, isCreatingApprovalVote } = useEASV2();

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
      } else if (selectedOptions.length < maxChecked) {
        setAbstain(false);
        setSelectedOptions((prev) => [...prev, optionId]);
      }
    }
  };

  const handleSubmitVote = async () => {
    setError(null);

    try {
      await createApprovalVote({
        choices: selectedOptions,
        reason: reason || "",
        proposalId: proposal.id,
      });

      setIsSuccess(true);
      // Close dialog after short delay to show success
      setTimeout(() => {
        closeDialog();
      }, 1500);
    } catch (err) {
      console.error("Error submitting approval vote:", err);

      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes("0xb8daf542")) {
        setError(
          "Invalid attester - you are not authorized to vote on this proposal"
        );
      } else if (errorMessage.includes("0x7c9a1cf9")) {
        setError("You have already voted on this proposal");
      } else if (errorMessage.includes("0x7fa01202")) {
        setError("Voting has not started yet");
      } else if (errorMessage.includes("0x7a19ed05")) {
        setError("Voting has ended for this proposal");
      } else {
        setError(err instanceof Error ? err.message : "Failed to submit vote");
      }
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Could open share dialog here if needed
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 rounded-full bg-positive/20 flex items-center justify-center mb-4">
          <CheckIcon className="w-6 h-6 text-positive" />
        </div>
        <p className="text-xl font-bold text-primary">Vote Submitted!</p>
        <p className="text-secondary mt-2">Your vote has been recorded.</p>
      </div>
    );
  }

  if (inReviewStep) {
    return (
      <ReviewEasApprovalVoteDialog
        selectedOptions={selectedOptions}
        options={proposalData.options}
        reason={reason}
        onSubmit={handleSubmitVote}
        votingPower={votingPower}
        isSubmitting={isCreatingApprovalVote}
        onClose={() => {
          setInReviewStep(false);
        }}
        abstain={abstain}
      />
    );
  }

  return (
    <div style={{ transformStyle: "preserve-3d" }}>
      {error && (
        <div className="mb-4 p-3 bg-negative/10 border border-negative rounded-lg">
          <p className="text-sm text-negative">{error}</p>
        </div>
      )}
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
              description={<p></p>}
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
        </div>
        <CastVoteWithReason
          onVoteClick={() => {
            setInReviewStep(true);
          }}
          reason={reason}
          setReason={setReason}
          numberOfOptions={selectedOptions.length}
          abstain={abstain}
          votingPower={votingPower}
        />
      </div>
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
