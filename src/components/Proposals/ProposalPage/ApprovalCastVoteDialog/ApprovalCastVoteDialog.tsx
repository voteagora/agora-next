import { VStack } from "@/components/Layout/Stack";
import { css } from "@emotion/css";
import { AbiCoder, ethers } from "ethers";
import { useMemo, useState } from "react";
import * as theme from "@/styles/theme";
import {
  LoadingVote,
  NoStatementView,
  SuccessMessage,
} from "../CastVoteDialog/CastVoteDialog";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { CheckIcon } from "lucide-react";
import { Proposal } from "@/app/api/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { ProposalType } from "@prisma/client";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { useContractWrite } from "wagmi";

const abiCoder = new AbiCoder();
export function ApprovalCastVoteDialog({
  proposal,
  hasStatement,
  closeDialog,
}: {
  proposal: Proposal;
  closeDialog: () => void;
  hasStatement: boolean;
}) {
  const proposalData =
    proposal.proposalData as unknown as ParsedProposalData["APPROVAL"]["kind"];
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

  const governorContract = OptimismContracts.governor;
  // 0 = for, 1 = abstain
  const { isLoading, isSuccess, write, isError } = useContractWrite({
    address: governorContract.address as any,
    abi: governorContract.abi,
    functionName: "castVoteWithReasonAndParams",
    args: [BigInt(proposal.id), abstain ? 1 : 0, reason, encodedParams],
  });

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
    <VStack
      alignItems="items-center"
      className={css`
        padding: ${theme.spacing["8"]};
      `}
    >
      <div
        className={css`
          width: 100%;
          max-width: ${theme.maxWidth.lg};
          background: ${theme.colors.white};
          border-radius: ${theme.spacing["3"]};
          padding: ${theme.spacing["6"]};
        `}
      >
        {hasStatement && isLoading && <LoadingVote />}
        {hasStatement && isSuccess && <SuccessMessage />}
        {hasStatement && isError && <p>Something went wrong</p>}
        {!hasStatement && <NoStatementView />}
        {hasStatement && !isLoading && !isSuccess && (
          <VStack>
            <VStack
              className={css`
                margin-bottom: ${theme.spacing["4"]};
              `}
            >
              <p
                className={css`
                  font-size: ${theme.fontSize["xl"]};
                  font-weight: ${theme.fontWeight.bold};
                `}
              >
                Select up to {maxChecked} option{maxChecked > 1 && "s"}
              </p>
              <p
                className={css`
                  font-size: ${theme.fontSize["xs"]};
                  color: ${theme.colors.gray[700]};
                  font-weight: ${theme.fontWeight.medium};
                  margin-top: ${theme.spacing["1"]};
                `}
              >
                Note: onchain votes are final and cannot be edited once
                submitted.
              </p>
            </VStack>
            <VStack
              className={css`
                max-height: 46vh;
                overflow-y: scroll;
              `}
            >
              {proposalData.options.map((option, index) => (
                <CheckCard
                  key={index}
                  title={option.description}
                  description={
                    <p>
                      {/* {BigInt(
                        option.budgetTokensSpent.amount
                      ) === 0n ? (
                        "No token transfer request"
                      ) : (
                        <>
                          Requesting{" "}
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
                title={"Abstain"}
                description={"Vote for no options"}
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
            />
          </VStack>
        )}
      </div>
    </VStack>
  );
}

function CastVoteWithReason({
  reason,
  setReason,
  onVoteClick,
  numberOfOptions,
  abstain,
}: {
  onVoteClick: () => void;
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  numberOfOptions: number;
  abstain: boolean;
}) {
  return (
    <VStack
      className={css`
        border: 1px solid ${theme.colors.gray[300]};
        border-radius: ${theme.borderRadius.lg};
        margin-top: ${theme.spacing["4"]};
      `}
    >
      <textarea
        className={css`
          padding: ${theme.spacing["4"]};
          resize: none;
          border-radius: ${theme.borderRadius.lg};
          background-color: ${theme.colors.gray.fa};
          :focus {
            outline: 0px;
          }
        `}
        placeholder="I believe..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <VStack
        justifyContent="justify-between"
        alignItems="items-stretch"
        className={css`
          padding-top: ${theme.spacing["1"]};
          padding-bottom: ${theme.spacing["3"]};
          padding-left: ${theme.spacing["3"]};
          padding-right: ${theme.spacing["3"]};
          background-color: ${theme.colors.gray.fa};
          border-bottom-left-radius: ${theme.borderRadius.lg};
          border-bottom-right-radius: ${theme.borderRadius.lg};
        `}
      >
        {!abstain && numberOfOptions > 0 && (
          <button onClick={() => onVoteClick()}>
            Vote for {numberOfOptions} option
            {numberOfOptions > 1 && "s"} with{" "}
            {<TokenAmountDisplay amount={0} decimals={18} currency="OP" />}
          </button>
        )}
        {!abstain && numberOfOptions === 0 && (
          <button disabled>Select at least one option</button>
        )}
        {abstain && (
          <button onClick={() => onVoteClick()}>
            Vote for no options with{" "}
            {<TokenAmountDisplay amount={0} decimals={18} currency="OP" />}
          </button>
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
    <div
      className={css`
        padding: ${theme.spacing["2"]} 0;
        cursor: pointer;
        position: relative;
        padding-right: ${theme.spacing["12"]};
      `}
      onClick={onClick}
    >
      <p
        className={css`
          font-weight: ${theme.fontWeight.medium};
        `}
      >
        {title}
      </p>
      <div
        className={css`
          font-size: ${theme.fontSize.xs};
          font-weight: ${theme.fontWeight.medium};
          color: ${theme.colors.gray["700"]};
        `}
      >
        {description}
      </div>
      <div
        className={css`
          position: absolute;
          right: ${theme.spacing["4"]};
          top: 50%;
          transform: translateY(-50%);
          width: ${theme.spacing["8"]};
          height: ${theme.spacing["8"]};
          border-radius: ${theme.borderRadius.md};
          border: 1px solid ${theme.colors.gray.eb};
          background-color: ${theme.colors.gray.fa};
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        {checked && (
          <CheckIcon
            className={css`
              width: ${theme.spacing["5"]};
              height: ${theme.spacing["5"]};
              color: ${theme.colors.black};

              & > path {
                stroke-width: 2px;
                stroke: ${theme.colors.black};
              }
            `}
          />
        )}
      </div>
    </div>
  );
}
