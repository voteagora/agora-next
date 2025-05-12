import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { useAccount } from "wagmi";
import { SnapshotVote } from "@/app/api/common/votes/vote";
import { capitalizeFirstLetter, formatNumber } from "@/lib/utils";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import Tenant from "@/lib/tenant/tenant";
import { fontMapper } from "@/styles/fonts";
import Link from "next/link";

const { token, ui } = Tenant.current();

export default function CopelandProposalSingleVote({
  vote,
}: {
  vote: SnapshotVote;
}) {
  const { address } = useAccount();
  const {
    address: voterAddress,
    reason,
    votingPower: weight,
    choiceLabels,
  } = vote;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2 text-xs leading-4">
        <div className="text-primary font-semibold flex items-center">
          <ENSAvatar ensName={voterAddress} className="w-5 h-5 mr-1" />
          <div className="text-primary hover:underline">
            <Link href={`/delegates/${voterAddress}`}>
              <ENSName address={voterAddress} />
            </Link>
          </div>
          {address?.toLowerCase() === voterAddress && (
            <span className="text-primary">&nbsp;(you)</span>
          )}
        </div>
        <div className={"font-semibold text-primary"}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <TokenAmountDecorated
                    amount={String(Math.round(weight))}
                    decimals={0}
                    hideCurrency
                    specialFormatting
                    className={
                      fontMapper[ui?.customization?.tokenAmountFont || ""]
                        ?.variable
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-4 max-h-[300px] overflow-y-auto flex flex-col gap-2">
                <span>
                  {`${formatNumber(String(Math.round(vote.votingPower)), 0, 2, false, false)} ${token.symbol} Voted`}
                </span>
                <div className="flex flex-col gap-1">
                  {choiceLabels?.map((option: string, index: number) => (
                    <p key={index}>
                      {++index}. {option}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className={"flex flex-col text-xs leading-4 mb-2"}>
        {choiceLabels?.map((option: string, index: number) => (
          <p
            key={index}
            className={
              "sm:whitespace-nowrap text-ellipsis overflow-hidden pl-3 border-l border-line text-secondary font-medium"
            }
          >
            {++index}. {option}
          </p>
        ))}
      </div>
      {reason && (
        <div>
          <p className={"text-secondary font-medium text-xs leading-4"}>
            {reason}
          </p>
        </div>
      )}
    </div>
  );
}
