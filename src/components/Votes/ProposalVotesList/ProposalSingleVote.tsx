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

  return (
    <VStack key={vote.transactionHash} gap={2} className={styles.vote_row}>
      <VStack>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger>
            <HStack justifyContent="justify-between" className={styles.voter}>
              <HStack gap={1} alignItems="items-center">
                <HumanAddress address={vote.address} />
                {vote.address === connectedAddress?.toLowerCase() && (
                  <p>(you)</p>
                )}
                <VoteText support={vote.support} />
              </HStack>
              <HStack alignItems="items-center" className={styles.vote_weight}>
                <TokenAmountDisplay
                  amount={vote.weight}
                  decimals={18}
                  currency="OP"
                />
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
