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
  const [hash1, hash2] = vote.transactionHash.split("|");

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
        <HStack
          justifyContent="justify-between"
          className="font-semibold text-secondary"
        >
          <HStack gap={1} alignItems="items-center">
            <ENSAvatar ensName={data} className="w-5 h-5" />
            <div className="text-primary hover:underline">
              <Link href={`/delegates/${vote.address}`}>
                <ENSName address={vote.address} />
              </Link>
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
                      specialFormatting
                      className={
                        fontMapper[ui?.customization?.tokenAmountFont || ""]
                      }
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
      </VStack>
      <pre className="text-xs font-medium whitespace-pre-wrap text-secondary w-fit break-all font-sans">
        {vote.reason}
      </pre>
    </VStack>
  );
}
