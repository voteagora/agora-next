import { Vote } from "@/app/api/common/votes/vote";
import { useAccount } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import {
  capitalizeFirstLetter,
  formatNumber,
  getBlockScanUrl,
  timeout,
  resolveIPFSUrl,
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
import { fontMapper } from "@/styles/fonts";
import Link from "next/link";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import useBlockCacheWrappedEns from "@/hooks/useBlockCacheWrappedEns";

const { token, ui } = Tenant.current();

function isOffchain(vote: Vote) {
  const proposalType = vote.proposalType || "";
  // Consider offchain if proposal type denotes offchain or if citizenType is present (Optimism citizens)
  return (
    !!vote.citizenType ||
    proposalType.includes("OFFCHAIN") ||
    proposalType === "SNAPSHOT"
  );
}

function getVoteTooltipText(vote: Vote) {
  const proposalType = vote.proposalType || "";
  const isOffchainVote = isOffchain(vote);
  const isOptimistic = proposalType.includes("OPTIMISTIC");

  // Amount string depends on offchain vs onchain
  const amountStr = formatNumber(
    vote.weight,
    isOffchainVote ? 0 : token.decimals,
    2,
    false,
    false
  );
  const supportText = capitalizeFirstLetter(vote.support);

  if (isOffchainVote) {
    // Offchain votes should be displayed as generic vote units
    const numeric = parseFloat((amountStr || "").toString().replace(/,/g, ""));
    const unit = numeric === 1 ? "Vote" : "Votes";
    const verb = isOptimistic ? "For" : "Voted";
    return `${amountStr} ${unit} ${verb} ${supportText}`;
  }

  // Onchain votes use token amount; keep Optimistic wording as "For"
  const verb = isOptimistic ? "For" : "Voted";
  return `${amountStr} ${token.symbol} ${verb} ${supportText}`;
}

// Using Lucide icons instead of Heroicons for better support of strokeWidth
const SUPPORT_TO_ICON: Record<Support, React.ReactNode> = {
  ["FOR"]: <CheckIcon strokeWidth={4} className="w-3 h-3 text-positive" />,
  ["AGAINST"]: <X strokeWidth={4} className="w-3 h-3 text-negative" />,
  ["ABSTAIN"]: <MinusIcon strokeWidth={4} className="w-3 h-3 text-tertiary" />,
};

export function ProposalSingleVote({ vote }: { vote: Vote }) {
  const { address: connectedAddress } = useAccount();
  const [hovered, setHovered] = useState(false);
  const [hash1, hash2] = vote.transactionHash?.split("|") || [];

  const isOffchainVote = isOffchain(vote);
  const { ui } = Tenant.current();

  const { data: ensFromBlockCache } = useBlockCacheWrappedEns({
    address: vote.address as `0x${string}`,
  });

  const _onOpenChange = async (open: boolean) => {
    if (open) {
      setHovered(open);
    } else {
      await timeout(100);
      setHovered(open);
    }
  };

  const name = vote.voterMetadata?.name || ensFromBlockCache?.name;

  const ensAvatar = () => {
    if (vote.voterMetadata?.image) {
      return (
        <div
          className={`overflow-hidden rounded-full flex justify-center items-center w-8 h-8`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vote.voterMetadata.image}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    if (ensFromBlockCache?.avatar) {
      const avatarUrl = resolveIPFSUrl(ensFromBlockCache.avatar);
      if (avatarUrl) {
        return (
          <div
            className={`overflow-hidden rounded-full flex justify-center items-center w-8 h-8`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        );
      }
    }
    return <ENSAvatar ensName={ensFromBlockCache?.name} className="w-8 h-8" />;
  };

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
                {ensAvatar()}
                <div className="flex flex-col">
                  <div className="text-primary font-bold hover:underline">
                    <Link
                      href={
                        vote.citizenType
                          ? `https://atlas.optimism.io/profile_by_voter_address/${vote.address}`
                          : `/delegates/${vote.address}`
                      }
                      target={vote.citizenType ? "_blank" : undefined}
                      rel={vote.citizenType ? "noopener noreferrer" : undefined}
                    >
                      {name ? name : <ENSName address={vote.address} />}
                    </Link>
                  </div>
                  {vote.citizenType && (
                    <div className="text-[9px] font-bold text-tertiary">
                      {vote.citizenType?.charAt(0).toUpperCase() +
                        vote.citizenType?.slice(1).toLowerCase()}
                    </div>
                  )}
                </div>
                {vote.address === connectedAddress?.toLowerCase() && (
                  <p className="text-primary">(you)</p>
                )}
                {hovered && (!!hash1 || !!hash2) && (
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
                <TooltipProvider delayDuration={0}>
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
                        <TokenAmountDecorated
                          amount={vote.weight}
                          hideCurrency
                          decimals={isOffchainVote ? 0 : undefined}
                          specialFormatting
                          className={
                            fontMapper[ui?.customization?.tokenAmountFont || ""]
                              ?.variable
                          }
                          icon={SUPPORT_TO_ICON[vote.support as Support]}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-4">
                      {getVoteTooltipText(vote)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </HStack>
            </HStack>
          </HoverCardTrigger>
        </HoverCard>
      </VStack>
      <pre className="text-xs font-medium text-secondary w-fit font-sans whitespace-pre-wrap [overflow-wrap:anywhere]">
        {vote.reason}
      </pre>
    </VStack>
  );
}
