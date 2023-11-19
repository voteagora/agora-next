import Link from "next/link";
import ReactMarkdown from "react-markdown";
import styles from "./proposal.module.scss";
import { VStack } from "@/components/Layout/Stack";
import ProposalStatus from "../ProposalStatus/ProposalStatus";

export default function Proposal({ proposal }) {
  return (
    <div className={styles.proposal_row_on_chain}>
      <div className={styles.proposal_row_cell_primary}>
        <Link href={`/proposals/${proposal.id}`}>
          <VStack className={styles.cell_content} alignItems="items-start">
            <div className={styles.cell_content_title}>
              <>
                Proposal by {proposal.proposer}
                <span className={styles.proposal_status}></span>
              </>
            </div>
            <div className={styles.cell_content_body}>
              {proposal.markdowntitle.length > 100
                ? `${proposal.markdowntitle.slice(0, 98)}...`
                : proposal.markdowntitle}
            </div>
          </VStack>
        </Link>
      </div>
      <div className={styles.proposal_row_cell}>
        <VStack className={styles.cell_content} alignItems="items-start">
          <div className={styles.cell_content_title}>Title</div>
          <div className={styles.cell_content_body}>
            <ProposalStatus proposal={proposal} />
          </div>
        </VStack>
      </div>
      <div className={styles.proposal_row_cell}>
        <VStack className={styles.cell_content} alignItems="items-start">
          <div className={styles.cell_content_title}>Vote ended 2 days ago</div>
          <div className={styles.cell_content_body}>8 Options</div>
        </VStack>
      </div>
    </div>
  );
}
