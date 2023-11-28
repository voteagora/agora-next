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
    <div className="my-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HStack
              justifyContent="justify-evenly"
              className={styles.vote_bar_ticks}
            >
              {Array.from(
                generateBarsForVote(
                  proposal.proposalResults.for,
                  proposal.proposalResults.abstain,
                  proposal.proposalResults.against
                )
              ).map((value, idx) => (
                <div key={`${idx}`} className={styles[value]} />
              ))}
            </HStack>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {TokenAmountDisplay(
                proposal.proposalResults.abstain,
                18,
                "OP",
                2
              )}{" "}
              abstained
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
