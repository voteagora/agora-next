import Image from "next/image";
import { VStack } from "@/components/Layout/Stack";

import infoTransparentIcon from "@/icons/info-transparent.svg";
import checkIcon from "@/icons/check.svg";
import linkIcon from "@/icons/link.svg";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import { format } from "date-fns";
import Link from "next/link";
import { formatNumber, formatNumberWithScientificNotation } from "@/lib/utils";

import Tenant from "@/lib/tenant/tenant";
const { token } = Tenant.current();

export default function ProposalVotesSummaryDetails({
  proposal,
}: {
  proposal: Proposal;
}) {
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

  const formatTime = (date: Date | null) => {
    return format(new Date(date ?? ""), "h:mma MMMM dd yyyy");
  };
  // Calculate the highest value among the vote results and check if it is in scientific notation.
  const highestValue = Math.max(
    Number(results.for),
    Number(results.abstain),
    Number(results.against)
  );
  const isScientificNotation = highestValue.toString().includes("e");

  const total =
    Number(results.for) + Number(results.against) + Number(results.abstain);

  // Calculate percentages
  const inFavorPercentage =
    ((Number(results.for) / total) * 100).toFixed(2) + "%";
  const againstPercentage =
    ((Number(results.against) / total) * 100).toFixed(2) + "%";
  const abstainPercentage =
    ((Number(results.abstain) / total) * 100).toFixed(2) + "%";
  return (
    <VStack className="font-inter font-semibold text-xs  flex w-full max-w-[320px] sm:min-w-[320px]">
      <ProposalVotesBar proposal={proposal} />
      <VStack gap={2} className="w-full mt-4">
        <div className="flex justify-between gl_votes_for">
          FOR{" "}
          <span>
            <TokenAmountDisplay amount={results.for} /> ({inFavorPercentage})
          </span>
        </div>
        <div className="gl_votes_abstain flex justify-between">
          ABSTAIN
          <span>
            <TokenAmountDisplay amount={results.abstain} /> ({abstainPercentage}
            )
          </span>
        </div>
        <div className="gl_votes_against flex justify-between">
          AGAINST{" "}
          <span>
            <TokenAmountDisplay amount={results.against} /> ({againstPercentage}
            )
          </span>
        </div>
      </VStack>

      <VStack
        gap={2}
        className="w-[calc(100%+32px)] mt-4 bg-gray-fa border-t border-b -ml-4 p-4"
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-1 text-gray-4f font-semibold text-xs">
            Quorum
            <Image
              width="12"
              height="12"
              src={infoTransparentIcon}
              alt="info icon"
            />
          </div>
          {proposal.quorum && (
            <div className="flex items-center gap-1 ">
              <Image width="12" height="12" src={checkIcon} alt="check icon" />
              <p className="text-xs font-semibold text-gray-4f">
                {formatNumber(
                  isScientificNotation
                    ? formatNumberWithScientificNotation(highestValue)
                    : BigInt(highestValue),
                  token.decimals,
                  2
                )}{" "}
                /{formatNumber(proposal.quorum, token.decimals, 2)} Required
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row gap-1 text-gray-4f font-semibold text-xs">
            Threshold
            <Image
              width="12"
              height="12"
              src={infoTransparentIcon}
              alt="info icon"
            />
          </div>
          <div className="flex flex-row gap-1 ">
            <Image src={checkIcon} alt="check icon" />
            <p className=" text-xs font-semibold text-gray-4f">
              87% / {`${Number(proposal.approvalThreshold) / 100}%`} Required
            </p>
          </div>
        </div>
      </VStack>
      <ol className="overflow-hidden space-y-6 w-[calc(100%+32px)] bg-gray-fa -ml-4 p-4 pb-6 rounded-br-lg rounded-bl-lg ">
        <StepperRow
          label="Proposal creation"
          value={formatTime(proposal.created_time)}
          isCompleted
          href="/proposals/create"
        />
        <StepperRow
          label="Voting period start"
          value={formatTime(proposal.start_time)}
          isCompleted
        />
        <StepperRow
          label="Voting period end"
          value={formatTime(proposal.end_time)}
          isActive
        />
        <StepperRow
          isLastStep
          label={`Proposal ${proposal.status?.toLocaleLowerCase()}`}
          value={formatTime(proposal.end_time)}
        />
      </ol>
    </VStack>
  );
}

const StepperRow = ({
  label,
  value,
  isActive,
  isCompleted,
  isLastStep,
  href,
}: {
  label: string;
  value: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
  href?: string;
}) => {
  return (
    <li
      className={`relative flex-1  ${!isLastStep && "after:content-[''] after:w-[1.5px] after:h-[35px]  after:bg-gray-eo after:inline-block after:absolute after:top-3 after:left-0.5"} `}
    >
      <Link href={href ?? "#"} className="flex items-center gap-x-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-black" : isActive ? "bg-blue-600" : "bg-gray-af"}`}
        />

        <div className="w-full flex items-center justify-between text-xs font-semibold">
          <div
            className={`${isCompleted ? "text-black" : isActive ? "text-blue-600" : "text-gray-4f"} flex items-center gap-x-1`}
          >
            {label}
            {href && <Image src={linkIcon} alt="redirect" />}
          </div>

          <p className="text-xs font-medium text-gray-4f">{value}</p>
        </div>
      </Link>
    </li>
  );
};
