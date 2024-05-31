import styles from "./proposalVotesBar.module.scss";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateBarsForVote, TokenAmountDisplay } from "@/lib/utils";

export default function ProposalVotesBar({ proposal }) {
  return (
    <div>
      <TooltipProvider delayDuration={10}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex flex-row justify-around ${styles.vote_bar_ticks}`}
            >
              {generateBarsForVote(
                proposal.proposalResults.for,
                proposal.proposalResults.abstain,
                proposal.proposalResults.against
              ).map((value, idx) => {
                return <div key={`${idx}`} className={styles[value]} />;
              })}
            </div>
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
