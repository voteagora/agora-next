import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { CopelandResult } from "@/lib/copelandCalculation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronsUpDown, Info, Check } from "lucide-react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fontMapper } from "@/styles/fonts";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
const { ui } = Tenant.current();
import { useCalculateCopelandResult } from "@/hooks/useCalculateCopelandResult";
import React from "react";

const FUNDING_VALUES: Record<
  string,
  { ext: number; std: number; isEligibleFor2Y: boolean }
> = {
  Alpha: { ext: 500000, std: 300000, isEligibleFor2Y: true },
  Beta: { ext: 600000, std: 300000, isEligibleFor2Y: true },
  Charlie: { ext: 600000, std: 300000, isEligibleFor2Y: false },
  Delta: { ext: 700000, std: 300000, isEligibleFor2Y: true },
  Echo: { ext: 600000, std: 300000, isEligibleFor2Y: true },
  Fox: { ext: 500000, std: 300000, isEligibleFor2Y: true },
  Gamma: { ext: 400000, std: 300000, isEligibleFor2Y: false },
  Hotel: { ext: 900000, std: 500000, isEligibleFor2Y: true },
  India: { ext: 1200000, std: 700000, isEligibleFor2Y: false },
  Juliet: { ext: 1100000, std: 300000, isEligibleFor2Y: true },
  Kilo: { ext: 1000000, std: 300000, isEligibleFor2Y: false },
  Lima: { ext: 600000, std: 300000, isEligibleFor2Y: true },
} as const;

export default function OptionsResultsPanel({
  proposal,
}: {
  proposal: Proposal;
}) {
  const isProposalActive = proposal.status === "ACTIVE";
  const { data: proposalResults, isFetching } = useCalculateCopelandResult({
    proposalId: proposal.id,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 max-h-[calc(100vh-532px)] overflow-y-scroll flex-shrink px-4 mt-1 [&::-webkit-scrollbar]:hidden"
    >
      <Accordion
        type="single"
        collapsible
        className="w-full"
        onValueChange={(value) => {
          if (value) {
            setTimeout(() => {
              const element = document.querySelector(`[data-state="open"]`);
              if (element && containerRef.current) {
                const container = containerRef.current;
                const elementTop = element.getBoundingClientRect().top;
                const containerTop = container.getBoundingClientRect().top;
                const scrollDistance = elementTop - containerTop;

                container.scrollTo({
                  top: container.scrollTop + scrollDistance,
                  behavior: "smooth",
                });
              }
            }, 300);
          }
        }}
      >
        {isFetching ? (
          <div className="text-center text-sm text-tertiary">Loading...</div>
        ) : proposalResults && proposalResults.length > 0 ? (
          <div>
            {" "}
            {proposalResults.map((result, index) => (
              <OptionRow
                key={result.option}
                result={result}
                index={index}
                isProposalActive={isProposalActive}
                isFunding={proposal.markdowntitle.includes(
                  "Service Provider Stream"
                )}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-tertiary">
            No results available
          </div>
        )}
      </Accordion>
    </div>
  );
}

const OptionRow = ({
  result,
  index,
  isProposalActive,
  isFunding,
}: {
  result: CopelandResult;
  index: number;
  isProposalActive: boolean;
  isFunding: boolean;
}) => {
  const optionName = result.option;
  const fundingInfo = FUNDING_VALUES[optionName];

  const fundingTypeResultValue = fundingInfo
    ? result.fundingType === "EXT2Y"
      ? fundingInfo.ext
      : result.fundingType === "EXT1Y"
        ? fundingInfo.ext
        : result.fundingType === "STD"
          ? fundingInfo.std
          : null
    : null;

  const totalVotes = result.avgVotingPowerFor + result.avgVotingPowerAgainst;
  const forPercentage = Math.round(
    (result.avgVotingPowerFor / totalVotes) * 100
  );
  const againstPercentage = 100 - forPercentage;

  const getFundingTypeStyle = (fundingType: string) => {
    switch (fundingType) {
      case "EXT2Y":
        return "bg-[#008425]/60 text-wash";
      case "EXT1Y":
        return "bg-[#008425]/20 text-positive";
      case "STD":
        return "bg-[#F5F5F5] text-[#666666] border-[#E0E0E0]";
      default:
        return "";
    }
  };

  return (
    <AccordionItem
      value={result.option}
      className="border-none w-full mb-2 overflow-hidden first-of-type:rounded-sm last-of-type:rounded-sm"
    >
      <div className="flex items-center w-full">
        <span className="flex-shrink-0 mr-2 w-3 text-sm text-tertiary">
          {index + 1}
        </span>
        <div className="flex-grow">
          <AccordionTrigger
            icon={ChevronsUpDown}
            className={cn(
              "border border-line bg-wash text-primary font-semibold hover:no-underline py-3 pr-0 pl-3 rounded-sm w-full data-[state=open]:rounded-b-none h-10",
              result.fundingType === "None" && "data-[state=closed]:bg-neutral"
            )}
          >
            <div className="w-full flex justify-between items-center text-xs">
              <span className="font-semibold text-left truncate w-[100px]">
                {optionName}
              </span>
              <div className="flex items-center gap-4">
                {isFunding ? (
                  result.fundingType !== "None" ? (
                    <>
                      <div
                        className={cn(
                          "border px-2 py-1 rounded-sm font-semibold border-[#008425]",
                          getFundingTypeStyle(result.fundingType)
                        )}
                      >
                        {result.fundingType}
                      </div>
                      <span
                        className={cn(
                          "text-positive font-semibold flex items-center justify-end w-[88px]",
                          fontMapper[ui?.customization?.tokenAmountFont || ""]
                            ?.variable
                        )}
                      >
                        {fundingTypeResultValue?.toLocaleString()}/y
                        <Check strokeWidth={4} className="h-3 w-3 ml-1" />
                      </span>
                    </>
                  ) : result.fundingType === "None" ? (
                    <span
                      className={cn(
                        "text-tertiary flex items-center font-semibold",
                        fontMapper[ui?.customization?.tokenAmountFont || ""]
                          ?.variable
                      )}
                    >
                      NONE <X strokeWidth={4} className="h-3 w-3 ml-1" />
                    </span>
                  ) : null
                ) : null}
              </div>
            </div>
          </AccordionTrigger>
        </div>
      </div>
      <div className="ml-5 w-[calc(100%-1.25rem)]">
        <AccordionContent className="text-xs font-medium py-0 border border-t-0 border-line bg-wash rounded-b-sm">
          {isFunding && fundingInfo ? (
            <div className="border-b border-line py-3 px-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold">Extended ask</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    fontMapper[ui?.customization?.tokenAmountFont || ""]
                      ?.variable
                  )}
                >
                  {fundingInfo.ext.toLocaleString()}/y
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">Standard ask</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    fontMapper[ui?.customization?.tokenAmountFont || ""]
                      ?.variable
                  )}
                >
                  {fundingInfo.std.toLocaleString()}/y
                </span>
              </div>
            </div>
          ) : null}

          <div className="border-b border-line py-3 px-3">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold">Avg Support votes</span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
                )}
              >
                {Math.round(result.avgVotingPowerFor).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span
                className={cn(
                  "text-positive font-semibold",
                  fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
                )}
              >
                For-{Math.round(result.avgVotingPowerFor).toLocaleString()}
              </span>
              <span
                className={cn(
                  "text-negative font-semibold",
                  fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
                )}
              >
                Against-
                {Math.round(result.avgVotingPowerAgainst).toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-line rounded-full overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-positive h-full"
                  style={{
                    width: `${forPercentage}%`,
                  }}
                ></div>
                <div
                  className="bg-negative h-full"
                  style={{
                    width: `${againstPercentage}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="py-3 px-3">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="font-semibold text-xs">PROVIDER</div>
              <div className="font-semibold text-xs text-right">CHALLENGER</div>
              <div className="font-semibold text-xs text-right">CANDIDATE</div>
            </div>

            {result.comparisons.map((comparison, idx) => {
              const isOption1 = comparison.option1 === result.option;
              const opponentOption = isOption1
                ? comparison.option2
                : comparison.option1;
              const opponentName = opponentOption.split(":")[0].trim();
              const favorVotes = isOption1
                ? comparison.option1VotingPower
                : comparison.option2VotingPower;
              const disfavorVotes = isOption1
                ? comparison.option2VotingPower
                : comparison.option1VotingPower;
              const isWinner =
                (isOption1 && comparison.winner === comparison.option1) ||
                (!isOption1 && comparison.winner === comparison.option2);
              const lostAtLeastOne = result.totalLosses > 0;
              const wonAtLeastOne = result.totalWins > 0;

              return (
                <div key={idx} className="grid grid-cols-3 gap-4 py-2">
                  <div className="font-semibold truncate max-w-[100px]">
                    {opponentName}
                  </div>
                  <div
                    className={cn(
                      "text-right text-tertiary font-semibold flex items-center justify-end gap-1",
                      !isWinner && "text-positive",
                      fontMapper[ui?.customization?.tokenAmountFont || ""]
                        ?.variable
                    )}
                  >
                    {disfavorVotes.toLocaleString()}
                    <span className={cn("w-4", !lostAtLeastOne && "w-0")}>
                      {!isWinner && comparison.winner && "🏆"}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "text-right text-tertiary font-semibold flex items-center justify-end gap-1",
                      isWinner && "text-positive",
                      fontMapper[ui?.customization?.tokenAmountFont || ""]
                        ?.variable
                    )}
                  >
                    {favorVotes.toLocaleString()}
                    <span className={cn("w-4", !wonAtLeastOne && "w-0")}>
                      {isWinner && "🏆"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center w-full">
            <div className="bg-white rounded-full border border-line -ml-4 w-8 h-8" />
            {Array.from({ length: 20 }).map((_, idx) => (
              <div key={idx} className="bg-line h-0.5 w-1.5" />
            ))}
            <div className="bg-white rounded-full border border-line -mr-4 w-8 h-8" />
          </div>

          <div className="flex items-center justify-between py-3 px-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold">Total Matches</span>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-secondary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs font-medium text-xs">
                        Ranked choice voting (using the Copeland method)
                        compares every candidate in head-to-head matchups. For
                        each pair, a candidate earns a point for a win.
                        Candidates are stack ranked based on number of wins.
                        Ties are broken using average voting support across
                        every matchup.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex justify-end flex-1 gap-2">
              <div className="bg-white border border-line rounded-sm px-2 py-1 font-semibold">
                {isProposalActive ? "~" : null}
                {result.totalLosses}{" "}
                {result.totalLosses === 1 ? "Loss" : "Losses"}
              </div>
              <div className="bg-white border border-line rounded-sm px-2 py-1 font-semibold flex items-center text-positive">
                {isProposalActive ? "~" : null}
                {result.totalWins} {result.totalWins === 1 ? "Win" : "Wins"} 🏆
              </div>
            </div>
          </div>
        </AccordionContent>
      </div>
    </AccordionItem>
  );
};
