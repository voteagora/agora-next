import Image from "next/image";

import infoTransparentIcon from "@/icons/info-transparent.svg";
import checkIcon from "@/icons/check.svg";
import linkIcon from "@/icons/link.svg";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import { format } from "date-fns";
import Link from "next/link";
import { formatNumber, formatNumberWithScientificNotation, isScientificNotation } from "@/lib/utils";

import Tenant from "@/lib/tenant/tenant";


export default function ProposalVotesSummaryDetails({ proposal }: {
  proposal: Proposal;
}) {
  const { token } = Tenant.current();
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

  const formatTime = (date: Date | null) => {
    return format(new Date(date ?? ""), "h:mma MMMM dd yyyy");
  };

  // Calculate the highest value among the vote results and check if it is in scientific notation.
  const highestValue = Math.max(
    Number(results.for),
    Number(results.abstain),
    Number(results.against),
  );



  const total = Number(results.for) + Number(results.against) + Number(results.abstain);
  const voteThresholdPercent = total > 0 ? ((Number(results.for) + Number(results.against)) / total) * 100 : 0;
  const apprThresholdPercent = Number(proposal.approvalThreshold) / 100;

  const hasQuorum = Boolean(total >= Number(proposal.quorum || 0));
  const hasThreshold = Boolean(voteThresholdPercent >= apprThresholdPercent);

  const forPercent = ((Number(results.for) / Number(total)) * 100).toFixed(2);
  const againstPercent = ((Number(results.against) / Number(total)) * 100).toFixed(2);
  const abstainPercent = ((Number(results.abstain) / Number(total)) * 100).toFixed(2);

  return (
    <div className="flex flex-col font-inter font-semibold text-xs w-full max-w-[320px] sm:min-w-[320px]">
      <ProposalVotesBar proposal={proposal} />
      <div className="flex flex-col gap-2 w-full mt-4">
        <div className="flex justify-between gl_votes_for">
          FOR{" "}
          <span>
            <TokenAmountDisplay amount={results.for} /> ({forPercent}%)
          </span>
        </div>
        <div className="gl_votes_abstain flex justify-between">
          ABSTAIN
          <span>
            <TokenAmountDisplay amount={results.abstain} /> ({abstainPercent}%
            )
          </span>
        </div>
        <div className="gl_votes_against flex justify-between">
          AGAINST{" "}
          <span>
            <TokenAmountDisplay amount={results.against} /> ({againstPercent}%
            )
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-[calc(100%+32px)] mt-4 bg-gray-fa border-t border-b -ml-4 p-4">
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
              {hasQuorum && <Image width="12" height="12" src={checkIcon} alt="check icon" />}

              <p className="text-xs font-semibold text-gray-4f">
                {formatNumber(isScientificNotation(total) ? formatNumberWithScientificNotation(total) : total, 2)}{" "}/ {formatNumber(proposal.quorum, token.decimals, 2)} Required
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
            {hasThreshold && <Image src={checkIcon} alt="check icon" />}
            <p className=" text-xs font-semibold text-gray-4f">
              {voteThresholdPercent.toFixed(2)}% / {`${apprThresholdPercent}%`} Required
            </p>
          </div>
        </div>
      </div>
      <ol
        className="overflow-hidden space-y-6 w-[calc(100%+32px)] bg-gray-fa -ml-4 p-4 pb-6 rounded-br-lg rounded-bl-lg ">
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
    </div>
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
