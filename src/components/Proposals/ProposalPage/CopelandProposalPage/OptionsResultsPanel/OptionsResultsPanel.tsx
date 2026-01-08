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
import { useCalculateCopelandResult } from "@/hooks/useCalculateCopelandResult";
import React, { useMemo } from "react";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { isProdInfra } from "@/lib/envConfig";

const { ui } = Tenant.current();

// Helper function to check if an option is an extended version
const EXTENDED_SUFFIX = " - ext";
function isExtendedOption(option: string): boolean {
  return option.endsWith(EXTENDED_SUFFIX);
}

function getBaseOptionName(option: string, options: string[]): string | null {
  if (!isExtendedOption(option)) return option;
  const optionWithoutSuffix = option.split("-")?.[0]?.trim();
  if (optionWithoutSuffix) {
    return (
      options.find(
        (o) => o.startsWith(optionWithoutSuffix) && !o.endsWith(EXTENDED_SUFFIX)
      ) || null
    );
  }
  return null;
}

const FUNDING_VALUES_PROD: Record<
  string,
  { ext: number | null; std: number; isEligibleFor2Y: boolean }
> = {
  "eth.limo": { ext: 100000, std: 700000, isEligibleFor2Y: true },
  "Lighthouse Labs": { ext: null, std: 300000, isEligibleFor2Y: false },
  PYOR: { ext: null, std: 300000, isEligibleFor2Y: false },
  JustaName: { ext: null, std: 300000, isEligibleFor2Y: false },
  "Ethereum Identity Fnd": { ext: 200000, std: 500000, isEligibleFor2Y: true },
  Agora: { ext: 100000, std: 300000, isEligibleFor2Y: false },
  AlphaGrowth: { ext: 400000, std: 400000, isEligibleFor2Y: false },
  Web3bio: { ext: null, std: 500000, isEligibleFor2Y: false },
  GovPal: { ext: null, std: 300000, isEligibleFor2Y: false },
  "dWeb.host": { ext: 100000, std: 300000, isEligibleFor2Y: false },
  Namespace: { ext: null, std: 400000, isEligibleFor2Y: true },
  "ZK Email": { ext: 400000, std: 400000, isEligibleFor2Y: false },
  Namestone: { ext: null, std: 800000, isEligibleFor2Y: true },
  blockful: { ext: 100000, std: 700000, isEligibleFor2Y: true },
  "x23.ai": { ext: null, std: 300000, isEligibleFor2Y: false },
  "Unicorn.eth": { ext: null, std: 300000, isEligibleFor2Y: true },
  WebHash: { ext: null, std: 300000, isEligibleFor2Y: false },
  "Curia Lab": { ext: null, std: 300000, isEligibleFor2Y: false },
  Enscribe: { ext: null, std: 400000, isEligibleFor2Y: false },
  "Wildcard Labs": { ext: 100000, std: 300000, isEligibleFor2Y: true },
  Unruggable: { ext: 300000, std: 400000, isEligibleFor2Y: true },
  Tally: { ext: null, std: 300000, isEligibleFor2Y: false },
  "3DNS": { ext: 200000, std: 500000, isEligibleFor2Y: false },
  Decent: { ext: null, std: 300000, isEligibleFor2Y: false },
  "NameHash Labs": { ext: null, std: 1100000, isEligibleFor2Y: true },
  "NONE BELOW": { ext: null, std: 0, isEligibleFor2Y: false },
} as const;

const FUNDING_VALUES_DEV: Record<
  string,
  { ext: number | null; std: number; isEligibleFor2Y: boolean }
> = {
  ENSRegistry: { ext: null, std: 300000, isEligibleFor2Y: true },
  ResolutionProtocol: { ext: 100000, std: 300000, isEligibleFor2Y: false },
  NameWrapper: { ext: null, std: 400000, isEligibleFor2Y: false },
  EthDNS: { ext: 400000, std: 400000, isEligibleFor2Y: false },
  SubgraphIndex: { ext: 300000, std: 400000, isEligibleFor2Y: true },
  MetaResolver: { ext: null, std: 800000, isEligibleFor2Y: true },
  "Ethereum Name Improvers": { ext: null, std: 300000, isEligibleFor2Y: true },
  "A long name foundation": { ext: null, std: 400000, isEligibleFor2Y: false },
};

const FUNDING_VALUES = isProdInfra() ? FUNDING_VALUES_PROD : FUNDING_VALUES_DEV;

export default function OptionsResultsPanel({
  proposal,
}: {
  proposal: Proposal;
}) {
  const isProposalActive = proposal.status === "ACTIVE";
  const { data: proposalResults, isFetching } = useCalculateCopelandResult({
    proposalId: proposal.id,
  });
  const options = (
    proposal.proposalData as unknown as ParsedProposalData["SNAPSHOT"]["kind"]
  ).choices;

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Filter out extended options to avoid duplicate rows
  const filteredResults = React.useMemo(() => {
    if (!proposalResults) return [];
    return proposalResults.filter((result) => !isExtendedOption(result.option));
  }, [proposalResults]);

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
            {filteredResults.map((result, index) => {
              // Find corresponding extended option if it exists
              const extendedOption = proposalResults.find(
                (r) =>
                  isExtendedOption(r.option) &&
                  getBaseOptionName(r.option, options) === result.option
              );

              return (
                <OptionRow
                  key={result.option}
                  result={result}
                  extendedResult={extendedOption}
                  index={index}
                  isProposalActive={isProposalActive}
                  isFunding={proposal.markdowntitle.includes(
                    "Service Provider"
                  )}
                />
              );
            })}
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
  extendedResult,
  index,
  isProposalActive,
  isFunding,
}: {
  result: CopelandResult;
  extendedResult?: CopelandResult;
  index: number;
  isProposalActive: boolean;
  isFunding: boolean;
}) => {
  const optionName = result.option.split("-")?.[0]?.trim();
  const isNoneBelow = optionName === "NONE BELOW";
  const fundingInfo = FUNDING_VALUES[optionName];

  const extendedResultGotFunding =
    extendedResult && extendedResult.fundingType !== "None";

  const fundingType = useMemo(() => {
    if (extendedResultGotFunding) {
      return extendedResult.fundingType;
    } else {
      return result.fundingType;
    }
  }, [extendedResultGotFunding, extendedResult, result]);

  const fundingTypeResultValue = useMemo(() => {
    if (!fundingInfo) return null;
    if (extendedResultGotFunding && fundingInfo.ext) {
      return extendedResult.fundingType === "EXT2Y" ||
        extendedResult.fundingType === "EXT1Y"
        ? fundingInfo.ext + fundingInfo.std
        : null;
    } else {
      return result.fundingType.startsWith("STD") ? fundingInfo.std : null;
    }
  }, [extendedResultGotFunding, fundingInfo, extendedResult, result]);

  const totalVotes = result.avgVotingPowerFor + result.avgVotingPowerAgainst;
  const forPercentage = Math.round(
    (result.avgVotingPowerFor / totalVotes) * 100
  );

  const getFundingTypeStyle = (fundingType: string) => {
    switch (fundingType) {
      case "EXT2Y":
        return "bg-[#008425]/60 text-wash";
      case "EXT1Y":
        return "bg-[#008425]/20 text-positive";
      case "STD":
      case "STD2Y":
        return "bg-[#008425]/10 text-[#008425]";
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
                  fundingType !== "None" ? (
                    <>
                      <div
                        className={cn(
                          "border px-2 py-1 rounded-sm font-semibold border-[#008425] w-14",
                          getFundingTypeStyle(fundingType)
                        )}
                      >
                        {fundingType}
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
                  ) : fundingType === "None" ? (
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
            <>
              {!isNoneBelow ? (
                <>
                  <Accordion type="single" collapsible>
                    <div className="py-4">
                      <AccordionItem
                        value="standard"
                        className="border-none w-full"
                      >
                        <AccordionTrigger className="p-0 pr-2 hover:no-underline">
                          <div className="flex justify-between items-center w-[calc(100%-1.5rem)]">
                            <span className="text-xs font-semibold w-1/3">
                              Standard ask
                            </span>
                            <div className="text-positive font-semibold">
                              {result.fundingType === "STD2Y" ? (
                                <span className="flex items-center gap-1 w-20 justify-end">
                                  2Y{" "}
                                  <Check strokeWidth={4} className="h-3 w-3" />
                                </span>
                              ) : result.fundingType === "STD" ? (
                                <span className="flex items-center gap-1 w-20 justify-end">
                                  1Y{" "}
                                  <Check strokeWidth={4} className="h-3 w-3" />
                                </span>
                              ) : (
                                <div className="flex items-center gap-1 w-20 justify-end">
                                  <X
                                    strokeWidth={4}
                                    className="h-3 w-3 text-negative"
                                  />
                                </div>
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-xs font-semibold w-1/3 text-right",
                                fontMapper[
                                  ui?.customization?.tokenAmountFont || ""
                                ]?.variable
                              )}
                            >
                              {fundingInfo.std.toLocaleString()}/y
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent parentClassName="overflow-visible">
                          <OptionRowDetails
                            result={result}
                            extendedResult={extendedResult}
                            isProposalActive={isProposalActive}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="extended"
                        className="border-none w-full"
                      >
                        <AccordionTrigger
                          className="[&[disabled]>svg]:hidden [&[disabled]]:opacity-50 [&[disabled]]:cursor-not-allowed p-0 pt-3 mt-3 pr-2 border-t border-line hover:no-underline"
                          disabled={!extendedResult}
                        >
                          <div className="flex justify-between items-center w-[calc(100%-1.5rem)]">
                            <span className="text-xs font-semibold w-1/3">
                              Extended ask
                            </span>
                            <div className="text-positive font-semibold">
                              {extendedResult?.fundingType === "EXT2Y" ? (
                                <span className="flex items-center gap-1 w-20 justify-end">
                                  2Y{" "}
                                  <Check strokeWidth={4} className="h-3 w-3" />
                                </span>
                              ) : extendedResult?.fundingType === "EXT1Y" ? (
                                <span className="flex items-center gap-1 w-20 justify-end">
                                  1Y{" "}
                                  <Check strokeWidth={4} className="h-3 w-3" />
                                </span>
                              ) : fundingInfo.ext ? (
                                <div className="flex items-center gap-1 w-20 justify-end">
                                  <X
                                    strokeWidth={4}
                                    className="h-3 w-3 text-negative"
                                  />
                                </div>
                              ) : null}
                            </div>
                            <span
                              className={cn(
                                "text-xs font-semibold w-1/3 text-right",
                                fontMapper[
                                  ui?.customization?.tokenAmountFont || ""
                                ]?.variable
                              )}
                            >
                              {fundingInfo.ext
                                ? `${fundingInfo.ext.toLocaleString()}/y`
                                : "N/A"}
                            </span>
                          </div>
                        </AccordionTrigger>
                        {extendedResult && (
                          <AccordionContent
                            className="pb-0"
                            parentClassName="overflow-visible"
                          >
                            <OptionRowDetails
                              result={extendedResult}
                              extendedResult={result}
                              isProposalActive={isProposalActive}
                            />
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    </div>
                  </Accordion>
                </>
              ) : (
                <OptionRowDetails
                  result={result}
                  isProposalActive={isProposalActive}
                />
              )}
            </>
          ) : null}
        </AccordionContent>
      </div>
    </AccordionItem>
  );
};

const OptionRowDetails = ({
  result,
  extendedResult,
  isProposalActive,
}: {
  result: CopelandResult;
  extendedResult?: CopelandResult;
  isProposalActive: boolean;
}) => {
  const totalVotes = result.avgVotingPowerFor + result.avgVotingPowerAgainst;
  const forPercentage = Math.round(
    (result.avgVotingPowerFor / totalVotes) * 100
  );
  const againstPercentage = 100 - forPercentage;
  const isNoneBelow = result.option === "NONE BELOW";

  return (
    <>
      <div
        className={cn("py-3 px-3", !isNoneBelow && "mt-4 border-y border-line")}
      >
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
        <div className="flex justify-between items-center mb-4 text-xs">
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

        {result.comparisons
          .filter(
            (comparison) =>
              !(
                (comparison.option1 === result.option &&
                  comparison.option2 === extendedResult?.option) ||
                (comparison.option2 === result.option &&
                  comparison.option1 === extendedResult?.option)
              )
          )
          .map((comparison, idx) => {
            const isOption1 = comparison.option1 === result.option;
            const opponentOption = isOption1
              ? comparison.option2
              : comparison.option1;
            const opponentName = opponentOption;
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
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="font-semibold truncate max-w-[100px] text-left text-xs">
                        {opponentName}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>{opponentName}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div
                  className={cn(
                    "text-right text-tertiary font-semibold flex items-center justify-end gap-1 text-xs",
                    !isWinner && "text-positive",
                    fontMapper[ui?.customization?.tokenAmountFont || ""]
                      ?.variable
                  )}
                >
                  <TokenAmountDecorated
                    amount={BigInt(Math.round(disfavorVotes))}
                    decimals={0}
                    hideCurrency
                    specialFormatting
                  />
                  <span className={cn("w-4", !lostAtLeastOne && "w-0")}>
                    {!isWinner && comparison.winner && "🏆"}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-right text-tertiary font-semibold flex items-center justify-end gap-1 text-xs",
                    isWinner && "text-positive",
                    fontMapper[ui?.customization?.tokenAmountFont || ""]
                      ?.variable
                  )}
                >
                  <TokenAmountDecorated
                    amount={BigInt(Math.round(favorVotes))}
                    decimals={0}
                    hideCurrency
                    specialFormatting
                  />
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

      <div className="flex flex-col items-start py-3 px-3 gap-1">
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
                    Ranked choice voting (using the Copeland method) compares
                    every candidate in head-to-head matchups. For each pair, a
                    candidate earns a point for a win. Candidates are stack
                    ranked based on number of wins. Ties are broken using
                    average voting support across every matchup.
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex justify-end flex-1 gap-2 w-full">
          <div className="bg-white border border-line rounded-sm px-2 py-1 font-semibold w-1/3 text-xs">
            {isProposalActive ? "~" : null}
            {result.totalLosses} {result.totalLosses === 1 ? "Loss" : "Losses"}
          </div>
          <div className="bg-white border border-line rounded-sm px-2 py-1 font-semibold w-1/3 text-xs">
            {isProposalActive ? "~" : null}
            {result.totalTies} {result.totalTies === 1 ? "Tie" : "Ties"}
          </div>
          <div className="bg-white border border-line rounded-sm px-2 py-1 font-semibold flex items-center text-positive w-1/3 text-xs">
            {isProposalActive ? "~" : null}
            {result.totalWins} {result.totalWins === 1 ? "Win" : "Wins"} 🏆
          </div>
        </div>
      </div>
    </>
  );
};
