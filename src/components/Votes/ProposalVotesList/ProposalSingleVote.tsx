import { Vote } from "@/app/api/common/votes/vote";
import { useAccount } from "wagmi";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import VoteText from "../VoteText/VoteText";
import VoterHoverCard from "../VoterHoverCard";
import styles from "./proposalVotesList.module.scss";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl, timeout } from "@/lib/utils";
import { useState } from "react";

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

  return (
    <VStack key={vote.transactionHash} gap={2} className={styles.vote_row}>
      <VStack>
        <HoverCard
          openDelay={100}
          closeDelay={100}
          onOpenChange={(open) => _onOpenChange(open)}
        >
          <HoverCardTrigger>
            <HStack justifyContent="justify-between" className={styles.voter}>
              <HStack gap={1} alignItems="items-center">
                <HumanAddress address={vote.address} />
                {vote.address === connectedAddress?.toLowerCase() && (
                  <p>(you)</p>
                )}
                <VoteText support={vote.support} />
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
              <HStack alignItems="items-center" className={styles.vote_weight}>
                <TokenAmountDisplay amount={vote.weight} />
              </HStack>
            </HStack>
          </HoverCardTrigger>
          <HoverCardContent
            className="w-full shadow"
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
      <pre className={styles.vote_reason}>{vote.reason}</pre>
    </VStack>
  );
}
