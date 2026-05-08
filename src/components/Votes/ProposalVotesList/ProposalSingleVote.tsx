import { Vote } from "@/app/api/common/votes/vote";
import { useAccount } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import {
  capitalizeFirstLetter,
  cn,
  formatNumber,
  getBlockScanUrl,
  resolveIPFSUrl,
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

const ZERO_VP_VOTE_TOOLTIP =
  "0 VP at snapshot. Vote is recorded onchain but does not affect the proposal outcome.";

const zeroVpTooltipContentClass =
  "max-w-[11rem] px-3 py-2 text-xs text-secondary leading-snug";

function isZeroVotingPowerVote(vote: Vote): boolean {
  const raw = (vote.weight ?? "").toString().trim().replace(/,/g, "") || "0";
  try {
    return BigInt(raw) === 0n;
  } catch {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) && n === 0;
  }
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

function supportIconForVote(support: Support, muteColors: boolean) {
  const cls = cn(
    "w-3 h-3",
    muteColors
      ? "text-tertiary"
      : support === "AGAINST"
        ? "text-negative"
        : support === "FOR"
          ? "text-positive"
          : "text-tertiary"
  );
  switch (support) {
    case "FOR":
      return <CheckIcon strokeWidth={4} className={cls} />;
    case "AGAINST":
      return <X strokeWidth={4} className={cls} />;
    default:
      return <MinusIcon strokeWidth={4} className={cls} />;
  }
}

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
  const zeroVpVote = isZeroVotingPowerVote(vote);

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
                <div
                  className={
                    zeroVpVote ? "shrink-0 opacity-50 grayscale" : "shrink-0"
                  }
                >
                  {ensAvatar()}
                </div>
                <div className="flex flex-col">
                  <div
                    className={
                      zeroVpVote
                        ? "text-tertiary font-bold cursor-default"
                        : "text-primary font-bold hover:underline"
                    }
                  >
                    {zeroVpVote ? (
                      <span className="text-tertiary">
                        {name ? name : <ENSName address={vote.address} />}
                      </span>
                    ) : (
                      <Link
                        href={
                          vote.citizenType
                            ? `https://atlas.optimism.io/voter_address_info/${vote.address}`
                            : `/delegates/${vote.address}`
                        }
                        target={vote.citizenType ? "_blank" : undefined}
                        rel={
                          vote.citizenType ? "noopener noreferrer" : undefined
                        }
                      >
                        {name ? name : <ENSName address={vote.address} />}
                      </Link>
                    )}
                  </div>
                  {vote.citizenType && (
                    <div className="text-[9px] font-bold text-tertiary">
                      {vote.citizenType?.charAt(0).toUpperCase() +
                        vote.citizenType?.slice(1).toLowerCase()}
                    </div>
                  )}
                </div>
                {vote.address === connectedAddress?.toLowerCase() && (
                  <p className={zeroVpVote ? "text-tertiary" : "text-primary"}>
                    (you)
                  </p>
                )}
                {hovered && (!!hash1 || !!hash2) && !zeroVpVote && (
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
                          zeroVpVote
                            ? "text-tertiary"
                            : vote.support === "AGAINST"
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
                          icon={supportIconForVote(
                            vote.support as Support,
                            zeroVpVote
                          )}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className={zeroVpVote ? zeroVpTooltipContentClass : "p-4"}
                    >
                      {zeroVpVote
                        ? ZERO_VP_VOTE_TOOLTIP
                        : getVoteTooltipText(vote)}
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
