import styles from "./proposalVotesBar.module.scss";
import { generateBarsForVote } from "@/lib/utils";

export default function ProposalVotesBar({ proposal }) {
  return (
    <div className={`flex flex-row justify-around ${styles.vote_bar_ticks}`}>
      {generateBarsForVote(
        proposal.proposalResults.for,
        proposal.proposalResults.abstain,
        proposal.proposalResults.against,
      ).map((value, idx) => {
        return <div key={`${idx}`} className={styles[value]} />;
      })}
    </div>
  );
}
