import Link from "next/link";
import ReactMarkdown from "react-markdown";
import styles from "./proposal.module.scss";
import { VStack } from "@/components/Layout/Stack";
import ProposalStatus from "../ProposalStatus/ProposalStatus";

export default function Proposal({ proposal }) {
  return (
    <tr className={styles.proposal_row_on_chain}>
      <td className={styles.proposal_row_cell_primary}>
        <Link href={`/proposals/${proposal.id}`}>
          <VStack className={styles.cell_content} alignItems="items-start">
            <div className={styles.cell_content_title}>
              <>
                Proposal by {proposal.proposer}
                <span className={styles.proposal_status}></span>
              </>
            </div>
            <div className={styles.cell_content_body}>
              {proposal.markdowntitle}
            </div>
          </VStack>
        </Link>
      </td>
      <td className={styles.proposal_row_cell}>
        <VStack className={styles.cell_content} alignItems="items-start">
          <div className={styles.cell_content_title}>Title</div>
          <div className={styles.cell_content_body}>
            <ProposalStatus proposal={proposal} />
          </div>
        </VStack>
      </td>
    </tr>
  );
}
