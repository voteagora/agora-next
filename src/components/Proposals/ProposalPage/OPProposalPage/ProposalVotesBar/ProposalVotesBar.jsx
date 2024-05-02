import { HStack } from "@/components/Layout/Stack";
import styles from "./proposalVotesBar.module.scss";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TokenAmountDisplay, generateBarsForVote } from "@/lib/utils";

export default function ProposalVotesBar({ proposal }) {
  return (
    <div>
      <TooltipProvider delayDuration={10}>
        <Tooltip>
          <TooltipTrigger asChild>
            <HStack
              justifyContent="justify-around"
              className={styles.vote_bar_ticks}
            >
              {generateBarsForVote(
                proposal.proposalResults.for,
                proposal.proposalResults.abstain,
                proposal.proposalResults.against
              ).map((value, idx) => {
                return <div key={`${idx}`} className={styles[value]} />;
              })}
            </HStack>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {TokenAmountDisplay({
                amount: proposal.proposalResults.abstain,
              })}{" "}
              abstained
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
