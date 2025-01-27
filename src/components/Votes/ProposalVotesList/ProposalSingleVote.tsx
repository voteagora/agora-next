import { Vote } from "@/app/api/common/votes/vote";
import { useAccount, useEnsName } from "wagmi";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import VoterHoverCard from "../VoterHoverCard";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import {
  capitalizeFirstLetter,
  formatNumber,
  getBlockScanUrl,
  timeout,
} from "@/lib/utils";
import { useState } from "react";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { Support } from "@/lib/voteUtils";
import { CheckIcon, MinusIcon, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Tenant from "@/lib/tenant/tenant";

const { token } = Tenant.current();

// Using Lucide icons instead of Heroicons for better support of strokeWidth
const SUPPORT_TO_ICON: Record<Support, React.ReactNode> = {
  ["FOR"]: <CheckIcon strokeWidth={4} className="w-3 h-3 text-positive" />,
  ["AGAINST"]: <X strokeWidth={4} className="w-3 h-3 text-negative" />,
  ["ABSTAIN"]: <MinusIcon strokeWidth={4} className="w-3 h-3 text-tertiary" />,
};

export function ProposalSingleVote({
  vote,
  isAdvancedUser,
  delegators,
}: {
  vote: Vote;
  isAdvancedUser: boolean;
  delegators: string[] | null;
}) {
  const { address: connectedAddress } = useAccount();
  const [hovered, setHovered] = useState(false);
  const [hash1, hash2] = vote.transactionHash.split("|");

  const _onOpenChange = async (open: boolean) => {
    if (open) {
      setHovered(open);
    } else {
      await timeout(100);
      setHovered(open);
    }
  };

  const { data } = useEnsName({
    chainId: 1,
    address: vote.address as `0x${string}`,
  });

  return (
    <VStack
      key={vote.transactionHash}
      gap={2}
      className="text-xs text-tertiary px-0 py-1"
    >
      <VStack>
        <HoverCard
          openDelay={100}
          closeDelay={100}
          onOpenChange={(open) => _onOpenChange(open)}
        >
          <HoverCardTrigger>
            <HStack
              justifyContent="justify-between"
              className="font-semibold text-secondary"
            >
              <HStack gap={1} alignItems="items-center">
                <ENSAvatar ensName={data} className="w-5 h-5" />
                <div className="text-primary">
                  <ENSName address={vote.address} />
                </div>
                {vote.address === connectedAddress?.toLowerCase() && (
                  <p className="text-primary">(you)</p>
                )}
                {hovered && (
                  <>
                    <a
                      href={getBlockScanUrl(hash1)}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
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
              </HStack>
              <HStack alignItems="items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={
                          vote.support === "AGAINST"
                            ? "text-negative"
                            : vote.support === "FOR"
                              ? "text-positive"
                              : "text-tertiary"
                        }
                      >
                        <TokenAmountDisplay
                          amount={vote.weight}
                          useChivoMono
                          hideCurrency
                          specialFormatting
                          icon={SUPPORT_TO_ICON[vote.support as Support]}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-4">
                      {`${formatNumber(vote.weight, token.decimals, 2, false, false)} ${token.symbol} Voted ${capitalizeFirstLetter(vote.support)}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </HStack>
            </HStack>
          </HoverCardTrigger>
          <HoverCardContent
            className="w-full shadow hidden sm:block"
            side="left"
            sideOffset={3}
          >
            <VoterHoverCard
              address={vote.address}
              isAdvancedUser={isAdvancedUser}
              delegators={delegators}
            />
          </HoverCardContent>
        </HoverCard>
      </VStack>
      <pre className="text-xs font-medium whitespace-pre-wrap text-secondary w-fit break-all font-sans">
        {vote.reason}
      </pre>
    </VStack>
  );
}
