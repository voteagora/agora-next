import { Vote } from "@/app/api/common/votes/vote";
import { useAccount, useEnsName } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
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
import { fontMapper } from "@/styles/fonts";
import Link from "next/link";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { useInView } from "react-intersection-observer";
import { useBnAndTidToHash } from "@/hooks/useBnAndTidToHash";

const { token, ui } = Tenant.current();

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
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { data: hash } = useBnAndTidToHash({
    blockNumber: Number(vote.blockNumber),
    transactionIndex: vote.transaction_index,
    enabled: inView && !!vote.blockNumber && !!vote.transaction_index,
  });

  const isOffchainVote = !!vote.citizenType;

  const { data } = useEnsName({
    chainId: 1,
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

  return (
    <div
      key={vote.transactionHash}
      className="flex flex-col gap-2 text-xs text-tertiary px-0 py-1"
      ref={ref}
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
                {vote.voterMetadata?.image ? (
                  <div
                    className={`overflow-hidden rounded-full flex justify-center items-center w-8 h-8`}
                  >
                    <img
                      src={vote.voterMetadata.image}
                      alt="avatar"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <ENSAvatar ensName={data} className="w-8 h-8" />
                )}
                <div className="flex flex-col">
                  <div className="text-primary font-bold hover:underline">
                    <Link href={`/delegates/${vote.address}`}>
                      {vote.voterMetadata?.name ? (
                        vote.voterMetadata.name
                      ) : (
                        <ENSName address={vote.address} />
                      )}
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
                    {hash1 || hash ? (
                      <a
                        href={getBlockScanUrl(hash1 || (hash as string))}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </a>
                    ) : null}
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
                      {`${formatNumber(vote.weight, isOffchainVote ? 0 : token.decimals, 2, false, false)} ${token.symbol} Voted ${capitalizeFirstLetter(vote.support)}`}
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
    </div>
  );
}
