import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { useAccount } from "wagmi";
import { type Vote } from "@/app/api/common/votes/vote";
import VoterHoverCard from "../VoterHoverCard";
import { useState } from "react";
import {
  capitalizeFirstLetter,
  formatNumber,
  getBlockScanUrl,
  timeout,
} from "@/lib/utils";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import Tenant from "@/lib/tenant/tenant";
import { fontMapper } from "@/styles/fonts";

const { token, ui } = Tenant.current();

export default function ApprovalProposalSingleVote({ vote }: { vote: Vote }) {
  const { isAdvancedUser } = useIsAdvancedUser();
  const { advancedDelegators } = useConnectedDelegate();
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
  const [hash1, hash2] = transactionHash.split("|");

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
              <ENSAvatar ensName={voterAddress} className="w-5 h-5 mr-1" />
              <div className="text-primary">
                <ENSName address={voterAddress} />
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <TokenAmountDecorated
                        amount={weight}
                        hideCurrency
                        specialFormatting
                        className={
                          fontMapper[ui?.customization?.tokenAmountFont || ""]
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
        <HoverCardContent className="w-full shadow" side="left" sideOffset={3}>
          <VoterHoverCard
            address={vote.address}
            isAdvancedUser={isAdvancedUser}
            delegators={advancedDelegators}
          />
        </HoverCardContent>
      </HoverCard>
      <VStack className={"text-xs leading-4 mb-2"}>
        {params?.map((option: string, index: number) => (
          <p
            key={index}
            className={
              "sm:whitespace-nowrap text-ellipsis overflow-hidden pl-3 border-l border-line text-secondary font-medium"
            }
          >
            {++index}. {option}
          </p>
        ))}
        {support === "ABSTAIN" && (
          <p className="pl-3 border-l border-line text-secondary font-medium">
            {"Abstain"}
          </p>
        )}
      </VStack>
      {reason && (
        <div>
          <p className={"text-secondary font-medium text-xs leading-4"}>
            {reason}
          </p>
        </div>
      )}
    </VStack>
  );
}
