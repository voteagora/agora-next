import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  CopelandResult,
  simulateCopelandVoting,
} from "@/lib/copelandCalculation";
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

export default function OptionsResultsPanel({
  proposal,
}: {
  proposal: Proposal;
}) {
  const isProposalActive = proposal.status === "ACTIVE";
  const proposalResults = simulateCopelandVoting();

  return (
    <div className="flex flex-col flex-1 max-h-[calc(100vh-482px)] overflow-y-scroll flex-shrink px-4 mt-1 [&::-webkit-scrollbar]:hidden">
      <Accordion type="single" collapsible className="w-full">
        {proposalResults.map((result, index) => (
          <OptionRow
            key={result.letter}
            result={result}
            index={index}
            isProposalActive={isProposalActive}
          />
        ))}
      </Accordion>
    </div>
  );
}

const OptionRow = ({
  result,
  index,
  isProposalActive,
}: {
  result: CopelandResult;
  index: number;
  isProposalActive: boolean;
}) => {
  const resultValue = result.letter
    .slice((result.letter.indexOf(":") || 0) + 1)
    .trim()
    .split("/");
  const ext2yResultValue = resultValue[0].trim();
  const ext1yResultValue = resultValue[1].trim();
  const fundingTypeResultValue =
    result.fundingType === "EXT 2Y"
      ? ext2yResultValue
      : result.fundingType === "EXT 1Y"
        ? ext1yResultValue
        : null;

  const totalVotes = result.avgVotingPowerFor + result.avgVotingPowerAgainst;
  const forPercentage = Math.round(
    (result.avgVotingPowerFor / totalVotes) * 100
  );
  const againstPercentage = 100 - forPercentage;

  return (
    <AccordionItem
      value={result.letter}
      className="border-none w-full mb-2 overflow-hidden first-of-type:rounded-sm last-of-type:rounded-sm"
    >
      <div className="flex items-center w-full">
        <span className="flex-shrink-0 mr-2 w-3 text-sm text-tertiary">
          {index + 1}
        </span>
        <div className="flex-grow">
          <AccordionTrigger
            icon={ChevronsUpDown}
            className="border border-line bg-wash text-primary font-semibold hover:no-underline py-3 px-4 rounded-sm w-full data-[state=open]:rounded-b-none h-10"
          >
            <div className="w-full flex justify-between items-center text-xs">
              <span className="font-semibold truncate max-w-[84px]">
                {result.letter.split(":")[0].trim()}
              </span>
              <div className="flex items-center gap-4">
                {result.fundingType !== "None" ? (
                  <>
                    <div
                      className={cn(
                        "border border-[#008425] bg-positive/20 text-positive px-2 py-1 rounded-sm font-semibold",
                        result.fundingType === "EXT 2Y" &&
                          "bg-[#008425]/60 text-wash"
                      )}
                    >
                      {result.fundingType}
                    </div>
                    <span
                      className={cn(
                        "text-positive font-semibold flex items-center",
                        fontMapper[ui?.customization?.tokenAmountFont || ""]
                          ?.variable
                      )}
                    >
                      {fundingTypeResultValue &&
                        fundingTypeResultValue.replace(
                          /(\d)(?=(\d{3})+(?!\d))/g,
                          "$1,"
                        )}
                      /y
                      <Check strokeWidth={4} className="h-3 w-3 ml-1" />
                    </span>
                  </>
                ) : (
                  <span
                    className={cn(
                      "text-tertiary flex items-center font-semibold",
                      fontMapper[ui?.customization?.tokenAmountFont || ""]
                        ?.variable
                    )}
                  >
                    NONE <X strokeWidth={4} className="h-3 w-3 ml-1" />
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
        </div>
      </div>
      <div className="ml-5 w-[calc(100%-1.25rem)]">
        <AccordionContent className="text-xs font-medium py-0 border border-t-0 border-line bg-wash rounded-b-sm">
          <div className="border-b border-line py-3 px-3">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold">Extended ask</span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
                )}
              >
                {ext2yResultValue &&
                  ext2yResultValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                /Y
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">Standard ask</span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
                )}
              >
                {ext1yResultValue &&
                  ext1yResultValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                /Y
              </span>
            </div>
          </div>

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
              <div className="font-semibold text-xs">Challenger</div>
              <div className="font-semibold text-xs text-center">Disfavor</div>
              <div className="font-semibold text-xs text-right">Favor</div>
            </div>

            {result.comparisons.map((comparison, idx) => {
              const isOption1 = comparison.option1 === result.letter;
              const opponentOption = isOption1
                ? comparison.option2
                : comparison.option1;
              const opponentName = opponentOption.split(":")[0].trim();
              const favorVotes = isOption1
                ? comparison.option1Wins
                : comparison.option2Wins;
              const disfavorVotes = isOption1
                ? comparison.option2Wins
                : comparison.option1Wins;
              const isWinner =
                (isOption1 && comparison.winner === comparison.option1) ||
                (!isOption1 && comparison.winner === comparison.option2);

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
                    {!isWinner && comparison.winner && <span> 🏆</span>}
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
                    {isWinner && <span> 🏆</span>}
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
