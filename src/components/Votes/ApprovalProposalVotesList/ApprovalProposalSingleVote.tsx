import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { useAccount, useEnsName } from "wagmi";
import { type Vote } from "@/app/api/common/votes/vote";
import { useState } from "react";
import {
  capitalizeFirstLetter,
  formatNumber,
  getBlockScanUrl,
  timeout,
} from "@/lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import Tenant from "@/lib/tenant/tenant";
import { fontMapper } from "@/styles/fonts";
import Link from "next/link";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import Markdown from "@/components/shared/Markdown/Markdown";

const { token, ui } = Tenant.current();

export default function ApprovalProposalSingleVote({ vote }: { vote: Vote }) {
  const { address } = useAccount();
  const {
    address: voterAddress,
    params,
    support,
    reason,
    weight,
    transactionHash,
  } = vote;

  const [hovered, setHovered] = useState(false);
  const [hash1, hash2] = transactionHash?.split("|") || [];

  const { data } = useEnsName({
    chainId: 1,
    address: voterAddress as `0x${string}`,
  });

  const _onOpenChange = async (open: boolean) => {
    if (open) {
      setHovered(open);
    } else {
      await timeout(100);
      setHovered(open);
    }
  };

  return (
    <VStack>
      <HoverCard
        openDelay={100}
        closeDelay={100}
        onOpenChange={(open) => _onOpenChange(open)}
      >
        <HoverCardTrigger>
          <HStack
            alignItems="items-center"
            justifyContent="justify-between"
            className="mb-2 text-xs leading-4"
          >
            <div className="text-primary font-semibold flex items-center">
              <ENSAvatar ensName={data} className="w-5 h-5 mr-1" />
              <div className="text-primary hover:underline">
                <Link href={`/delegates/${voterAddress}`}>
                  <ENSName address={voterAddress} />
                </Link>
              </div>
              {address?.toLowerCase() === voterAddress && (
                <span className="text-primary">&nbsp;(you)</span>
              )}
              {hovered && (
                <>
                  <a
                    href={getBlockScanUrl(hash1)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                  </a>
                  {hash2 && (
                    <a
                      href={getBlockScanUrl(hash2)}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </>
              )}
            </div>
            <div className={"font-semibold text-primary"}>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <TokenAmountDecorated
                        amount={weight}
                        hideCurrency
                        specialFormatting
                        className={
                          fontMapper[ui?.customization?.tokenAmountFont || ""]
                            ?.variable
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-4">
                    {`${formatNumber(vote.weight, token.decimals, 2, false, false)} ${token.symbol} Voted ${capitalizeFirstLetter(vote.support)}`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </HStack>
        </HoverCardTrigger>
      </HoverCard>
      <VStack className={"text-xs leading-4 mb-2"}>
        {params?.map((option: string, index: number) => (
          <div
            key={index}
            className={
              "pl-3 border-l border-line text-secondary font-medium"
            }
          >
            <span className="mr-1">{++index}.</span>
            <span className="inline-block">
              <Markdown
                content={option}
                className="text-xs prose-a:text-xs prose-a:no-underline prose-p:text-xs"
                wrapperClassName="inline"
              />
            </span>
          </div>
        ))}
        {support === "ABSTAIN" && (
          <p className="pl-3 border-l border-line text-secondary font-medium">
            {"Abstain"}
          </p>
        )}
      </VStack>
      {reason && (
        <div>
          <p
            className={
              "text-secondary font-medium text-xs leading-4 whitespace-pre-wrap [overflow-wrap:anywhere]"
            }
          >
            {reason}
          </p>
        </div>
      )}
    </VStack>
  );
}
