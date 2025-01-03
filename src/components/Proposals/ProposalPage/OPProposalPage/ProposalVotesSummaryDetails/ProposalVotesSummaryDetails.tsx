import Image from "next/image";
import checkIcon from "@/icons/check.svg";
import linkIcon from "@/icons/link.svg";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import { format } from "date-fns";
import Link from "next/link";

import Tenant from "@/lib/tenant/tenant";
import { Vote } from "@/app/api/common/votes/vote";
import { TENANT_NAMESPACES } from "@/lib/constants";

function AmountAndPercent({
  amount,
  total,
}: {
  amount: bigint;
  total: bigint;
}) {
  const percent =
    total > 0 ? ((Number(amount) / Number(total)) * 100).toFixed(2) : undefined;
  return (
    <span>
      <TokenAmountDisplay amount={amount} /> {percent && `(${percent}%)`}
    </span>
  );
}

export default function ProposalVotesSummaryDetails({
  proposal,
  votes,
}: {
  proposal: Proposal;
  votes: Vote[];
}) {
  const { token, namespace } = Tenant.current();
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

  const formatTime = (date: Date | null) => {
    return format(new Date(date ?? ""), "h:mma MMMM dd yyyy");
  };

  let quorumVotes =
    BigInt(results.for) + BigInt(results.abstain) + BigInt(results.against);

  let totalVotes =
    BigInt(results.for) + BigInt(results.abstain) + BigInt(results.against);

  /**
   * This is a temporary fix for ENS.
   * https://voteagora.atlassian.net/browse/ENG-903
   * ENS does not count against votes in the quorum calculation.
   * This is a temporary fix stack for + abstain, but not against.
   * A future fix will read each tenant and stack depending on how the tenant counts quorum.
   */
  if (namespace === TENANT_NAMESPACES.ENS) {
    quorumVotes = quorumVotes - BigInt(results.against);
  }

  /**
   * Only FOR votes are counted towards quorum for Uniswap.
   */
  if (namespace === TENANT_NAMESPACES.UNISWAP) {
    quorumVotes = BigInt(results.for);
  }

  const voteThresholdPercent =
    Number(totalVotes) > 0
      ? (Number(results.for) / Number(totalVotes)) * 100
      : 0;
  const apprThresholdPercent = Number(proposal.approvalThreshold) / 100;

  const hasMetQuorum = Boolean(
    Number(quorumVotes) >= Number(proposal.quorum || 0)
  );

  const hasMetThreshold = Boolean(voteThresholdPercent >= apprThresholdPercent);

  return (
    <div className="flex flex-col font-inter font-semibold text-xs w-full max-w-[317px] sm:min-w-[317px] bg-wash">
      <ProposalVotesBar proposal={proposal} votes={votes} />
      <div className="flex flex-col gap-2 w-full mt-4">
        <div className="flex justify-between text-positive">
          FOR <AmountAndPercent amount={results.for} total={totalVotes} />
        </div>
        <div className="text-neutral flex justify-between">
          ABSTAIN{" "}
          <AmountAndPercent amount={results.abstain} total={totalVotes} />
        </div>
        <div className="text-negative flex justify-between">
          AGAINST{" "}
          <AmountAndPercent amount={results.against} total={totalVotes} />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-[calc(100%+32px)] mt-4 bg-wash border-t border-b border-line -ml-4 p-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-1 text-secondary font-semibold text-xs">
            Quorum
          </div>
          {proposal.quorum && (
            <div className="flex items-center gap-1 ">
              {hasMetQuorum && (
                <Image
                  width="12"
                  height="12"
                  src={checkIcon}
                  alt="check icon"
                />
              )}
              <p className="text-xs font-semibold text-secondary">
                <TokenAmountDisplay
                  amount={quorumVotes}
                  decimals={token.decimals}
                  currency={""}
                />{" "}
                /{" "}
                <TokenAmountDisplay
                  amount={proposal.quorum}
                  decimals={token.decimals}
                  currency={""}
                />{" "}
                Required
              </p>
            </div>
          )}
        </div>
        {proposal.approvalThreshold && (
          <div className="flex justify-between">
            <div className="flex flex-row gap-1 text-secondary font-semibold text-xs">
              Threshold
            </div>
            <div className="flex flex-row gap-1 ">
              {hasMetThreshold && <Image src={checkIcon} alt="check icon" />}
              <p className=" text-xs font-semibold text-secondary">
                {voteThresholdPercent.toFixed(2)}% /{" "}
                {`${apprThresholdPercent}%`} Required
              </p>
            </div>
          </div>
        )}
      </div>
      <ol className="overflow-hidden space-y-6 w-[calc(100%+32px)] bg-wash -ml-4 p-4 pb-6 rounded-br-lg rounded-bl-lg">
        <StepperRow
          label="Proposal created"
          value={formatTime(proposal.createdTime)}
        />
        <StepperRow
          label="Voting period start"
          value={formatTime(proposal.startTime)}
        />
        <StepperRow
          label="Voting period end"
          value={formatTime(proposal.endTime)}
        />
        <StepperRow
          isLastStep
          label={`Proposal ${proposal.status?.toLocaleLowerCase()}`}
          value={formatTime(proposal.endTime)}
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
      className={`relative flex-1  ${!isLastStep && "after:content-[''] after:w-[1.5px] after:h-[35px]  after:bg-line after:inline-block after:absolute after:top-3 after:left-0.5"} `}
    >
      <Link href={href ?? "#"} className="flex items-center gap-x-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-black" : isActive ? "bg-blue-600" : "bg-primary/30"}`}
        />

        <div className="w-full flex items-center justify-between text-xs font-semibold">
          <div
            className={`${isCompleted ? "text-primary" : isActive ? "text-blue-600" : "text-secondary"} flex items-center gap-x-1`}
          >
            {label}
            {href && <Image src={linkIcon} alt="redirect" />}
          </div>

          <p className="text-xs font-medium text-secondary">{value}</p>
        </div>
      </Link>
    </li>
  );
};
